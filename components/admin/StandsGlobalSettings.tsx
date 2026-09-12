'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface StandsGlobalSettingsProps {
  initialContractUrl?: string
  initialContactEmail?: string
  initialContactPhone?: string
}

export function StandsGlobalSettings({
  initialContractUrl,
  initialContactEmail,
  initialContactPhone,
}: StandsGlobalSettingsProps) {
  const router = useRouter()
  const [contactEmail, setContactEmail] = useState(initialContactEmail || 'frederique.beaucousin@assocsf.fr')
  const [contactPhone, setContactPhone] = useState(initialContactPhone || '06 11 52 15 26')
  const [contractUrl, setContractUrl] = useState(initialContractUrl)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleContractUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/stands-settings', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Erreur lors de l\'upload')
      }

      const data = await res.json()
      setContractUrl(data.url)
      setSuccess('Contrat uploadé avec succès')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/admin/stands-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactEmail,
          contactPhone,
        }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Erreur lors de la sauvegarde')
      }

      setSuccess('Infos de contact sauvegardées')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-csf-dark mb-2">Configuration des stands</h2>
        <p className="text-sm text-csf-muted">Gérez le contrat global et les infos de contact pour la location de stands</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>
      )}

      {/* Contact info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="font-bold text-lg text-csf-dark">Informations de contact</h3>
        <form onSubmit={handleSaveContact} className="space-y-4">
          <div>
            <label className="form-label">Email de contact</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="form-input"
              required
            />
            <p className="text-xs text-csf-muted mt-1">Affiché sur la page de location de stands</p>
          </div>

          <div>
            <label className="form-label">Téléphone de contact</label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? 'Sauvegarde...' : 'Enregistrer les infos de contact'}
          </button>
        </form>
      </div>

      {/* Contract */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="font-bold text-lg text-csf-dark">Contrat de location</h3>
        <p className="text-sm text-csf-muted">
          Uploadez le contrat général de mise à disposition d&apos;emplacement. Ce fichier sera disponible en téléchargement sur la page publique.
        </p>

        {contractUrl && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            ✓ Contrat actuellement en place
          </div>
        )}

        <div>
          <label className="form-label">Fichier PDF</label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleContractUpload}
            disabled={uploading}
            className="form-input"
          />
        </div>

        {contractUrl && (
          <a href={contractUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-csf-orange hover:underline">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Télécharger le contrat actuel
          </a>
        )}
      </div>
    </div>
  )
}
