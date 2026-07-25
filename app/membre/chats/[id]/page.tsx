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
    include: { vaccinations: true },
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
        <Link href={`/membre/chats/${cat.id}/edit`} className="btn-primary text-sm">
          Modifier
        </Link>
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
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-csf-muted">{label}</dt>
              <dd className="font-medium text-csf-dark">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Pedigree card */}
      <div className="card">
        <h2 className="font-bold text-csf-dark mb-4">Pedigree</h2>
        {cat.pedigreeInProgress ? (
          <p className="text-gray-400 font-medium">EN COURS</p>
        ) : (
          <p className="font-medium text-csf-dark">{cat.pedigreeNumber || '—'}</p>
        )}
      </div>

      {/* Certificat étranger */}
      {cat.foreignCatCertificate && (
        <div className="card">
          <h2 className="font-bold text-csf-dark mb-2">Certificat chat étranger</h2>
          <p className="text-sm font-medium text-csf-dark">{cat.foreignCatCertificate}</p>
        </div>
      )}

      {/* Championnat de France */}
      {cat.inscritChampionnatFrance && (
        <div className="card">
          <p className="text-sm font-medium text-csf-dark">✓ Inscrit au Championnat de France (CDF)</p>
        </div>
      )}
    </div>
  )
}
