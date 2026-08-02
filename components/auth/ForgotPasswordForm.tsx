'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  email: z.string().email('Email invalide'),
})

type FormData = z.infer<typeof schema>

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      setSent(true)
    } catch {
      setError('Une erreur est survenue. Réessayez plus tard.')
    }
  }

  if (sent) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-csf-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-csf-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark mb-2">Vérifiez votre email</h1>
        <p className="text-csf-muted text-sm mb-6">
          Si un compte existe avec cette adresse, un lien de réinitialisation vient d&apos;être envoyé. Le lien expire dans 1 heure.
        </p>
        <Link href="/login" className="text-csf-orange hover:text-csf-orange-dark font-medium text-sm">
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold font-serif text-csf-dark mb-1 text-center">Mot de passe oublié</h1>
      <p className="text-center text-csf-muted text-sm mb-6">
        Entrez votre email pour recevoir un lien de réinitialisation
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="form-label">Adresse email</label>
          <input {...register('email')} type="email" className="form-input" placeholder="vous@exemple.fr" autoComplete="email" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
          {isSubmitting ? 'Envoi...' : 'Envoyer le lien'}
        </button>
      </form>

      <p className="text-center text-sm text-csf-muted mt-6">
        <Link href="/login" className="text-csf-orange hover:text-csf-orange-dark font-medium">
          Retour à la connexion
        </Link>
      </p>
    </div>
  )
}
