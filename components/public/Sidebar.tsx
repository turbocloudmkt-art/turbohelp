import Link from 'next/link'
import { SignOutButton } from '@/components/public/SignOutButton'
import type { UserRole } from '@prisma/client'

interface Category {
  id: string
  slug: string
  name: string
  icon: string | null
  _count: { articles: number }
}

interface SidebarProps {
  user: { name: string; role: UserRole }
  categories: Category[]
  activeView?: 'home' | 'category' | 'article'
  activeCategorySlug?: string
}

const roleLabel: Record<UserRole, string> = {
  SUPER_ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  WRITER: 'EDITOR',
  VIEWER: 'USUÁRIO',
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Sidebar({ user, categories, activeView = 'home', activeCategorySlug }: SidebarProps) {
  const canAccessAdmin = user.role !== 'VIEWER'

  return (
    <aside className="tc-sb">
      <Link href="/" className="tc-sb__brand">
        <div className="tc-sb__brandMark">T</div>
        <div>
          <div className="tc-sb__brandText">TurboCloud</div>
          <div className="tc-sb__brandSub">Help · Internal</div>
        </div>
      </Link>

      <div className="tc-sb__scroll">
        <div className="tc-sb__nav">
          <Link href="/" className={`tc-sb__navItem ${activeView === 'home' ? 'is-active' : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </svg>
            <span>Início</span>
          </Link>
        </div>

        <div className="tc-sb__sectionLabel">
          <span>Categorias</span>
          <span className="count">{categories.length}</span>
        </div>

        <div className="tc-sb__cats">
          {categories.map((cat) => {
            const isActive = activeView === 'category' && activeCategorySlug === cat.slug
            return (
              <Link
                key={cat.id}
                href={`/ajuda/${cat.slug}`}
                className={`tc-sb__catRow ${isActive ? 'is-active' : ''}`}
              >
                <div className="tc-sb__catIcon">{cat.icon || '📁'}</div>
                <span className="tc-sb__catName">{cat.name}</span>
                <span className="tc-sb__catCount">{cat._count.articles}</span>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="tc-sb__footer">
        <div className="tc-sb__avatar">{initials(user.name)}</div>
        <div className="tc-sb__userInfo">
          <div className="tc-sb__userName">{user.name}</div>
          <div className="tc-sb__userRole">{roleLabel[user.role]}</div>
        </div>
        {canAccessAdmin && (
          <Link href="/admin" className="tc-sb__iconBtn" title="Painel">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
        )}
        <SignOutButton />
      </div>
    </aside>
  )
}
