'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { RegistrationStatus } from '@prisma/client'

export function RegistrationCatActions({
  registrationId,
  catId,
  vetValidated,
  catalogNumber,
  registrationStatus,
}: {
  registrationId: string
  catId: string
  vetValidated: boolean
  catalogNumber: number | null
  registrationStatus: RegistrationStatus
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const patch = async (data: Record<string, unknown>) => {
    setLoading(true)
    await fetch(`/api/admin/registrations/${registrationId}/cats/${catId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setLoading(false)
    router.refresh()
  }

  if (registrationStatus !== 'VALIDATED') return null

  return (
    <div className="flex flex-col gap-2 items-end min-w-36">
      <button
        onClick={() => patch({ vetValidated: !vetValidated })}
        disabled={loading}
        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
          vetValidated ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
        }`}>
        {vetValidated ? '✓ Vét. validé' : 'Valider vét.'}
      </button>

      {!catalogNumber ? (
        <button
          onClick={() => {
            const num = window.prompt('Numéro de catalogue :')
            if (num && !isNaN(parseInt(num))) patch({ catalogNumber: parseInt(num) })
          }}
          disabled={loading}
          className="px-3 py-1.5 text-xs text-csf-muted border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Attribuer n° catalogue
        </button>
      ) : (
        <span className="text-xs text-csf-muted">Catalogue #{catalogNumber}</span>
      )}
    </div>
  )
}
