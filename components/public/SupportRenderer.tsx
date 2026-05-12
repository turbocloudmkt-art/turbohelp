'use client'

import { Fragment, useMemo, useState } from 'react'
import { Icon } from '@/components/public/Icon'

interface Block {
  id: string
  order: number
  title: string
  badge: string | null
  content: string
}

interface Props {
  blocks: Block[]
}

const VAR_REGEX = /\{\{([a-z_][a-z0-9_]*)\}\}/gi

function humanizeVar(key: string): string {
  return key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
}

function substitute(text: string, vars: Record<string, string>): string {
  return text.replace(VAR_REGEX, (full, key: string) => {
    const v = vars[key]?.trim()
    return v && v.length > 0 ? v : full
  })
}

export function SupportRenderer({ blocks }: Props) {
  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.order - b.order),
    [blocks]
  )

  const variableKeys = useMemo(() => {
    const set = new Set<string>()
    for (const b of sortedBlocks) {
      const matches = b.content.matchAll(VAR_REGEX)
      for (const m of matches) set.add(m[1])
    }
    return Array.from(set)
  }, [sortedBlocks])

  const [vars, setVars] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const k of variableKeys) initial[k] = ''
    return initial
  })

  const [copiedIdx, setCopiedIdx] = useState<number>(-1)
  const [copiedAll, setCopiedAll] = useState(false)

  async function copyBlock(text: string, idx: number) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(-1), 1500)
    } catch {
      // ignore
    }
  }

  async function copyAll() {
    const all = sortedBlocks.map((b) => substitute(b.content, vars)).join('\n\n')
    try {
      await navigator.clipboard.writeText(all)
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 1800)
    } catch {
      // ignore
    }
  }

  function renderTextWithVarHighlights(rendered: string) {
    // Render text com placeholders ainda visíveis destacados
    const parts = rendered.split(VAR_REGEX)
    // After split, parts alternate: [text, varName, text, varName, ...]
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <span key={i} className="tc-support__varSpan">{`{{${part}}}`}</span>
      }
      return <Fragment key={i}>{part}</Fragment>
    })
  }

  return (
    <div className="tc-support">
      {variableKeys.length > 0 && (
        <div className="tc-support__varsBox">
          <div className="tc-support__varsLbl">
            <Icon name="tag" size={11} /> Variáveis · preencha para personalizar
          </div>
          <div className="tc-support__varsGrid">
            {variableKeys.map((k) => (
              <div key={k} className="tc-support__varField">
                <span className="tc-support__varKey">{`{{${k}}}`}</span>
                <input
                  className="tc-support__varInput"
                  value={vars[k] ?? ''}
                  onChange={(e) => setVars((p) => ({ ...p, [k]: e.target.value }))}
                  placeholder={humanizeVar(k)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {sortedBlocks.map((b, i) => {
        const rendered = substitute(b.content, vars)
        const isCopied = copiedIdx === i
        return (
          <div key={b.id} className="tc-support__block">
            <div className="tc-support__blockHead">
              <div className="tc-support__blockNum">{i + 1}</div>
              <div className="tc-support__blockTitle">{b.title}</div>
              {b.badge && <span className="tc-support__blockBadge">{b.badge}</span>}
            </div>
            <div className="tc-support__blockBody">
              <button
                type="button"
                className={`tc-support__copyBtn ${isCopied ? 'is-copied' : ''}`}
                onClick={() => copyBlock(rendered, i)}
              >
                <Icon name={isCopied ? 'flame' : 'tag'} size={11} strokeWidth={2.4} />
                {isCopied ? 'Copiado' : 'Copiar'}
              </button>
              <div style={{ paddingRight: 80 }}>{renderTextWithVarHighlights(rendered)}</div>
            </div>
          </div>
        )
      })}

      <div className="tc-support__final">
        <Icon name="zap" size={18} style={{ color: 'var(--purple-700)' }} />
        <div style={{ flex: 1 }}>
          <strong style={{ color: 'var(--ink)' }}>Copiar resposta completa</strong>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
            Junta os {sortedBlocks.length} blocos com as variáveis preenchidas.
          </div>
        </div>
        <button type="button" className="tc-support__primaryBtn" onClick={copyAll}>
          <Icon name={copiedAll ? 'flame' : 'tag'} size={14} strokeWidth={2.4} />
          {copiedAll ? 'Copiado' : 'Copiar tudo'}
        </button>
      </div>
    </div>
  )
}
