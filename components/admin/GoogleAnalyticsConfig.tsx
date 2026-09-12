'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface GAConfigData {
  propertyId: string | null
  measurementId: string | null
  enabled: boolean
}

export function GoogleAnalyticsConfig() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [config, setConfig] = useState<GAConfigData>({
    propertyId: '',
    measurementId: '',
    enabled: true,
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [authUrl, setAuthUrl] = useState('')

  useEffect(() => {
    fetchConfig()
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    if (success) setMessage('Compte Google connecté avec succès.')
    if (error) setMessage(`Erreur: ${error}`)
  }, [searchParams])

  const fetchConfig = async () => {
    const res = await fetch('/api/admin/ga-config')
    if (res.ok) {
      const data = await res.json()
      setConfig(data)
    }
  }

  const handleConnectGoogle = async () => {
    try {
      const res = await fetch('/api/admin/ga-auth-url')
      if (res.ok) {
        const { url } = await res.json()
        window.location.href = url
      }
    } catch (error) {
      setMessage('Erreur lors de la connexion Google')
    }
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const res = await fetch('/api/admin/ga-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    setSaving(false)
    if (res.ok) {
      setMessage('Configuration Google Analytics enregistrée.')
      router.refresh()
    } else {
      setMessage('Erreur lors de l\'enregistrement.')
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {message && (
        <div className={`p-3 rounded-lg border text-sm ${
          message.includes('Erreur')
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-csf-dark">Connexion Google</h2>
        <p className="text-sm text-csf-muted">Connectez votre compte Google pour autoriser l'accès à Google Analytics.</p>
        <button
          type="button"
          onClick={handleConnectGoogle}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Se connecter avec Google
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-csf-dark">Configuration GA4</h2>
        <div>
          <label className="form-label">Property ID</label>
          <input
            type="text"
            value={config.propertyId || ''}
            onChange={(e) => setConfig({ ...config, propertyId: e.target.value })}
            className="form-input"
            placeholder="12345678"
          />
          <p className="text-xs text-csf-muted mt-1">Trouvé dans Google Analytics Admin → Properties</p>
        </div>
        <div>
          <label className="form-label">Measurement ID</label>
          <input
            type="text"
            value={config.measurementId || ''}
            onChange={(e) => setConfig({ ...config, measurementId: e.target.value })}
            className="form-input"
            placeholder="G-XXXXXXXXXX"
          />
          <p className="text-xs text-csf-muted mt-1">Trouvé dans Google Analytics Data Streams</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="enabled"
            checked={config.enabled}
            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="enabled" className="text-sm font-medium text-csf-dark">
            Activer Google Analytics
          </label>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 space-y-2">
        <h3 className="font-semibold text-blue-900">Métriques collectées</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Page views et temps de session</li>
          <li>✓ Utilisateurs et sessions</li>
          <li>✓ Device, navigateur, localisation</li>
          <li>✓ Événements personnalisés (registrations, formulaires)</li>
          <li>✓ Taux de rebond et engagement</li>
          <li>✓ Conversions et entonnoirs</li>
          <li>✓ Cohérence utilisateur</li>
        </ul>
      </div>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Enregistrement...' : 'Enregistrer la configuration'}
      </button>
    </form>
  )
}
