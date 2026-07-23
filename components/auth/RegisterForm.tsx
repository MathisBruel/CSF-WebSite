'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'

const schema = z.object({
  name: z.string().min(3, "Nom d&apos;utilisateur requis"),
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  affixe: z.string().optional(),
  breedingName: z.string().optional(),
  website: z.string().optional(),
  gpsCoordinates: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json()
      setError(body.error || 'Erreur lors de la création du compte')
      return
    }

    await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })
    router.push('/membre/dashboard')
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h1 className="text-2xl font-bold font-serif text-csf-dark mb-1 text-center">Créer un compte</h1>
      <p className="text-center text-csf-muted text-sm mb-6">Accédez à l&apos;espace membre CSF</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Prénom</label>
            <input {...register('firstName')} className="form-input" placeholder="Marie" />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="form-label">Nom</label>
            <input {...register('lastName')} className="form-input" placeholder="Dupont" />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
            <label className="form-label">Nom d&apos;utilisateur</label>
            <input {...register('name')} className="form-input" placeholder="marie.dupont" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="form-label">Email</label>
          <input {...register('email')} type="email" className="form-input" placeholder="marie@exemple.fr" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Mot de passe</label>
            <input {...register('password')} type="password" className="form-input" placeholder="Min. 8 caractères" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="form-label">Confirmer</label>
            <input {...register('confirmPassword')} type="password" className="form-input" placeholder="••••••••" />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>
        </div>
        
        <hr className="my-4"/>

        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="form-label">Affixe</label>
                <input {...register('affixe')} className="form-input" placeholder="de la Tour" />
            </div>
            <div>
                <label className="form-label">Nom d&apos;élevage</label>
                <input {...register('breedingName')} className="form-input" placeholder="Chatterie de la Tour" />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="form-label">Site internet</label>
                <input {...register('website')} className="form-input" placeholder="https://monsite.com" />
            </div>
            <div>
                <label className="form-label">Coordonnées GPS</label>
                <input {...register('gpsCoordinates')} className="form-input" placeholder="45.75, 4.85" />
            </div>
        </div>

        <hr className="my-4"/>

        <div>
          <label className="form-label">Adresse</label>
          <input {...register('address')} className="form-input" placeholder="10 rue de la Paix" />
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
          <input {...register('country')} className="form-input" placeholder="France" />
        </div>

        <div>
          <label className="form-label">Téléphone <span className="text-csf-muted font-normal">(optionnel)</span></label>
          <input {...register('phone')} type="tel" className="form-input" placeholder="06 XX XX XX XX" />
        </div>
        
        {/* TODO: Add cat registration section here */}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
          {isSubmitting ? 'Création...' : 'Créer mon compte'}
        </button>
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
