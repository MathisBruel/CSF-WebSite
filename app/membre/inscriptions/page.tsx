import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { formatDate, formatPrice, REGISTRATION_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/utils'

export default async function MesInscriptions() {
  const session = await auth()
  if (!session) return null

  const registrations = await prisma.registration.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      exhibition: { select: { title: true, startDate: true, endDate: true, city: true, slug: true } },
      cats: {
        include: { cat: { select: { name: true, breed: true } } },
      },
    },
  })

  const statusColors: Record<string, string> = {
    PENDING: 'badge-yellow', VALIDATED: 'badge-green',
    REJECTED: 'badge-red', WAITING_DOCS: 'badge-blue',
  }
  const paymentColors: Record<string, string> = {
    PENDING: 'badge-yellow', PAID: 'badge-green', REFUNDED: 'badge-blue',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-csf-dark">Mes inscriptions</h1>
          <p className="text-csf-muted mt-1">{registrations.length} inscription{registrations.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/expositions" className="btn-primary">
          S&apos;inscrire à une expo
        </Link>
      </div>

      {registrations.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">🏆</div>
          <h3 className="font-bold text-csf-dark mb-2">Aucune inscription</h3>
          <p className="text-csf-muted text-sm mb-4">Consultez le calendrier des expositions pour inscrire vos chats.</p>
          <Link href="/expositions" className="btn-primary">Voir les expositions</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => (
            <div key={reg.id} className="card">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`badge ${statusColors[reg.status]}`}>
                      {REGISTRATION_STATUS_LABELS[reg.status]}
                    </span>
                    <span className={`badge ${paymentColors[reg.paymentStatus]}`}>
                      Paiement : {PAYMENT_STATUS_LABELS[reg.paymentStatus]}
                    </span>
                  </div>
                  <h3 className="font-bold font-serif text-csf-dark">{reg.exhibition.title}</h3>
                  <p className="text-sm text-csf-muted">
                    {formatDate(reg.exhibition.startDate)} · {reg.exhibition.city}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-csf-dark">{formatPrice(reg.totalAmount)}</p>
                  {reg.convocationUrl && (
                    <a href={reg.convocationUrl} download
                      className="mt-2 inline-flex items-center gap-1 text-xs text-csf-orange hover:text-csf-orange-dark">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Convocation
                    </a>
                  )}
                </div>
              </div>

              {/* Cats list */}
              <div className="space-y-2 border-t border-csf-light pt-3">
                {reg.cats.map((rc) => (
                  <div key={rc.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-csf-dark">{rc.cat.name}</span>
                      <span className="text-csf-muted">{rc.cat.breed}</span>
                      <div className="flex gap-2 text-xs text-csf-muted">
                        {rc.wantsCage && <span>Cage</span>}
                        {rc.wantsDoubleCage && <span>Cage double</span>}
                        {rc.mealsCount > 0 && <span>{rc.mealsCount} repas</span>}
                        {rc.catalogNumber && <span className="text-csf-dark font-medium">#{rc.catalogNumber}</span>}
                        {rc.vetValidated && <span className="text-green-600">Vét. ✓</span>}
                      </div>
                    </div>
                    <span className="text-csf-muted">{formatPrice(rc.amount)}</span>
                  </div>
                ))}
              </div>

              {reg.adminNotes && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  Note : {reg.adminNotes}
                </div>
              )}
              {reg.rejectionReason && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                  Motif de refus : {reg.rejectionReason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
