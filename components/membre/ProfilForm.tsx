'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AddressAutocomplete } from '@/components/auth/AddressAutocomplete'

const schema = z.object({
  civilite: z.string().optional(),
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  phone: z.string().min(1, 'Tél. mobile requis'),
  phoneFixed: z.string().optional(),
  address: z.string().min(1, 'Adresse requise'),
  address2: z.string().optional(),
  city: z.string().min(1, 'Ville requise'),
  postalCode: z.string().min(1, 'Code postal requis'),
  country: z.string().min(1, 'Pays requis'),
  exposantType: z.enum(['PARTICULIER', 'ELEVEUR', 'SOCIETE']),
  certificatCapacite: z.string().optional(),
  siret: z.string().optional(),
  affixe: z.string().optional(),
  newsletterSubscribed: z.boolean(),
})

type FormData = z.infer<typeof schema>

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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs font-semibold text-csf-muted uppercase tracking-wider">{children}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  )
}

const Req = () => <span className="text-red-500 ml-0.5">*</span>

export function ProfilForm({ user }: { user: ProfileUser }) {
  const router = useRouter()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting, errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
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
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-csf-dark text-lg">Informations personnelles</h2>
        <span className="text-xs text-csf-muted">
          <span className="text-red-500">*</span> Champs obligatoires
        </span>
      </div>

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm mb-3">
          Profil mis à jour avec succès.
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-3">{error}</div>
      )}

      <div className="md:grid md:grid-cols-2 md:gap-8">

        {/* ── Colonne gauche ── */}
        <div className="space-y-3">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Prénom <Req /></label>
              <input {...register('firstName')} className="form-input" />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="form-label">Nom <Req /></label>
              <input {...register('lastName')} className="form-input" />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

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
        </div>

        {/* ── Colonne droite ── */}
        <div className="space-y-3 mt-6 md:mt-0">
          <SectionTitle>Coordonnées</SectionTitle>

          <div>
            <label className="form-label">Adresse <Req /></label>
            <AddressAutocomplete
              value={addressValue}
              onChange={(val) => setValue('address', val, { shouldValidate: true })}
              onSelect={(data) => {
                setValue('address', data.address, { shouldValidate: true })
                setValue('postalCode', data.postalCode, { shouldValidate: true })
                setValue('city', data.city, { shouldValidate: true })
                setValue('country', data.country, { shouldValidate: true })
              }}
              className="form-input"
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
          </div>

          <div>
            <label className="form-label">
              Adresse 2 <span className="text-csf-muted font-normal text-xs">(complément)</span>
            </label>
            <input {...register('address2')} className="form-input" placeholder="Bâtiment, appartement..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Code postal <Req /></label>
              <input {...register('postalCode')} className="form-input" />
              {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
            </div>
            <div>
              <label className="form-label">Ville <Req /></label>
              <input {...register('city')} className="form-input" />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
            </div>
          </div>

          <div>
            <label className="form-label">Pays <Req /></label>
            <input {...register('country')} className="form-input" />
            {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
          </div>

          <div>
            <label className="form-label">Tél. mobile <Req /></label>
            <input {...register('phone')} type="tel" className="form-input" placeholder="06 XX XX XX XX" />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="form-label">Tél. fixe</label>
            <input {...register('phoneFixed')} type="tel" className="form-input" placeholder="04 XX XX XX XX" />
          </div>
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

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-6">
        {isSubmitting ? 'Sauvegarde...' : 'Enregistrer les modifications'}
      </button>
    </form>
  )
}
