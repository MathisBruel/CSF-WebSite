import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate, formatPrice, EXHIBITION_STATUS_LABELS } from '@/lib/utils'
import { ExhibitionStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Expositions' }

const STATUS_BADGE: Record<ExhibitionStatus, string> = {
  OPEN: 'badge-green',
  DRAFT: 'badge-blue',
  CLOSED: 'badge-yellow',
  ARCHIVED: 'badge-gray',
}

export default async function ExpositionsPage() {
  const exhibitions = await prisma.exhibition.findMany({
    where: { status: { not: ExhibitionStatus.ARCHIVED } },
    orderBy: { startDate: 'asc' },
    include: { _count: { select: { registrations: true } } },
  })

  const archived = await prisma.exhibition.findMany({
    where: { status: ExhibitionStatus.ARCHIVED },
    orderBy: { startDate: 'desc' },
    take: 6,
    include: { _count: { select: { registrations: true } } },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="section-title">Expositions Félines</h1>
        <p className="section-subtitle">Calendrier des expositions organisées par Chats Sans Frontières</p>
      </div>

      {/* Upcoming */}
      <section>
        <h2 className="text-xl font-bold text-csf-dark mb-6">Expositions à venir</h2>
        {exhibitions.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-csf-muted">Aucune exposition programmée pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {exhibitions.map((expo) => (
              <div key={expo.id} className="card hover:shadow-md transition-shadow group flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className={`badge ${STATUS_BADGE[expo.status]}`}>
                    {EXHIBITION_STATUS_LABELS[expo.status]}
                  </span>
                  <span className="text-xs text-csf-muted">{expo.city}</span>
                </div>
                <h3 className="font-bold font-serif text-csf-dark text-lg leading-tight mb-3 group-hover:text-csf-orange transition-colors flex-1">
                  {expo.title}
                </h3>
                {expo.description && (
                  <p className="text-csf-muted text-sm line-clamp-2 mb-4">{expo.description}</p>
                )}
                <div className="space-y-2 text-sm text-csf-muted mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-csf-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(expo.startDate)} – {formatDate(expo.endDate)}
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-csf-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {expo.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-csf-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    À partir de {formatPrice(expo.priceBase)}
                  </div>
                  {expo.registrationDeadline && (
                    <div className="flex items-center gap-2 text-xs text-orange-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Clôture des inscriptions : {formatDate(expo.registrationDeadline)}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-auto">
                  <Link href={`/expositions/${expo.slug}`}
                    className="flex-1 text-center py-2 px-3 border border-csf-orange text-csf-orange rounded-lg text-sm font-medium hover:bg-csf-orange hover:text-white transition-colors">
                    Détails
                  </Link>
                  {expo.status === ExhibitionStatus.OPEN && (
                    <Link href={`/membre/inscriptions/${expo.id}`}
                      className="flex-1 text-center py-2 px-3 bg-csf-orange text-white rounded-lg text-sm font-medium hover:bg-csf-orange-dark transition-colors">
                      S&apos;inscrire
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Archived */}
      {archived.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-csf-dark mb-6">Expositions passées</h2>
          <div className="space-y-3">
            {archived.map((expo) => (
              <div key={expo.id} className="card flex items-center justify-between py-4 opacity-75 hover:opacity-100 transition-opacity">
                <div>
                  <h3 className="font-medium text-csf-dark">{expo.title}</h3>
                  <p className="text-sm text-csf-muted">{expo.city} · {formatDate(expo.startDate)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-csf-muted">{expo._count.registrations} participants</span>
                  <span className="badge badge-gray">Archivée</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
