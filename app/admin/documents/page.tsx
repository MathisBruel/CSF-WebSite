import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminDocuments() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const documents = await prisma.document.findMany({
    orderBy: { createdAt: 'desc' },
    include: { uploadedBy: { select: { name: true } } },
  })

  const categories = [...new Set(documents.map((d) => d.category))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-csf-dark">Documents</h1>
          <p className="text-csf-muted">{documents.length} document{documents.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/documents/nouveau" className="btn-primary">
          + Nouveau document
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-csf-muted">Aucun document pour le moment</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category} className="space-y-3">
              <h2 className="font-bold text-csf-dark capitalize">{category}</h2>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {documents
                  .filter((d) => d.category === category)
                  .map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="font-medium text-csf-orange hover:underline">
                          {doc.title}
                        </a>
                        {doc.description && <p className="text-xs text-csf-muted mt-1">{doc.description}</p>}
                        <p className="text-xs text-csf-muted mt-1">
                          {doc.originalName} · {(doc.size / 1024).toFixed(1)} KB · {doc.uploadedBy.name} · {formatDate(doc.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className={`badge ${doc.public ? 'badge-green' : 'badge-gray'}`}>
                          {doc.public ? 'Public' : 'Privé'}
                        </span>
                        <Link
                          href={`/admin/documents/${doc.id}/edit`}
                          className="text-xs text-csf-orange hover:text-csf-orange-dark"
                        >
                          Modifier
                        </Link>
                        <a
                          href={doc.url}
                          download
                          className="text-xs text-csf-muted hover:text-csf-dark"
                        >
                          Télécharger
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
