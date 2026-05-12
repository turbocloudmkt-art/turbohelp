'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Crumb {
  label: string
  href?: string
}

interface TopbarProps {
  crumbs?: Crumb[]
  initialQuery?: string
}

export function Topbar({ crumbs = [], initialQuery = '' }: TopbarProps) {
  const router = useRouter()
  const [q, setQ] = useState(initialQuery)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = q.trim()
    if (trimmed.length < 2) return
    router.push(`/ajuda/busca?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className="tc-topbar">
      <div className="tc-topbar__crumbs">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1
          const content = c.href && !isLast ? (
            <Link href={c.href} className="tc-topbar__crumbLink">{c.label}</Link>
          ) : (
            <span className={isLast ? 'tc-topbar__crumbActive' : undefined}>{c.label}</span>
          )
          return (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {content}
              {!isLast && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              )}
            </span>
          )
        })}
      </div>

      <form className="tc-topbar__search" onSubmit={submit}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          className="tc-topbar__searchInput"
          placeholder="Buscar artigo, categoria, tag..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </form>
    </div>
  )
}
