import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/public/Sidebar'

export const dynamic = 'force-dynamic'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

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
      />
      <main className="tc-shell__main">{children}</main>
    </div>
  )
}
