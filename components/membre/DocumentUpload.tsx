'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { DocumentType } from '@prisma/client'

export function DocumentUpload({ catId, documentType }: { catId: string; documentType: DocumentType }) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('catId', catId)
    formData.append('type', documentType)

    const res = await fetch('/api/upload/cat-document', {
      method: 'POST',
      body: formData,
    })

    setUploading(false)

    if (!res.ok) {
      const body = await res.json()
      setError(body.error || 'Erreur lors de l\'upload')
      return
    }

    router.refresh()
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
        className="hidden" onChange={handleUpload} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 text-sm text-csf-orange hover:text-csf-orange-dark font-medium disabled:opacity-50">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {uploading ? 'Envoi en cours...' : 'Téléverser le document (PDF, JPG, PNG — max 10 MB)'}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
