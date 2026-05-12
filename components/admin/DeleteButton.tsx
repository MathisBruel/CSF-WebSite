'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DeleteButton({
  endpoint,
  itemName,
  onSuccess,
}: {
  endpoint: string
  itemName: string
  onSuccess?: () => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${itemName}" ? Cette action est irréversible.`)) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(endpoint, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Erreur lors de la suppression')
        setLoading(false)
        return
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    } catch (err) {
      setError('Erreur réseau')
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-xs px-3 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Suppression...' : 'Supprimer'}
      </button>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </>
  )
}
