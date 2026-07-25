'use client'

import { useState } from 'react'

type Doc = {
  id: string
  title: string
  description: string | null
  category: string
  url: string
  originalName: string
  size: number
  mimeType: string
}

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

export function DocumentViewer({
  documents,
  byCategory,
  sortedCategories,
}: {
  documents: Doc[]
  byCategory: Record<string, Doc[]>
  sortedCategories: string[]
}) {
  const [viewing, setViewing] = useState<Doc | null>(null)

  return (
    <>
      {documents.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-csf-muted">Aucun document disponible pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedCategories.map((cat) => (
            <div key={cat}>
              <h2 className="font-bold text-csf-dark text-lg mb-3">
                {CATEGORY_LABELS[cat] ?? cat}
              </h2>
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
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {doc.mimeType === 'application/pdf' && (
                        <button
                          onClick={() => setViewing(doc)}
                          className="btn-primary text-sm"
                        >
                          Visualiser
                        </button>
                      )}
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="btn-secondary text-sm"
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

      {/* PDF viewer modal */}
      {viewing && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/70"
          onClick={(e) => { if (e.target === e.currentTarget) setViewing(null) }}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-csf-dark text-white flex-shrink-0">
            <p className="font-medium truncate mr-4">{viewing.title}</p>
            <div className="flex items-center gap-3 flex-shrink-0">
              <a
                href={viewing.url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="text-sm text-csf-light/80 hover:text-white transition-colors"
              >
                Télécharger
              </a>
              <button
                onClick={() => setViewing(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                aria-label="Fermer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <iframe
            src={viewing.url}
            className="flex-1 w-full border-0"
            title={viewing.title}
          />
        </div>
      )}
    </>
  )
}
