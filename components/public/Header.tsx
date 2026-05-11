'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SearchBar from '@/components/public/SearchBar'
import { UserMenu } from '@/components/public/UserMenu'
import type { UserRole } from '@prisma/client'

interface HeaderProps {
  user: { name: string; role: UserRole }
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <header className="site-header">
      <div className="container">
        <div className="site-header__inner">
          <Link href="/" className="site-header__logo">
            Turbo<span>Cloud</span> Ajuda
          </Link>

          {!isHome && (
            <div className="site-header__center">
              <div className="site-header__search">
                <SearchBar />
              </div>
            </div>
          )}

          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}
