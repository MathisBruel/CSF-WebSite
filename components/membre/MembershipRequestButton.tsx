'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function MembershipRequestButton({ price }: { price?: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/membre/membership-request', {
      method: 'POST',
    })
    setLoading(false)
    if (res.ok) {
      setConfirming(false)
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Erreur')
    }
  }

  const priceLabel = price ? `${price} €` : null

  if (!confirming) {
    return (
      <div>
        <button
          onClick={() => setConfirming(true)}
          className="btn-primary text-sm">
          Demander l&apos;adhésion
        </button>
        {priceLabel && (
          <p className="text-xs text-csf-muted mt-1">Cotisation annuelle : {priceLabel}</p>
        )}
      </div>
    )
  }

  return (
    <div className="mt-2 space-y-3">
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
      <p className="text-sm text-orange-900">
        {priceLabel
          ? `Un email vous demandant de régler la cotisation annuelle de ${priceLabel} vous sera envoyé.`
          : 'Un email vous demandant de régler la cotisation annuelle vous sera envoyé.'}
      </p>
      <div className="flex gap-2">
        <button onClick={submit} disabled={loading} className="btn-primary text-sm">
          {loading ? 'Envoi...' : 'Confirmer la demande'}
        </button>
        <button
          onClick={() => { setConfirming(false); setError('') }}
          className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          Annuler
        </button>
      </div>
    </div>
  )
}
