'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ExhibitionStatus } from '@prisma/client'

const TRANSITIONS: Record<ExhibitionStatus, { label: string; next: ExhibitionStatus; color: string } | null> = {
  DRAFT: { label: 'Ouvrir les inscriptions', next: 'OPEN', color: 'text-green-600 hover:bg-green-50' },
  OPEN: { label: 'Fermer les inscriptions', next: 'CLOSED', color: 'text-orange-600 hover:bg-orange-50' },
  CLOSED: { label: 'Archiver', next: 'ARCHIVED', color: 'text-gray-600 hover:bg-gray-100' },
  CANCELLED: null,
  ARCHIVED: null,
}

const CANCELLABLE: ExhibitionStatus[] = ['DRAFT', 'OPEN', 'CLOSED']

export function ExhibitionStatusToggle({
  expoId,
  currentStatus,
}: {
  expoId: string
  currentStatus: ExhibitionStatus
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const patch = async (status: ExhibitionStatus) => {
    setLoading(true)
    await fetch(`/api/admin/exhibitions/${expoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(false)
    router.refresh()
  }

  const transition = TRANSITIONS[currentStatus]
  const canCancel = CANCELLABLE.includes(currentStatus)

  if (!transition && !canCancel) return null

  return (
    <div className="flex items-center gap-2">
      {transition && (
        <button
          onClick={() => patch(transition.next)}
          disabled={loading}
          className={`text-xs px-3 py-1.5 border border-current rounded-lg transition-colors font-medium ${transition.color}`}>
          {transition.label}
        </button>
      )}
      {canCancel && (
        <button
          onClick={() => {
            if (window.confirm("Annuler cette exposition ? Les inscrits seront notifiés par email.")) {
              patch('CANCELLED')
            }
          }}
          disabled={loading}
          className="text-xs px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
          Annuler l&apos;expo
        </button>
      )}
    </div>
  )
}
