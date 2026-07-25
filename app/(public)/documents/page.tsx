import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Documents' }

const CATEGORY_LABELS: Record<string, string> = {
  rules: 'Règlements',
  general: 'Général',
  forms: 'Formulaires',
  guides: 'Guides',
  other: 'Autre',
}

function FileIcon({ mimeType }: { mimeType: string }) {
  const isPdf = mimeType === 'application/pdf'
  return (
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isPdf ? 'bg-red-100' : 'bg-blue-100'}`}>
      <svg className={`w-5 h-5 ${isPdf ? 'text-red-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
  )
}

export default async function DocumentsPage() {
  const documents = await prisma.document.findMany({
    where: { public: true },
    orderBy: [{ category: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      url: true,
      originalName: true,
      size: true,
      mimeType: true,
    },
  })

  const byCategory = documents.reduce<Record<string, typeof documents>>((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = []
    acc[doc.category].push(doc)
    return acc
  }, {})

  const categoryOrder = ['rules', 'general', 'forms', 'guides', 'other']
  const sortedCategories = Object.keys(byCategory).sort(
    (a, b) => (categoryOrder.indexOf(a) ?? 99) - (categoryOrder.indexOf(b) ?? 99)
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="section-title">Documents officiels</h1>
        <p className="section-subtitle">Règlements, statuts, formulaires et autres documents de l&apos;association</p>
      </div>

      {documents.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-csf-muted">Aucun document disponible pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedCategories.map((cat) => (
            <div key={cat}>
              <h2 className="font-bold text-csf-dark text-lg mb-3">{CATEGORY_LABELS[cat] ?? cat}</h2>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {byCategory[cat].map((doc) => (
                  <div key={doc.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                    <FileIcon mimeType={doc.mimeType} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-csf-dark truncate">{doc.title}</p>
                      {doc.description && (
                        <p className="text-sm text-csf-muted mt-0.5">{doc.description}</p>
                      )}
                      <p className="text-xs text-csf-muted/70 mt-0.5">
                        {(doc.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-sm flex-shrink-0"
                    >
                      Télécharger
                    </a>
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
