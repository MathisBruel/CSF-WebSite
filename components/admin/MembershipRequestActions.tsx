'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function MembershipRequestActions({ requestId }: { requestId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const action = async (type: 'approve' | 'reject' | 'remind') => {
    let rejectionReason: string | null = null
    if (type === 'reject') {
      rejectionReason = window.prompt('Motif du refus (sera envoyé par email) :')
      if (!rejectionReason?.trim()) return
    } else if (type === 'remind') {
      if (!window.confirm('Renvoyer le mail de relance pour le règlement de la cotisation ?')) return
    } else {
      if (!window.confirm('Valider cette demande ? Le membre passera Adhérent et recevra un email de confirmation.')) return
    }

    setLoading(true)
    const res = await fetch(`/api/admin/membership-requests/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: type, rejectionReason }),
    })
    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      alert(data.error || 'Erreur')
      return
    }
    router.refresh()
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      <button
        onClick={() => action('remind')}
        disabled={loading}
        title="Renvoyer le mail demandant le règlement de la cotisation"
        className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg hover:bg-amber-100 transition-colors">
        Relancer paiement
      </button>
      <button
        onClick={() => action('approve')}
        disabled={loading}
        className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors">
        Valider
      </button>
      <button
        onClick={() => action('reject')}
        disabled={loading}
        className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors">
        Refuser
      </button>
    </div>
  )
}
