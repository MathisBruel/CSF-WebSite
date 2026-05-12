'use client'

import { useRouter } from 'next/navigation'
import { DOCUMENT_TYPE_LABELS } from '@/lib/utils'
import type { DocumentType } from '@prisma/client'

type Doc = {
  id: string
  type: DocumentType
  originalName: string
  url: string
  validated: boolean
  rejectionReason: string | null
}

export function DocumentValidation({ doc }: { doc: Doc }) {
  const router = useRouter()

  const validate = async (validated: boolean) => {
    const rejectionReason = !validated
      ? window.prompt('Motif de rejet :')
      : null
    if (!validated && !rejectionReason) return

    await fetch(`/api/admin/documents/${doc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ validated, rejectionReason }),
    })
    router.refresh()
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
      doc.validated ? 'border-green-200 bg-green-50' :
      doc.rejectionReason ? 'border-red-200 bg-red-50' :
      'border-yellow-200 bg-yellow-50'
    }`}>
      <div>
        <p className="font-medium text-csf-dark">{DOCUMENT_TYPE_LABELS[doc.type]}</p>
        <a href={doc.url} target="_blank" rel="noopener noreferrer"
          className="text-xs text-csf-orange hover:text-csf-orange-dark truncate max-w-40 block">
          {doc.originalName}
        </a>
      </div>
      {!doc.validated && (
        <div className="flex gap-1 ml-2">
          <button onClick={() => validate(true)}
            className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center hover:bg-green-200 transition-colors">
            ✓
          </button>
          <button onClick={() => validate(false)}
            className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs flex items-center justify-center hover:bg-red-200 transition-colors">
            ✗
          </button>
        </div>
      )}
    </div>
  )
}
