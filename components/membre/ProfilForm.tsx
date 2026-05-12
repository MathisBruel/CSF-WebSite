'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

type ProfileData = {
  firstName: string
  lastName: string
  phone: string
  city: string
  postalCode: string
  address: string
}

export function ProfilForm({ user }: { user: ProfileData & { email: string } }) {
  const router = useRouter()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ProfileData>({
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      city: user.city || '',
      postalCode: user.postalCode || '',
      address: user.address || '',
    },
  })

  const onSubmit = async (data: ProfileData) => {
    setError('')
    setSuccess(false)
    const res = await fetch('/api/member/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      setError('Erreur lors de la sauvegarde')
      return
    }
    setSuccess(true)
    router.refresh()
  }

  return (
    <form className="card space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="font-bold text-csf-dark">Informations personnelles</h2>

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          Profil mis à jour avec succès.
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <div>
        <label className="form-label">Email</label>
        <input value={user.email} disabled className="form-input opacity-60 cursor-not-allowed" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Prénom</label>
          <input {...register('firstName')} className="form-input" />
        </div>
        <div>
          <label className="form-label">Nom</label>
          <input {...register('lastName')} className="form-input" />
        </div>
      </div>

      <div>
        <label className="form-label">Téléphone</label>
        <input {...register('phone')} type="tel" className="form-input" />
      </div>

      <div>
        <label className="form-label">Adresse</label>
        <input {...register('address')} className="form-input" placeholder="123 Rue de la Paix" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Code postal</label>
          <input {...register('postalCode')} className="form-input" />
        </div>
        <div>
          <label className="form-label">Ville</label>
          <input {...register('city')} className="form-input" />
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? 'Sauvegarde...' : 'Enregistrer les modifications'}
      </button>
    </form>
  )
}
