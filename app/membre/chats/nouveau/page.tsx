import type { Metadata } from 'next'
import { AddCatForm } from '@/components/membre/AddCatForm'

export const metadata: Metadata = { title: 'Ajouter un chat' }

export default function NouveauChatPage({
  searchParams,
}: {
  searchParams: { returnTo?: string }
}) {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-serif text-csf-dark">Ajouter un chat</h1>
        <p className="text-csf-muted mt-1">Enregistrez les informations de votre chat</p>
      </div>
      <AddCatForm returnTo={searchParams.returnTo} />
    </div>
  )
}
