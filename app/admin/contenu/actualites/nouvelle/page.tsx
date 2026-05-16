import { auth } from '@/lib/auth'
import { NewsForm } from '@/components/admin/NewsForm'
import { redirect } from 'next/navigation'

import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminNewsNew() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const authors = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark">Créer une actualité</h1>
        <p className="text-csf-muted">Ajouter un nouvel article aux actualités</p>
      </div>

      <NewsForm 
        authors={authors} 
        defaultValues={{ authorId: session.user.id }}
      />
    </div>
  )
}
