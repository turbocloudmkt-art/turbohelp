'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GoogleGenAI, Type, Schema } from '@google/genai'

const RETENTION_DAYS = 60
const WINDOW_DAYS = 30
const MIN_DISTINCT_VARIANTS = 3

export type ContentSuggestion = {
  tema: string
  intencaoDoUsuario: string
  evidencia: string[]
  sugestaoDeArtigo: {
    titulo: string
    excerpt: string
    topicos: string[]
  }
  prioridade: 'alta' | 'media' | 'baixa'
}

/**
 * Remove registros mais antigos que RETENTION_DAYS.
 * Roda no acesso da página admin (oportunista, sem cron).
 */
export async function pruneOldSearchActivities() {
  const session = await auth()
  if (!session || session.user.role !== 'SUPER_ADMIN') return { deleted: 0 }

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000)
  const res = await prisma.searchActivity.deleteMany({
    where: { createdAt: { lt: cutoff } },
  })
  return { deleted: res.count }
}

/**
 * Analisa pesquisas sem resultado dos últimos WINDOW_DAYS dias e pede ao Gemini
 * sugestões de conteúdo. Só envia grupos com ≥ MIN_DISTINCT_VARIANTS variações
 * distintas (queries diferentes que normalizam pro mesmo normalizedQ).
 */
export async function analyzeSearchActivities(): Promise<{
  suggestions: ContentSuggestion[]
  groupsConsidered: number
  groupsSkipped: number
}> {
  const session = await auth()
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    throw new Error('Não autorizado')
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada no servidor.')
  }

  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000)

  // Busca pesquisas sem resultado na janela
  const failed = await prisma.searchActivity.findMany({
    where: {
      resultsCount: 0,
      createdAt: { gte: since },
    },
    select: { query: true, normalizedQ: true, createdAt: true, userId: true },
  })

  // Agrupa por normalizedQ e exige ≥ MIN_DISTINCT_VARIANTS variações distintas
  const groups = new Map<
    string,
    { variants: Set<string>; total: number; lastSeen: Date; users: Set<string> }
  >()
  for (const row of failed) {
    const g = groups.get(row.normalizedQ) ?? {
      variants: new Set<string>(),
      total: 0,
      lastSeen: row.createdAt,
      users: new Set<string>(),
    }
    g.variants.add(row.query.trim())
    g.total += 1
    g.users.add(row.userId)
    if (row.createdAt > g.lastSeen) g.lastSeen = row.createdAt
    groups.set(row.normalizedQ, g)
  }

  let groupsConsidered = 0
  let groupsSkipped = 0
  const eligible: Array<{
    normalizedQ: string
    variants: string[]
    total: number
    distinctUsers: number
  }> = []
  for (const [normalizedQ, g] of groups) {
    if (g.variants.size >= MIN_DISTINCT_VARIANTS) {
      eligible.push({
        normalizedQ,
        variants: [...g.variants],
        total: g.total,
        distinctUsers: g.users.size,
      })
      groupsConsidered += 1
    } else {
      groupsSkipped += 1
    }
  }

  if (eligible.length === 0) {
    return { suggestions: [], groupsConsidered: 0, groupsSkipped }
  }

  // Carrega títulos de artigos existentes (publicados) para evitar duplicidade
  const existingArticles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    select: { title: true, slug: true },
    take: 200,
  })

  const ai = new GoogleGenAI({ apiKey })

  const prompt = `
Você é um analista de comportamento de busca em uma central de ajuda (knowledge base).
Recebeu uma lista de PESQUISAS REALIZADAS POR USUÁRIOS QUE NÃO RETORNARAM RESULTADOS nos últimos ${WINDOW_DAYS} dias.

Cada item abaixo representa um GRUPO de pesquisas semanticamente similares (mesma raiz normalizada),
com as variações distintas que os usuários digitaram, contagem total e quantos usuários distintos pesquisaram.

GRUPOS DE PESQUISAS SEM RESULTADO:
${JSON.stringify(eligible, null, 2)}

ARTIGOS JÁ PUBLICADOS NA BASE (NÃO sugira temas que já existem):
${JSON.stringify(existingArticles.map((a) => a.title), null, 2)}

SUA TAREFA:
1. Analise os grupos buscando INTENÇÃO REAL do usuário (o que ele realmente queria saber).
2. Agrupe semanticamente quando fizer sentido (ex: "como faturar" e "emitir nota fiscal" podem ser o mesmo tema).
3. IGNORE grupos que parecem ruído (digitação aleatória, testes, gibberish).
4. Para cada tema com intenção CLARA e RECORRENTE, sugira um artigo a ser criado.
5. Não sugira artigos que já existem na base.
6. Priorize por: volume total + quantidade de usuários distintos + clareza da intenção.
7. Se nenhum grupo tiver intenção clara, retorne lista vazia.

Sempre responda em Português do Brasil (PT-BR).
  `.trim()

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      suggestions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            tema: { type: Type.STRING, description: 'Nome curto do tema identificado' },
            intencaoDoUsuario: {
              type: Type.STRING,
              description: 'Descrição da necessidade real por trás das pesquisas',
            },
            evidencia: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Termos pesquisados que evidenciam esta intenção',
            },
            sugestaoDeArtigo: {
              type: Type.OBJECT,
              properties: {
                titulo: { type: Type.STRING, description: 'Título sugerido do artigo' },
                excerpt: {
                  type: Type.STRING,
                  description: 'Resumo curto otimizado para SEO (máx 160 chars)',
                },
                topicos: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Tópicos/seções que o artigo deveria cobrir',
                },
              },
              required: ['titulo', 'excerpt', 'topicos'],
            },
            prioridade: {
              type: Type.STRING,
              description: 'alta | media | baixa',
            },
          },
          required: ['tema', 'intencaoDoUsuario', 'evidencia', 'sugestaoDeArtigo', 'prioridade'],
        },
      },
    },
    required: ['suggestions'],
  }

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.3,
      },
    })

    if (!result.text) {
      throw new Error('Resposta vazia da IA')
    }

    const parsed = JSON.parse(result.text) as { suggestions: ContentSuggestion[] }
    return {
      suggestions: parsed.suggestions ?? [],
      groupsConsidered,
      groupsSkipped,
    }
  } catch (err: any) {
    throw new Error('Falha na comunicação com o Gemini: ' + err.message)
  }
}
