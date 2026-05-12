import { auth } from '@/lib/auth'
import { NewsForm } from '@/components/admin/NewsForm'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminNewsNew() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark">Créer une actualité</h1>
        <p className="text-csf-muted">Ajouter un nouvel article aux actualités</p>
      </div>

      <NewsForm />
    </div>
  )
}
