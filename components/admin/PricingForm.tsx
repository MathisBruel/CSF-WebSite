'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { GlobalPricing } from '@/lib/utils'

type PricingFormProps = {
  initialData: GlobalPricing
}

export function PricingForm({ initialData }: PricingFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<GlobalPricing>(initialData)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const res = await fetch('/api/admin/pricing', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    setSaving(false)
    if (res.ok) {
      setMessage('Tarifs enregistrés.')
      router.refresh()
    } else {
      setMessage("Erreur lors de l'enregistrement.")
    }
  }

  const set = (key: keyof GlobalPricing) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value)
    setValues((v) => ({ ...v, [key]: value }))
  }

  const field = (label: string, key: keyof GlobalPricing) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <label className="text-sm text-csf-muted">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number" min="0" step="1"
          value={values[key]}
          onChange={set(key)}
          className="form-input w-24 text-right"
        />
        <span className="text-sm text-csf-muted">€</span>
      </div>
    </div>
  )

  return (
    <form onSubmit={save} className="space-y-6">
      {message && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {message}
        </div>
      )}

      {field('Frais d\'inscription (par inscription)', 'registrationFee')}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adhérent */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-csf-dark mb-1">Adhérents</h2>
          <p className="text-xs text-csf-muted mb-4">Membres à jour de cotisation</p>

          <p className="text-xs font-semibold text-csf-muted uppercase tracking-wide mb-2">1 Jour</p>
          {field('1er et 2ème chat', 'memberOneDayCat12')}
          {field('3ème chat et +', 'memberOneDayCat3Plus')}
          {field('Chat de maison', 'memberOneDayHouseCat')}

          <p className="text-xs font-semibold text-csf-muted uppercase tracking-wide mb-2 mt-4">2 Jours</p>
          {field('1er et 2ème chat', 'memberTwoDayCat12')}
          {field('3ème chat et +', 'memberTwoDayCat3Plus')}
          {field('Chat de maison', 'memberTwoDayHouseCat')}

          <p className="text-xs font-semibold text-csf-muted uppercase tracking-wide mb-2 mt-4">Options</p>
          {field('Conformité', 'memberConformite')}
          {field('Diplôme', 'memberDiploma')}
        </div>

        {/* Non-adhérent */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-csf-dark mb-1">Non-adhérents</h2>
          <p className="text-xs text-csf-muted mb-4">Exposants extérieurs</p>

          <p className="text-xs font-semibold text-csf-muted uppercase tracking-wide mb-2">1 Jour</p>
          {field('1er et 2ème chat', 'nonMemberOneDayCat12')}
          {field('3ème chat et +', 'nonMemberOneDayCat3Plus')}
          {field('Chat de maison', 'nonMemberOneDayHouseCat')}

          <p className="text-xs font-semibold text-csf-muted uppercase tracking-wide mb-2 mt-4">2 Jours</p>
          {field('1er et 2ème chat', 'nonMemberTwoDayCat12')}
          {field('3ème chat et +', 'nonMemberTwoDayCat3Plus')}
          {field('Chat de maison', 'nonMemberTwoDayHouseCat')}

          <p className="text-xs font-semibold text-csf-muted uppercase tracking-wide mb-2 mt-4">Options</p>
          {field('Conformité', 'nonMemberConformite')}
          {field('Diplôme', 'nonMemberDiploma')}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-1">
        <h2 className="font-semibold text-csf-dark mb-3">Divers</h2>
        {field('Cotisation annuelle', 'membershipFee')}
        {field('Caution cage (chèque, remis sur place)', 'cageDeposit')}
      </div>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </form>
  )
}
