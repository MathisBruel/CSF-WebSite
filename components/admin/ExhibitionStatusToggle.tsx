'use client'

import { useRouter } from 'next/navigation'
import type { ExhibitionStatus } from '@prisma/client'

const TRANSITIONS: Record<ExhibitionStatus, { label: string; next: ExhibitionStatus; color: string } | null> = {
  DRAFT: { label: 'Ouvrir les inscriptions', next: 'OPEN', color: 'text-green-600 hover:bg-green-50' },
  OPEN: { label: 'Fermer les inscriptions', next: 'CLOSED', color: 'text-orange-600 hover:bg-orange-50' },
  CLOSED: { label: 'Archiver', next: 'ARCHIVED', color: 'text-gray-600 hover:bg-gray-100' },
  ARCHIVED: null,
}

export function ExhibitionStatusToggle({
  expoId,
  currentStatus,
}: {
  expoId: string
  currentStatus: ExhibitionStatus
}) {
  const router = useRouter()
  const transition = TRANSITIONS[currentStatus]
  if (!transition) return null

  const handleClick = async () => {
    await fetch(`/api/admin/exhibitions/${expoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: transition.next }),
    })
    router.refresh()
  }

  return (
    <button
      onClick={handleClick}
      className={`text-xs px-3 py-1.5 border border-current rounded-lg transition-colors font-medium ${transition.color}`}>
      {transition.label}
    </button>
  )
}
