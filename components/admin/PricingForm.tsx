'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pricing } from '@prisma/client'

type PricingFormProps = {
  initialData: Partial<Pricing>
}

export function PricingForm({ initialData }: PricingFormProps) {
  const router = useRouter()
  const [values, setValues] = useState({
    registrationOneDay: initialData.registrationOneDay ?? 40,
    registrationWeekend: initialData.registrationWeekend ?? 70,
    extraCageOneDay: initialData.extraCageOneDay ?? 20,
    extraCageWeekend: initialData.extraCageWeekend ?? 35,
  })
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

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value)
    setValues((v) => ({ ...v, [key]: value }))
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {message && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-csf-dark">Inscription (par chat)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">1 jour (€)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={values.registrationOneDay}
              onChange={set('registrationOneDay')}
              className="form-input w-40"
              placeholder="40"
            />
          </div>
          <div>
            <label className="form-label">Week-end (€)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={values.registrationWeekend}
              onChange={set('registrationWeekend')}
              className="form-input w-40"
              placeholder="70"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-csf-dark">Cage supplémentaire</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">1 jour (€)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={values.extraCageOneDay}
              onChange={set('extraCageOneDay')}
              className="form-input w-40"
              placeholder="20"
            />
          </div>
          <div>
            <label className="form-label">Week-end (€)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={values.extraCageWeekend}
              onChange={set('extraCageWeekend')}
              className="form-input w-40"
              placeholder="35"
            />
          </div>
        </div>
      </div>

       <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-csf-dark">Catalogue</h2>
        <p className="text-csf-muted">Le catalogue est gratuit et obligatoire pour chaque inscription.</p>
      </div>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </form>
  )
}
