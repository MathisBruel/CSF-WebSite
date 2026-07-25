import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function MesChatsList() {
  const session = await auth()
  if (!session) return null

  const cats = await prisma.cat.findMany({
    where: { ownerId: session.user.id },
    include: {
      vaccinations: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-csf-dark">Mes chats</h1>
          <p className="text-csf-muted mt-1">{cats.length} chat{cats.length !== 1 ? 's' : ''} enregistré{cats.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/membre/chats/nouveau" className="btn-primary">
          + Ajouter un chat
        </Link>
      </div>

      {cats.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">🐱</div>
          <h3 className="font-bold text-csf-dark mb-2">Aucun chat enregistré</h3>
          <p className="text-csf-muted text-sm mb-4">Ajoutez vos chats pour pouvoir les inscrire aux expositions.</p>
          <Link href="/membre/chats/nouveau" className="btn-primary">
            Ajouter mon premier chat
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cats.map((cat) => {
            return (
              <div key={cat.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold font-serif text-csf-dark text-lg">{cat.name}</h3>
                    <p className="text-sm text-csf-muted">{cat.breed} · {cat.gender}</p>
                  </div>
                  <Link href={`/membre/chats/${cat.id}`}
                    className="text-xs text-csf-orange hover:text-csf-orange-dark font-medium">
                    Modifier
                  </Link>
                </div>

                <div className="space-y-1.5 text-sm text-csf-muted mb-4">
                  <div className="flex justify-between">
                    <span>Né(e) le</span>
                    <span className="font-medium text-csf-dark">{formatDate(cat.birthDate)}</span>
                  </div>
                  {cat.icadNumber && (
                    <div className="flex justify-between">
                      <span>I-CAD</span>
                      <span className="font-mono text-xs text-csf-dark">{cat.icadNumber}</span>
                    </div>
                  )}
                  {cat.pedigreeNumber && (
                    <div className="flex justify-between">
                      <span>Pedigree</span>
                      <span className="font-mono text-xs text-csf-dark">{cat.pedigreeNumber}</span>
                    </div>
                  )}
                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
