'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function MembershipRequestButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/membre/membership-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
    setLoading(false)
    if (res.ok) {
      setOpen(false)
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Erreur')
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn-primary text-sm">
        Demander l&apos;adhésion
      </button>
    )
  }

  return (
    <div className="mt-2 space-y-3">
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
      <div>
        <label className="text-xs font-medium text-orange-900">Message pour le bureau <span className="font-normal">(optionnel)</span></label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="mt-1 w-full text-sm border border-orange-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          placeholder="Présentez-vous brièvement..."
        />
      </div>
      <div className="flex gap-2">
        <button onClick={submit} disabled={loading} className="btn-primary text-sm">
          {loading ? 'Envoi...' : 'Envoyer la demande'}
        </button>
        <button
          onClick={() => { setOpen(false); setError('') }}
          className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          Annuler
        </button>
      </div>
    </div>
  )
}
