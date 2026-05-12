import { auth } from '@/lib/auth'
import { DocumentForm } from '@/components/admin/DocumentForm'
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

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 mb-6">
        <label className="form-label">Fichier <span className="text-red-500">*</span></label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-csf-orange transition-colors cursor-pointer">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return

              const formData = new FormData()
              formData.append('file', file)

              const res = await fetch('/api/admin/documents/upload', {
                method: 'POST',
                body: formData,
              })

              if (res.ok) {
                const data = await res.json()
                window.location.href = `/admin/documents/${data.id}/edit?fileName=${file.name}`
              }
            }}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <p className="font-medium text-csf-dark">Cliquez pour télécharger</p>
            <p className="text-sm text-csf-muted mt-1">ou glissez-déposez votre fichier</p>
          </label>
        </div>
      </div>

      <DocumentForm />
    </div>
  )
}
