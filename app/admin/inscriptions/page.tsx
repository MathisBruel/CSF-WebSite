import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

import { formatDate, formatPrice, REGISTRATION_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/utils'
import { RegistrationActions } from '@/components/admin/RegistrationActions'
import { RegistrationCatActions } from '@/components/admin/RegistrationCatActions'
import { DocumentValidation } from '@/components/admin/DocumentValidation'
import { RegistrationFilters } from '@/components/admin/RegistrationFilters'

export default async function AdminInscriptions({
  searchParams,
}: {
  searchParams: { filter?: string; expo?: string }
}) {
  const where: Record<string, unknown> = {}
  if (searchParams.expo) where.exhibitionId = searchParams.expo
  if (searchParams.filter === 'pending') where.status = 'PENDING'
  if (searchParams.filter === 'docs') {
    where.cats = { some: { cat: { catDocuments: { some: { validated: false } } } } }
  }

  const registrations = await prisma.registration.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true, city: true } },
      exhibition: { select: { title: true, startDate: true } },
      cats: {
        include: {
          cat: { include: { catDocuments: true } },
        },
      },
    },
  })

  const exhibitions = await prisma.exhibition.findMany({
    select: { id: true, title: true },
    orderBy: { startDate: 'desc' },
    take: 20,
  })

  const statusColors: Record<string, string> = {
    PENDING: 'badge-yellow', VALIDATED: 'badge-green',
    REJECTED: 'badge-red', WAITING_DOCS: 'badge-blue',
  }
  const payColors: Record<string, string> = {
    PENDING: 'badge-yellow', PAID: 'badge-green', REFUNDED: 'badge-blue',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-csf-dark">Inscriptions</h1>
          <p className="text-csf-muted">{registrations.length} inscription{registrations.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <RegistrationFilters
        exhibitions={exhibitions}
        currentExpo={searchParams.expo}
        currentFilter={searchParams.filter}
      />

      <div className="space-y-2">
        {registrations.map((reg) => (
          <div key={reg.id} className="bg-white rounded-xl border border-gray-200 p-3">
            {/* Registration header */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <span className={`badge ${statusColors[reg.status]}`}>
                    {REGISTRATION_STATUS_LABELS[reg.status]}
                  </span>
                  <span className={`badge ${payColors[reg.paymentStatus]}`}>
                    {PAYMENT_STATUS_LABELS[reg.paymentStatus]}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="font-bold text-csf-dark text-sm">{reg.user.name}</h3>
                  <span className="text-xs text-csf-muted">{reg.user.city || 'Ville non renseignée'}</span>
                </div>
                <p className="text-xs text-csf-muted">
                  {reg.exhibition.title} · {formatDate(reg.exhibition.startDate)} ·{' '}
                  <span className="font-medium text-csf-dark">{reg.cats.length} chat{reg.cats.length !== 1 ? 's' : ''} · {formatPrice(reg.totalAmount)}</span>
                  {(reg.personalCages > 0 || reg.borrowedCages > 0) && (
                    <span className="ml-1">
                      · {[reg.personalCages > 0 && `${reg.personalCages} cage${reg.personalCages > 1 ? 's' : ''} perso`, reg.borrowedCages > 0 && `${reg.borrowedCages} cage${reg.borrowedCages > 1 ? 's' : ''} club`].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </p>
              </div>
              <RegistrationActions
                registrationId={reg.id}
                currentStatus={reg.status}
                currentPayment={reg.paymentStatus}
              />
            </div>

            {/* Per-cat details */}
            <div className="space-y-1.5 border-t border-gray-100 pt-2">
              {reg.cats.map((rc) => (
                <div key={rc.id} className="border border-gray-100 rounded-lg p-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-medium text-csf-dark text-sm">{rc.cat.name}</p>
                        <span className="text-xs text-csf-muted">{rc.cat.breed}</span>
                        {rc.vetValidated && <span className="badge badge-green text-xs">Vét. ✓</span>}
                        {rc.catalogNumber && <span className="text-xs text-csf-muted">#{rc.catalogNumber}</span>}
                        {rc.participationDays.length > 0 && <span className="text-xs text-csf-muted">{rc.participationDays.join(', ')}</span>}
                        {rc.isConformityOnly ? (
                          <span className="badge badge-yellow text-xs font-semibold">Conformité seule</span>
                        ) : (
                          <>
                            {rc.traditionalClassSaturday && <span className="text-xs text-csf-muted">Cl. Sam. {rc.traditionalClassSaturday}</span>}
                            {rc.traditionalClassSunday && <span className="text-xs text-csf-muted">Cl. Dim. {rc.traditionalClassSunday}</span>}
                            {rc.isHorsConcours && <span className="text-xs text-csf-muted">H.C.</span>}
                            {rc.wantsComplianceExam && <span className="text-xs text-csf-muted">Conformité</span>}
                            {rc.specialParticipations.length > 0 && <span className="text-xs text-csf-muted">{rc.specialParticipations.join(', ')}</span>}
                          </>
                        )}
                        <span className="text-xs font-medium text-csf-dark">{formatPrice(rc.amount)}</span>
                      </div>
                    </div>
                    <RegistrationCatActions
                      registrationId={reg.id}
                      catId={rc.catId}
                      vetValidated={rc.vetValidated}
                      catalogNumber={rc.catalogNumber}
                      registrationStatus={reg.status}
                    />
                  </div>

                  {rc.cat.catDocuments.length > 0 && (
                    <div className="mt-1.5 border-t border-gray-100 pt-1.5">
                      <div className="flex flex-wrap gap-2">
                        {rc.cat.catDocuments.map((doc) => (
                          <DocumentValidation key={doc.id} doc={doc} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
