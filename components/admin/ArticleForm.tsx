'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SlugInput } from './SlugInput'
import { Editor } from './Editor'
import { saveArticle, type SupportBlockInput } from '@/app/(admin)/admin/artigos/actions'
import type { ArticleStatus, ArticleType } from '@prisma/client'
import { askGeminiReview } from '@/app/actions/ai'

interface CategoriaCompact {
  id: string
  name: string
}

interface SupportBlockUI {
  title: string
  badge: string
  content: string
}

interface ArticleData {
  id?: string
  title: string
  slug: string
  type: ArticleType
  excerpt: string
  content: string
  videoUrl: string
  supportBlocks: SupportBlockUI[]
  metaTitle: string
  metaDesc: string
  status: ArticleStatus
  featured: boolean
  categoryId: string
}

interface FormProps {
  article?: Partial<ArticleData>
  categories: CategoriaCompact[]
  userRole: string
  authorId: string
}

const DEFAULT_BLOCK: SupportBlockUI = { title: '', badge: '', content: '' }

const TYPE_OPTIONS: { value: ArticleType; label: string; desc: string }[] = [
  { value: 'TEXT', label: 'Texto', desc: 'Artigo HTML rico (Tiptap)' },
  { value: 'SUPPORT', label: 'Suporte', desc: 'Resposta canned em blocos (com variáveis)' },
  { value: 'VIDEO', label: 'Vídeo', desc: 'YouTube/Vimeo + descrição' },
]

export function ArticleForm({ article, categories, userRole, authorId }: FormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [aiLoading, setAiLoading] = useState(false)
  const [aiInstruction, setAiInstruction] = useState('Avalie o conteúdo reparando os erros ortográficos e coesão, alterando as menções da antiga empresa para TurboCloud e gere um resumo/slug adequados.')

  const [formData, setFormData] = useState<ArticleData>({
    id: article?.id,
    title: article?.title || '',
    slug: article?.slug || '',
    type: article?.type || 'TEXT',
    categoryId: article?.categoryId || (categories.length > 0 ? categories[0].id : ''),
    status: article?.status || 'DRAFT',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
    videoUrl: article?.videoUrl || '',
    supportBlocks: article?.supportBlocks?.length ? article.supportBlocks : [{ ...DEFAULT_BLOCK, title: 'Saudação e reconhecimento', badge: 'Abertura' }],
    metaTitle: article?.metaTitle || '',
    metaDesc: article?.metaDesc || '',
    featured: article?.featured || false,
  })

  function handleChange<K extends keyof ArticleData>(field: K, value: ArticleData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function updateBlock(idx: number, patch: Partial<SupportBlockUI>) {
    setFormData((prev) => ({
      ...prev,
      supportBlocks: prev.supportBlocks.map((b, i) => (i === idx ? { ...b, ...patch } : b)),
    }))
  }

  function addBlock() {
    setFormData((prev) => ({
      ...prev,
      supportBlocks: [...prev.supportBlocks, { ...DEFAULT_BLOCK }],
    }))
  }

  function removeBlock(idx: number) {
    setFormData((prev) => ({
      ...prev,
      supportBlocks: prev.supportBlocks.filter((_, i) => i !== idx),
    }))
  }

  function moveBlock(idx: number, dir: -1 | 1) {
    setFormData((prev) => {
      const next = [...prev.supportBlocks]
      const target = idx + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return { ...prev, supportBlocks: next }
    })
  }

  async function handleAiReview() {
    if (!formData.title && !formData.content) {
      alert('Escreva pelo menos o título e conteúdo para que a IA possa avaliar.')
      return
    }
    setAiLoading(true)
    setError('')
    try {
      const response = await askGeminiReview(aiInstruction, formData.title, formData.slug, formData.excerpt, formData.content)
      const updatedData = { ...formData, title: response.title, slug: response.slug, excerpt: response.excerpt, content: response.content }
      setFormData(updatedData)
      const result = await saveArticle({
        ...updatedData,
        supportBlocks: updatedData.supportBlocks as SupportBlockInput[],
        authorId,
      })
      alert('Revisão da IA concluída! Mudanças foram aplicadas e salvas.')
      if (!formData.id && result.articleId) {
        router.push(`/admin/artigos/${result.articleId}`)
      } else {
        window.location.reload()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await saveArticle({
        ...formData,
        supportBlocks: formData.supportBlocks as SupportBlockInput[],
        authorId,
      })
      router.push('/admin/artigos')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar artigo.')
      setLoading(false)
    }
  }

  const isText = formData.type === 'TEXT'
  const isSupport = formData.type === 'SUPPORT'
  const isVideo = formData.type === 'VIDEO'

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* TYPE SELECTOR */}
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <label className="form-label" style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
            Tipo de conteúdo
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {TYPE_OPTIONS.map((opt) => {
              const active = formData.type === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleChange('type', opt.value)}
                  style={{
                    flex: 1,
                    minWidth: 180,
                    padding: '14px 18px',
                    borderRadius: 9,
                    border: '1px solid ' + (active ? 'var(--color-primary)' : 'var(--color-border)'),
                    background: active ? 'var(--color-primary-light)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: active ? 'var(--color-primary)' : 'var(--text-primary)' }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                    {opt.desc}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* AI Helper — só faz sentido para TEXT */}
        {isText && (
          <div style={{ backgroundColor: 'rgba(0, 208, 132, 0.05)', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-primary)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '20px' }}>✨</span>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--color-primary)' }}>Assistente IA (Gemini)</h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              O Gemini pode analisar todo o conteúdo abaixo e reescrever partes conforme suas instruções antes de salvar.
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <textarea
                value={aiInstruction}
                onChange={(e) => setAiInstruction(e.target.value)}
                className="form-input"
                style={{ flex: 1, minHeight: '60px', fontSize: '14px', borderColor: 'var(--color-primary)' }}
                placeholder="Descreva o que a IA deve revisar..."
              />
              <button
                type="button"
                onClick={handleAiReview}
                disabled={aiLoading}
                className="button"
                style={{ padding: '12px 24px', backgroundColor: 'var(--color-primary)', color: '#fff', height: '60px', fontWeight: 'bold', borderRadius: 8, border: 'none', cursor: aiLoading ? 'wait' : 'pointer' }}
              >
                {aiLoading ? '⏳ Analisando...' : 'Revisar Conteúdo'}
              </button>
            </div>
          </div>
        )}

        {/* CAMPOS COMUNS */}
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Título do artigo</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ex: Erro 500 após instalação de plugin"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <SlugInput
              label="Slug (URL)"
              sourceValue={formData.title}
              initialSlug={formData.slug}
              onChange={(slug) => handleChange('slug', slug)}
            />
          </div>

          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
              {isSupport ? 'Contexto / quando usar' : 'Resumo / Excerpt'}
            </label>
            <textarea
              className="form-input"
              value={formData.excerpt}
              onChange={(e) => handleChange('excerpt', e.target.value)}
              rows={3}
              placeholder={isSupport ? 'Em que situação o atendente deve usar essa resposta?' : 'Breve descrição do que se trata...'}
            />
          </div>
        </div>

        {/* VIDEO URL */}
        {isVideo && (
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
              URL do vídeo (YouTube ou Vimeo)
            </label>
            <input
              type="url"
              className="form-input"
              value={formData.videoUrl}
              onChange={(e) => handleChange('videoUrl', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              required={isVideo}
            />
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8, margin: '8px 0 0' }}>
              Aceita YouTube (watch, youtu.be, embed) ou Vimeo. O player é gerado automaticamente.
            </p>
          </div>
        )}

        {/* CONTEÚDO PRINCIPAL — TEXT ou descrição do VIDEO */}
        {(isText || isVideo) && (
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
              {isVideo ? 'Descrição do vídeo (opcional)' : 'Conteúdo principal'}
            </label>
            <Editor
              content={formData.content}
              onChange={(html) => handleChange('content', html)}
            />
          </div>
        )}

        {/* BLOCOS DE SUPORTE */}
        {isSupport && (
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Blocos da resposta</h2>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
                  Use <code style={{ background: 'var(--color-primary-light)', padding: '1px 5px', borderRadius: 3, fontFamily: 'var(--font-mono)' }}>{'{{nome_da_variavel}}'}</code> no texto para inserir variáveis editáveis (sem espaços, letras minúsculas).
                </p>
              </div>
            </div>

            {formData.supportBlocks.map((b, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 12,
                  background: 'var(--bg-secondary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 5,
                    background: 'var(--color-primary)', color: 'var(--color-accent)',
                    display: 'grid', placeItems: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                  }}>
                    {idx + 1}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Bloco {idx + 1}</span>

                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => moveBlock(idx, -1)}
                      disabled={idx === 0}
                      title="Mover para cima"
                      style={iconBtnStyle(idx === 0)}
                    >↑</button>
                    <button
                      type="button"
                      onClick={() => moveBlock(idx, 1)}
                      disabled={idx === formData.supportBlocks.length - 1}
                      title="Mover para baixo"
                      style={iconBtnStyle(idx === formData.supportBlocks.length - 1)}
                    >↓</button>
                    <button
                      type="button"
                      onClick={() => removeBlock(idx)}
                      disabled={formData.supportBlocks.length === 1}
                      title="Remover bloco"
                      style={{ ...iconBtnStyle(formData.supportBlocks.length === 1), color: '#dc2626' }}
                    >✕</button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Título do bloco *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={b.title}
                      onChange={(e) => updateBlock(idx, { title: e.target.value })}
                      placeholder="Ex: Saudação e reconhecimento"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Badge (opcional)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={b.badge}
                      onChange={(e) => updateBlock(idx, { badge: e.target.value })}
                      placeholder="Ex: Abertura"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Texto do bloco *
                  </label>
                  <textarea
                    className="form-input"
                    value={b.content}
                    onChange={(e) => updateBlock(idx, { content: e.target.value })}
                    rows={6}
                    placeholder={`Olá {{nome_cliente}},\n\nDescreva aqui o conteúdo...`}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.6 }}
                    required
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addBlock}
              style={{
                width: '100%',
                padding: '12px',
                border: '1.5px dashed var(--color-border)',
                background: 'transparent',
                borderRadius: 9,
                color: 'var(--color-primary)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Adicionar bloco
            </button>
          </div>
        )}

        {/* SEO */}
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Otimização para SEO</h2>
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Meta Title (Opcional)</label>
            <input
              type="text"
              className="form-input"
              value={formData.metaTitle}
              onChange={(e) => handleChange('metaTitle', e.target.value)}
              placeholder="Deixe em branco para usar o título principal"
            />
          </div>
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Meta Description (Opcional)</label>
            <textarea
              className="form-input"
              value={formData.metaDesc}
              onChange={(e) => handleChange('metaDesc', e.target.value)}
              rows={3}
              placeholder="Deixe em branco para usar o resumo"
            />
          </div>
        </div>
      </div>

      {/* SIDE PANEL */}
      <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '24px', flexShrink: 0, position: 'sticky', top: '32px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Configurações</h2>

          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Status</label>
            <select
              className="form-input"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as ArticleStatus)}
            >
              <option value="DRAFT">Rascunho</option>
              <option value="REVIEW">Em revisão</option>
              <option value="PUBLISHED">Publicado</option>
              <option value="ARCHIVED">Arquivado</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Categoria</label>
            <select
              className="form-input"
              value={formData.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
              required
            >
              <option value="" disabled>Selecione...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="featuredToggle"
              checked={formData.featured}
              onChange={(e) => handleChange('featured', e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="featuredToggle" style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              Destacar na página inicial
            </label>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '12px', color: '#dc2626', fontSize: '14px' }}>
            <strong style={{ display: 'block', marginBottom: '4px' }}>Erro</strong>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              flex: 1, padding: '12px', backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)', border: '1px solid var(--color-border)',
              borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ flex: 1, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </form>
  )
}

function iconBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: 28,
    height: 28,
    border: '1px solid var(--color-border)',
    background: '#fff',
    color: disabled ? 'var(--text-tertiary)' : 'var(--text-secondary)',
    borderRadius: 6,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 14,
    fontWeight: 600,
    opacity: disabled ? 0.5 : 1,
  }
}
