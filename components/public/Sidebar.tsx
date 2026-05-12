import Link from 'next/link'
import { SignOutButton } from '@/components/public/SignOutButton'
import { Icon } from '@/components/public/Icon'
import { iconForSlug } from '@/lib/categoryIcon'
import type { UserRole } from '@prisma/client'

interface Category {
  id: string
  slug: string
  name: string
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
            <Icon name="layout-dashboard" size={16} />
            <span>Início</span>
          </Link>

          {/* Acesso rápido — itens mockados, sem destino real (Fase 2) */}
          <span className="tc-sb__navItem tc-sb__navItem--mock" aria-disabled="true">
            <Icon name="trending-up" size={16} />
            <span>Mais acessados</span>
            <span className="tc-sb__navBadge">24h</span>
          </span>
          <span className="tc-sb__navItem tc-sb__navItem--mock" aria-disabled="true">
            <Icon name="clock" size={16} />
            <span>Recentes</span>
          </span>
          <span className="tc-sb__navItem tc-sb__navItem--mock" aria-disabled="true">
            <Icon name="bookmark" size={16} />
            <span>Meus favoritos</span>
            <span className="tc-sb__navBadge">0</span>
          </span>
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
                <div className="tc-sb__catIcon">
                  <Icon name={iconForSlug(cat.slug)} size={14} strokeWidth={2} />
                </div>
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
            <Icon name="settings" size={14} />
          </Link>
        )}
        <SignOutButton />
      </div>
    </aside>
  )
}
