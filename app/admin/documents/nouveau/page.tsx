import { auth } from '@/lib/auth'
import { DocumentUpload } from '@/components/admin/DocumentUpload'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminDocumentsNew() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark">Télécharger un document</h1>
        <p className="text-csf-muted">Ajouter un nouveau document téléchargeable</p>
      </div>

      <DocumentUpload />
    </div>
  )
}
