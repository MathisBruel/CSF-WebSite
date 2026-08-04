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
  const [reminded, setReminded] = useState(false)
  const [remindLoading, setRemindLoading] = useState(false)

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

  const sendReminder = async () => {
    setRemindLoading(true)
    await fetch(`/api/admin/registrations/${registrationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remind_payment' }),
    })
    setRemindLoading(false)
    setReminded(true)
    setTimeout(() => setReminded(false), 3000)
  }

  const deleteReg = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer définitivement cette inscription ?')) return
    setLoading(true)
    await fetch(`/api/admin/registrations/${registrationId}`, { method: 'DELETE' })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex flex-row flex-wrap gap-1.5 items-center justify-end">
      {currentStatus === 'PENDING' && (
        <>
          <button
            onClick={() => patch({ action: 'payment_received' })}
            disabled={loading}
            className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors"
          >
            ✓ Paiement reçu
          </button>
          <button
            onClick={sendReminder}
            disabled={remindLoading || reminded}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              reminded
                ? 'bg-green-50 text-green-700 cursor-default'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            {remindLoading ? 'Envoi...' : reminded ? '✓ Rappel envoyé' : 'Rappel paiement'}
          </button>
          <button
            onClick={() => {
              const reason = window.prompt('Motif de refus :')
              if (reason) patch({ status: 'REJECTED', rejectionReason: reason })
            }}
            disabled={loading}
            className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors"
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

      <button
        onClick={deleteReg}
        disabled={loading}
        className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        Supprimer
      </button>
    </div>
  )
}
