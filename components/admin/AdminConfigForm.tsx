'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AdminConfigForm({ config }: { config: Record<string, string> }) {
  const router = useRouter()
  const [values, setValues] = useState({
    membership_price: config['membership_price'] || '',
    membership_rib_iban: config['membership_rib_iban'] || '',
    membership_rib_bic: config['membership_rib_bic'] || '',
    membership_rib_holder: config['membership_rib_holder'] || '',
    membership_paypal_link: config['membership_paypal_link'] || '',
    social_facebook_url: config['social_facebook_url'] || '',
    social_instagram_url: config['social_instagram_url'] || '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const res = await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    setSaving(false)
    if (res.ok) {
      setMessage('Configuration enregistrée.')
      router.refresh()
    } else {
      setMessage('Erreur lors de l\'enregistrement.')
    }
  }

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }))

  return (
    <form onSubmit={save} className="space-y-6">
      {message && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-csf-dark">Cotisation d&apos;adhésion</h2>
        <div>
          <label className="form-label">Montant annuel (€)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.membership_price}
            onChange={set('membership_price')}
            className="form-input w-40"
            placeholder="30"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-csf-dark">Virement bancaire</h2>
        <div>
          <label className="form-label">Titulaire du compte</label>
          <input
            value={values.membership_rib_holder}
            onChange={set('membership_rib_holder')}
            className="form-input"
            placeholder="Association Chats Sans Frontières"
          />
        </div>
        <div>
          <label className="form-label">IBAN</label>
          <input
            value={values.membership_rib_iban}
            onChange={set('membership_rib_iban')}
            className="form-input font-mono"
            placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
          />
        </div>
        <div>
          <label className="form-label">BIC</label>
          <input
            value={values.membership_rib_bic}
            onChange={set('membership_rib_bic')}
            className="form-input font-mono w-48"
            placeholder="XXXXXXXX"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-csf-dark">PayPal</h2>
        <div>
          <label className="form-label">Lien PayPal <span className="font-normal text-csf-muted">(optionnel)</span></label>
          <input
            value={values.membership_paypal_link}
            onChange={set('membership_paypal_link')}
            className="form-input"
            placeholder="https://paypal.me/..."
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-csf-dark">Réseaux sociaux</h2>
        <div>
          <label className="form-label">URL Facebook</label>
          <input
            value={values.social_facebook_url}
            onChange={set('social_facebook_url')}
            className="form-input"
            placeholder="https://facebook.com/..."
          />
        </div>
        <div>
          <label className="form-label">URL Instagram</label>
          <input
            value={values.social_instagram_url}
            onChange={set('social_instagram_url')}
            className="form-input"
            placeholder="https://instagram.com/..."
          />
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </form>
  )
}
