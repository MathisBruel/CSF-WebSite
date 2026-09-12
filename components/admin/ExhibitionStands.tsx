'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ExhibitionStandsProps {
  exhibitionId: string
  initialPlanUrl?: string
  initialPrice?: number
}

export function ExhibitionStands({
  exhibitionId,
  initialPlanUrl,
  initialPrice = 50,
}: ExhibitionStandsProps) {
  const router = useRouter()
  const [price, setPrice] = useState(initialPrice)
  const [planUrl, setPlanUrl] = useState(initialPlanUrl)
  const [uploading, setUploading] = useState<'plan' | null>(null)
  const [savingPrice, setSavingPrice] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading('plan')
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'plan')

      const res = await fetch(`/api/admin/exhibitions/${exhibitionId}/stands`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Erreur lors de l\'upload')
      }

      const data = await res.json()
      setPlanUrl(data.url)
      setSuccess('Plan uploadé avec succès')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setUploading(null)
    }
  }

  const handlePriceChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPrice(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/admin/exhibitions/${exhibitionId}/stands`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ standBasePricePerModule: price }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Erreur lors de la sauvegarde')
      }

      setSuccess('Tarif sauvegardé avec succès')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSavingPrice(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-csf-dark mb-4">Location de stands</h2>
        <p className="text-sm text-csf-muted mb-4">Gérez les plans, tarifs et contrats pour la location de stands</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>
      )}

      {/* Tarif */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-bold text-csf-dark">Tarif par module (2m × 3m)</h3>
        <form onSubmit={handlePriceChange} className="space-y-3">
          <div>
            <label className="form-label">Prix (€)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={price}
              onChange={(e) => setPrice(parseInt(e.target.value, 10))}
              className="form-input"
            />
          </div>
          <button
            type="submit"
            disabled={savingPrice}
            className="btn-primary disabled:opacity-50"
          >
            {savingPrice ? 'Sauvegarde...' : 'Enregistrer le tarif'}
          </button>
        </form>
      </div>

      {/* Plan */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <h3 className="font-bold text-csf-dark mb-2">Plan de salle (PDF, PNG, JPEG, WebP)</h3>
          {planUrl && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              ✓ Plan présent
            </div>
          )}
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={handleFileUpload}
            disabled={uploading === 'plan'}
            className="form-input"
          />
        </div>
        {planUrl && (
          <a href={planUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-csf-orange hover:underline">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Voir le plan
          </a>
        )}
      </div>
    </div>
  )
}
