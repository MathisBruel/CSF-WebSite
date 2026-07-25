'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, useWatch, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AddressAutocomplete } from './AddressAutocomplete'

const schema = z.object({
  civilite: z.enum(['M.', 'Mme']).optional(),
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  confirmPassword: z.string(),
  exposantType: z.enum(['PARTICULIER', 'ELEVEUR', 'SOCIETE']).default('PARTICULIER'),
  certificatCapacite: z.string().optional(),
  siret: z.string().optional(),
  affixe: z.string().optional(),
  address: z.string().optional(),
  address2: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  phoneFixed: z.string().optional(),
  phone: z.string().optional(),
  wantsAdhesion: z.boolean().default(false),
  newsletterSubscribed: z.boolean().default(true),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs font-semibold text-csf-muted uppercase tracking-wider">{children}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  )
}

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      exposantType: 'PARTICULIER',
      wantsAdhesion: false,
      newsletterSubscribed: true,
    },
  })

  const exposantType = useWatch({ control, name: 'exposantType' })
  const addressValue = useWatch({ control, name: 'address' }) ?? ''

  const onSubmit = async (data: FormData) => {
    setError('')
    const { confirmPassword, ...payload } = data
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const body = await res.json()
      setError(body.error || 'Erreur lors de la création du compte')
      return
    }

    router.push('/verify-email')
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h1 className="text-2xl font-bold font-serif text-csf-dark mb-1 text-center">Créer un compte</h1>
      <p className="text-center text-csf-muted text-sm mb-4">Accédez à l&apos;espace membre CSF</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

        {/* ── Identité ── */}
        <SectionTitle>Identité</SectionTitle>

        <div>
          <label className="form-label">Civilité</label>
          <div className="flex gap-2 mt-1">
            {(['M.', 'Mme'] as const).map((c) => (
              <label key={c} className="flex items-center gap-2 cursor-pointer">
                <input
                  {...register('civilite')}
                  type="radio"
                  value={c}
                  className="accent-csf-orange"
                />
                <span className="text-sm text-csf-dark">{c}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Prénom <span className="text-red-500">*</span></label>
            <input {...register('firstName')} className="form-input" placeholder="Marie" />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="form-label">Nom <span className="text-red-500">*</span></label>
            <input {...register('lastName')} className="form-input" placeholder="Dupont" />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        {/* ── Compte ── */}
        <SectionTitle>Compte</SectionTitle>

        <div>
          <label className="form-label">Email <span className="text-red-500">*</span></label>
          <input {...register('email')} type="email" className="form-input" placeholder="marie@exemple.fr" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Mot de passe <span className="text-red-500">*</span></label>
            <input {...register('password')} type="password" className="form-input" placeholder="Min. 8 caractères" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="form-label">Confirmer <span className="text-red-500">*</span></label>
            <input {...register('confirmPassword')} type="password" className="form-input" placeholder="••••••••" />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        {/* ── Type d'exposant ── */}
        <SectionTitle>Type d&apos;exposant</SectionTitle>

        <div>
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
          <label className="form-label">Adresse 2 <span className="text-csf-muted font-normal">(complément)</span></label>
          <input {...register('address2')} className="form-input" placeholder="Bâtiment, appartement..." />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Code postal</label>
            <input {...register('postalCode')} className="form-input" placeholder="69001" />
          </div>
          <div>
            <label className="form-label">Ville</label>
            <input {...register('city')} className="form-input" placeholder="Lyon" />
          </div>
        </div>

        <div>
          <label className="form-label">Pays</label>
          <input {...register('country')} className="form-input" placeholder="France" defaultValue="France" />
        </div>

        <div className="grid grid-cols-2 gap-3">
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

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            {...register('wantsAdhesion')}
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-csf-orange"
          />
          <span className="text-sm text-csf-dark leading-snug">
            Je souhaite adhérer à l&apos;association Chats Sans Frontières
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            {...register('newsletterSubscribed')}
            type="checkbox"
            defaultChecked
            className="mt-0.5 h-4 w-4 accent-csf-orange"
          />
          <span className="text-sm text-csf-dark leading-snug">
            Je souhaite recevoir la newsletter du club
          </span>
        </label>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-4">
          {isSubmitting ? 'Création...' : 'Créer mon compte'}
        </button>

        <p className="text-xs text-csf-muted text-center">
          Un email de confirmation sera envoyé pour activer votre compte.
        </p>
      </form>

      <p className="text-center text-sm text-csf-muted mt-6">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-csf-orange hover:text-csf-orange-dark font-medium">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
