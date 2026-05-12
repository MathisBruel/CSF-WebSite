import type { Metadata } from 'next'
import { ExhibitionForm } from '@/components/admin/ExhibitionForm'

export const metadata: Metadata = { title: 'Nouvelle exposition' }

export default function NouvelleExpoPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-serif text-csf-dark">Nouvelle exposition</h1>
      </div>
      <ExhibitionForm />
    </div>
  )
}
