import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/public/Sidebar'

export const dynamic = 'force-dynamic'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  let activeView: 'home' | 'category' | 'article' = 'home'
  let activeCategorySlug: string | undefined

  if (pathname.startsWith('/ajuda/')) {
    const parts = pathname.split('/').filter(Boolean)
    if (parts[1] && parts[1] !== 'busca') {
      activeCategorySlug = parts[1]
      activeView = parts.length >= 3 ? 'article' : 'category'
    }
  }

  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      icon: true,
      _count: { select: { articles: { where: { status: 'PUBLISHED' } } } },
    },
  })

  return (
    <div className="tc-shell">
      <Sidebar
        user={{ name: session.user.name, role: session.user.role }}
        categories={categories}
        activeView={activeView}
        activeCategorySlug={activeCategorySlug}
      />
      <main className="tc-shell__main">{children}</main>
    </div>
  )
}
