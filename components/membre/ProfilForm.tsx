'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

type ProfileData = {
  name: string
  firstName: string
  lastName: string
  phone: string
  city: string
  postalCode: string
  address: string
  country: string
  affixe: string
  breedingName: string
  website: string
  gpsCoordinates: string
}

export function ProfilForm({ user }: { user: ProfileData & { email: string; newsletterSubscribed?: boolean } }) {
  const router = useRouter()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [newsletter, setNewsletter] = useState(user.newsletterSubscribed ?? true)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ProfileData>({
    defaultValues: {
      name: user.name || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      city: user.city || '',
      postalCode: user.postalCode || '',
      address: user.address || '',
      country: user.country || '',
      affixe: user.affixe || '',
      breedingName: user.breedingName || '',
      website: user.website || '',
      gpsCoordinates: user.gpsCoordinates || '',
    },
  })

  const onSubmit = async (data: ProfileData) => {
    setError('')
    setSuccess(false)
    const res = await fetch('/api/member/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, newsletterSubscribed: newsletter }),
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

      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="form-label">Email</label>
            <input value={user.email} disabled className="form-input opacity-60 cursor-not-allowed" />
        </div>
        <div>
            <label className="form-label">Nom d&apos;utilisateur</label>
            <input value={user.name} disabled className="form-input opacity-60 cursor-not-allowed" />
        </div>
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
      
      <hr />

      <div className="grid grid-cols-2 gap-4">
          <div>
              <label className="form-label">Affixe</label>
              <input {...register('affixe')} className="form-input" />
          </div>
          <div>
              <label className="form-label">Nom d&apos;élevage</label>
              <input {...register('breedingName')} className="form-input" />
          </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div>
              <label className="form-label">Site internet</label>
              <input {...register('website')} className="form-input" />
          </div>
          <div>
              <label className="form-label">Coordonnées GPS</label>
              <input {...register('gpsCoordinates')} className="form-input" />
          </div>
      </div>

      <hr />

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
        
      <div>
        <label className="form-label">Pays</label>
        <input {...register('country')} className="form-input" />
      </div>

      <div className="flex items-center gap-3 py-2">
        <input
          type="checkbox"
          id="newsletter"
          checked={newsletter}
          onChange={(e) => setNewsletter(e.target.checked)}
          className="w-4 h-4 accent-csf-orange"
        />
        <label htmlFor="newsletter" className="text-sm text-csf-dark cursor-pointer">
          Recevoir la newsletter du club (actualités, expositions)
        </label>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? 'Sauvegarde...' : 'Enregistrer les modifications'}
      </button>
    </form>
  )
}
