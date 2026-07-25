'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export function VerifyEmailContent() {
  const params = useSearchParams()
  const success = params.get('success')
  const error = params.get('error')

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark mb-2">Email confirmé !</h1>
        <p className="text-csf-muted mb-6">Votre compte est activé. Vous pouvez maintenant vous connecter.</p>
        <Link href="/login" className="btn-primary">Se connecter</Link>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark mb-2">Lien invalide</h1>
        <p className="text-csf-muted mb-6">
          Ce lien de vérification est invalide ou expiré. Créez un nouveau compte ou contactez-nous.
        </p>
        <Link href="/register" className="btn-primary">Créer un compte</Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
      <div className="w-16 h-16 bg-csf-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-csf-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold font-serif text-csf-dark mb-2">Vérifiez votre email</h1>
      <p className="text-csf-muted mb-2">
        Un email de confirmation a été envoyé à votre adresse.
      </p>
      <p className="text-csf-muted text-sm mb-6">
        Cliquez sur le lien dans l&apos;email pour activer votre compte. Le lien expire dans 24 heures.
      </p>
      <p className="text-sm text-csf-muted">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-csf-orange hover:text-csf-orange-dark font-medium">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
