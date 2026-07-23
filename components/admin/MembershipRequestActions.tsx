'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function MembershipRequestActions({ requestId }: { requestId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const action = async (type: 'approve' | 'reject') => {
    let rejectionReason: string | null = null
    if (type === 'reject') {
      rejectionReason = window.prompt('Motif du refus (sera envoyé par email) :')
      if (!rejectionReason?.trim()) return
    } else {
      if (!window.confirm('Approuver cette demande ? Le membre deviendra actif et recevra les instructions de paiement par email.')) return
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
        onClick={() => action('approve')}
        disabled={loading}
        className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors">
        Approuver
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
