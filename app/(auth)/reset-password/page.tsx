import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = { title: 'Réinitialisation du mot de passe' }

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="bg-white rounded-2xl shadow-xl p-8 text-center text-csf-muted">Chargement...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
