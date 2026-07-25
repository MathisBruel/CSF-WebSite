import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { VerifyEmailContent } from '@/components/auth/VerifyEmailContent'

export const metadata: Metadata = { title: 'Vérification email' }

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="bg-white rounded-2xl shadow-xl p-8 text-center text-csf-muted">Chargement...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
