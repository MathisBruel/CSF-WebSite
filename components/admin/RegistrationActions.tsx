'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { RegistrationStatus, PaymentStatus } from '@prisma/client'

export function RegistrationActions({
  registrationId,
  currentStatus,
  currentPayment,
}: {
  registrationId: string
  currentStatus: RegistrationStatus
  currentPayment: PaymentStatus
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
        <>
          <button
            onClick={() => patch({ action: 'payment_received' })}
            disabled={loading}
            className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors w-full text-center"
          >
            ✓ Paiement reçu
          </button>
          <button
            onClick={() => patch({ action: 'remind_payment' })}
            disabled={loading}
            className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors w-full text-center"
          >
            Rappel paiement
          </button>
          <button
            onClick={() => {
              const reason = window.prompt('Motif de refus :')
              if (reason) patch({ status: 'REJECTED', rejectionReason: reason })
            }}
            disabled={loading}
            className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors w-full text-center"
          >
            Refuser
          </button>
        </>
      )}

      {currentStatus === 'VALIDATED' && (
        <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-lg">
          ✓ Validée &amp; Payée
        </span>
      )}

      {currentStatus === 'REJECTED' && (
        <span className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-medium rounded-lg">
          Refusée
        </span>
      )}
    </div>
  )
}
