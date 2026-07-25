'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { AddressAutocomplete } from '@/components/auth/AddressAutocomplete'

type ProfileUser = {
  email: string
  name: string
  firstName: string
  lastName: string
  civilite: string | null
  phone: string | null
  phoneFixed: string | null
  address: string | null
  address2: string | null
  city: string | null
  postalCode: string | null
  country: string | null
  exposantType: string
  certificatCapacite: string | null
  siret: string | null
  affixe: string | null
  newsletterSubscribed: boolean
}

type FormData = {
  civilite: string
  firstName: string
  lastName: string
  phone: string
  phoneFixed: string
  address: string
  address2: string
  city: string
  postalCode: string
  country: string
  exposantType: 'PARTICULIER' | 'ELEVEUR' | 'SOCIETE'
  certificatCapacite: string
  siret: string
  affixe: string
  newsletterSubscribed: boolean
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs font-semibold text-csf-muted uppercase tracking-wider">{children}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  )
}

export function ProfilForm({ user }: { user: ProfileUser }) {
  const router = useRouter()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: {
      civilite: user.civilite || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      phoneFixed: user.phoneFixed || '',
      address: user.address || '',
      address2: user.address2 || '',
      city: user.city || '',
      postalCode: user.postalCode || '',
      country: user.country || 'France',
      exposantType: (user.exposantType as FormData['exposantType']) || 'PARTICULIER',
      certificatCapacite: user.certificatCapacite || '',
      siret: user.siret || '',
      affixe: user.affixe || '',
      newsletterSubscribed: user.newsletterSubscribed ?? true,
    },
  })

  const exposantType = watch('exposantType')
  const addressValue = watch('address') ?? ''

  const onSubmit = async (data: FormData) => {
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
    <form className="card space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="font-bold text-csf-dark text-lg">Informations personnelles</h2>

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          Profil mis à jour avec succès.
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {/* ── Identité ── */}
      <SectionTitle>Identité</SectionTitle>

      <div>
        <label className="form-label">Email</label>
        <input value={user.email} disabled className="form-input opacity-60 cursor-not-allowed" />
      </div>

      <div>
        <label className="form-label">Civilité</label>
        <div className="flex gap-4 mt-1">
          {(['M.', 'Mme'] as const).map((c) => (
            <label key={c} className="flex items-center gap-2 cursor-pointer">
              <input {...register('civilite')} type="radio" value={c} className="accent-csf-orange" />
              <span className="text-sm text-csf-dark">{c}</span>
            </label>
          ))}
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

      {/* ── Type d'exposant ── */}
      <SectionTitle>Type d&apos;exposant</SectionTitle>

      <div className="flex gap-2">
        {([
          { value: 'PARTICULIER', label: 'Particulier' },
          { value: 'ELEVEUR', label: 'Éleveur' },
          { value: 'SOCIETE', label: 'Société' },
        ] as const).map((opt) => (
          <label
            key={opt.value}
            className={`flex-1 text-center py-2 px-3 rounded-lg border text-sm cursor-pointer transition-colors ${
              exposantType === opt.value
                ? 'border-csf-orange bg-csf-orange/10 text-csf-orange font-medium'
                : 'border-gray-200 text-csf-muted hover:border-csf-orange/50'
            }`}
          >
            <input {...register('exposantType')} type="radio" value={opt.value} className="sr-only" />
            {opt.label}
          </label>
        ))}
      </div>

      {(exposantType === 'ELEVEUR' || exposantType === 'SOCIETE') && (
        <div>
          <label className="form-label">SIRET</label>
          <input {...register('siret')} className="form-input" placeholder="12345678900000" />
        </div>
      )}

      {exposantType === 'ELEVEUR' && (
        <>
          <div>
            <label className="form-label">Affixe</label>
            <input {...register('affixe')} className="form-input" placeholder="de la Tour" />
          </div>
          <div>
            <label className="form-label">Certificat de Capacité</label>
            <input {...register('certificatCapacite')} className="form-input" placeholder="N° de certificat" />
          </div>
        </>
      )}

      {/* ── Coordonnées ── */}
      <SectionTitle>Coordonnées</SectionTitle>

      <div>
        <label className="form-label">Adresse 1</label>
        <AddressAutocomplete
          value={addressValue}
          onChange={(val) => setValue('address', val)}
          onSelect={(data) => {
            setValue('address', data.address)
            setValue('postalCode', data.postalCode)
            setValue('city', data.city)
            setValue('country', data.country)
          }}
          className="form-input"
        />
      </div>

      <div>
        <label className="form-label">Adresse 2 <span className="text-csf-muted font-normal text-xs">(complément)</span></label>
        <input {...register('address2')} className="form-input" placeholder="Bâtiment, appartement..." />
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Tél. fixe</label>
          <input {...register('phoneFixed')} type="tel" className="form-input" placeholder="04 XX XX XX XX" />
        </div>
        <div>
          <label className="form-label">Tél. mobile</label>
          <input {...register('phone')} type="tel" className="form-input" placeholder="06 XX XX XX XX" />
        </div>
      </div>

      {/* ── Préférences ── */}
      <SectionTitle>Préférences</SectionTitle>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          {...register('newsletterSubscribed')}
          type="checkbox"
          className="w-4 h-4 accent-csf-orange"
        />
        <span className="text-sm text-csf-dark">Recevoir la newsletter du club (actualités, expositions)</span>
      </label>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? 'Sauvegarde...' : 'Enregistrer les modifications'}
      </button>
    </form>
  )
}
