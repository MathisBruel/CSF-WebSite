'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { RegistrationStatus, PaymentStatus } from '@prisma/client'

export function RegistrationActions({
  registrationId,
  currentStatus,
  currentPayment,
  vetValidated,
  catalogNumber,
}: {
  registrationId: string
  currentStatus: RegistrationStatus
  currentPayment: PaymentStatus
  vetValidated: boolean
  catalogNumber: number | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const patch = async (data: Record<string, unknown>) => {
    setLoading(true)
    await fetch(`/api/admin/registrations/${registrationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-2 items-end min-w-40">
      {currentStatus === 'PENDING' && (
        <div className="flex gap-2">
          <button onClick={() => patch({ status: 'VALIDATED' })} disabled={loading}
            className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors">
            Valider
          </button>
          <button onClick={() => {
            const reason = window.prompt('Motif de refus :')
            if (reason) patch({ status: 'REJECTED', rejectionReason: reason })
          }} disabled={loading}
            className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors">
            Refuser
          </button>
        </div>
      )}

      {currentStatus === 'VALIDATED' && (
        <div className="flex gap-2">
          <button onClick={() => patch({ paymentStatus: 'PAID' })} disabled={loading || currentPayment === 'PAID'}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              currentPayment === 'PAID' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}>
            {currentPayment === 'PAID' ? '✓ Payé' : 'Marquer payé'}
          </button>
          <button onClick={() => patch({ vetValidated: !vetValidated })} disabled={loading}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              vetValidated ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}>
            {vetValidated ? '✓ Vét. validé' : 'Valider vét.'}
          </button>
        </div>
      )}

      {!catalogNumber && currentStatus === 'VALIDATED' && (
        <button onClick={() => {
          const num = window.prompt('Numéro de catalogue :')
          if (num && !isNaN(parseInt(num))) patch({ catalogNumber: parseInt(num) })
        }} disabled={loading}
          className="px-3 py-1.5 text-xs text-csf-muted border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Attribuer n° catalogue
        </button>
      )}
      {catalogNumber && (
        <span className="text-xs text-csf-muted">Catalogue #{catalogNumber}</span>
      )}
    </div>
  )
}
