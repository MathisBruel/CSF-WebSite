import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

type Props = { params: { id: string } }

export default async function CatDetailPage({ params }: Props) {
  const session = await auth()
  if (!session) return null

  const cat = await prisma.cat.findFirst({
    where: { id: params.id, ownerId: session.user.id },
    include: { catDocuments: true, vaccinations: true },
  })

  if (!cat) notFound()

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/membre/chats" className="text-sm text-csf-muted hover:text-csf-orange transition-colors">
            ← Mes chats
          </Link>
          <h1 className="text-2xl font-bold font-serif text-csf-dark mt-1">{cat.name}</h1>
          <p className="text-csf-muted">{cat.breed} · {cat.gender}</p>
        </div>
      </div>

      {/* Info card */}
      <div className="card">
        <h2 className="font-bold text-csf-dark mb-4">Informations</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Race', value: cat.breed },
            { label: 'Sexe', value: cat.gender },
            { label: 'Couleur', value: cat.color || '—' },
            { label: 'Date de naissance', value: formatDate(cat.birthDate) },
            { label: 'I-CAD', value: cat.icadNumber || '—' },
            { label: 'Pedigree', value: cat.pedigreeNumber || '—' },
            { label: 'Castré/stérilisé', value: cat.neutered ? 'Oui' : 'Non' },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-csf-muted">{label}</dt>
              <dd className="font-medium text-csf-dark">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
