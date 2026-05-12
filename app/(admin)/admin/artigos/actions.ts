'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { ArticleStatus, ArticleType } from '@prisma/client'

export interface SupportBlockInput {
  title: string
  badge?: string | null
  content: string
}

export async function saveArticle(data: {
  id?: string
  title: string
  slug: string
  type: ArticleType
  content: string
  excerpt: string
  videoUrl?: string | null
  supportBlocks?: SupportBlockInput[]
  metaTitle: string
  metaDesc: string
  status: ArticleStatus
  featured: boolean
  categoryId: string
  authorId: string
}) {
  const session = await auth()

  // Apenas EDITOR e SUPER_ADMIN podem criar/editar artigos (Q6).
  // WRITER fica restrito; VIEWER nunca.
  if (!session || (session.user.role !== 'EDITOR' && session.user.role !== 'SUPER_ADMIN')) {
    throw new Error('Não autorizado')
  }

  if (data.type === 'VIDEO' && !data.videoUrl?.trim()) {
    throw new Error('URL do vídeo é obrigatória para artigos do tipo VIDEO.')
  }

  if (data.type === 'SUPPORT' && (!data.supportBlocks || data.supportBlocks.length === 0)) {
    throw new Error('Adicione ao menos um bloco para artigos do tipo SUPORTE.')
  }

  // Normaliza supportBlocks: limpa se não for SUPPORT
  const blocks: SupportBlockInput[] = data.type === 'SUPPORT'
    ? (data.supportBlocks ?? []).filter((b) => b.title.trim() && b.content.trim())
    : []

  const payload = {
    title: data.title,
    slug: data.slug,
    type: data.type,
    content: data.content,
    excerpt: data.excerpt,
    videoUrl: data.type === 'VIDEO' ? (data.videoUrl?.trim() || null) : null,
    metaTitle: data.metaTitle,
    metaDesc: data.metaDesc,
    status: data.status,
    featured: data.featured,
    categoryId: data.categoryId,
    ...(data.status === 'PUBLISHED' ? { publishedAt: new Date() } : {}),
  }

  let articleId: string

  if (data.id) {
    await prisma.$transaction(async (tx) => {
      await tx.article.update({ where: { id: data.id! }, data: payload })
      await tx.supportBlock.deleteMany({ where: { articleId: data.id! } })
      if (blocks.length > 0) {
        await tx.supportBlock.createMany({
          data: blocks.map((b, i) => ({
            articleId: data.id!,
            order: i,
            title: b.title.trim(),
            badge: b.badge?.trim() || null,
            content: b.content,
          })),
        })
      }
    })
    articleId = data.id
  } else {
    const created = await prisma.article.create({
      data: {
        ...payload,
        authorId: data.authorId,
        supportBlocks: blocks.length > 0
          ? {
              create: blocks.map((b, i) => ({
                order: i,
                title: b.title.trim(),
                badge: b.badge?.trim() || null,
                content: b.content,
              })),
            }
          : undefined,
      },
    })
    articleId = created.id
  }

  revalidatePath('/ajuda')
  revalidatePath('/admin/artigos')
  revalidatePath(`/ajuda/[categoria]`, 'page')
  revalidatePath(`/ajuda/[categoria]/[slug]`, 'page')

  return { success: true, articleId }
}

export async function deleteArticles(ids: string[]) {
  const session = await auth()
  if (!session || (session.user.role !== 'EDITOR' && session.user.role !== 'SUPER_ADMIN')) {
    throw new Error('Permissão negada.')
  }

  await prisma.article.deleteMany({ where: { id: { in: ids } } })

  revalidatePath('/admin/artigos')
  return { success: true }
}
