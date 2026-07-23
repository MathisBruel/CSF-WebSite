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

      <div className="space-y-4">
        {registrations.map((reg) => (
          <div key={reg.id} className="bg-white rounded-xl border border-gray-200 p-5">
            {/* Registration header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`badge ${statusColors[reg.status]}`}>
                    {REGISTRATION_STATUS_LABELS[reg.status]}
                  </span>
                  <span className={`badge ${payColors[reg.paymentStatus]}`}>
                    Paiement: {PAYMENT_STATUS_LABELS[reg.paymentStatus]}
                  </span>
                </div>
                <h3 className="font-bold text-csf-dark">{reg.user.name}</h3>
                <p className="text-sm text-csf-muted">
                  {reg.exhibition.title} · {formatDate(reg.exhibition.startDate)}
                </p>
                <p className="text-sm text-csf-muted">{reg.user.city || 'Ville non renseignée'}</p>
                <p className="text-sm font-medium text-csf-dark mt-1">
                  {reg.cats.length} chat{reg.cats.length !== 1 ? 's' : ''} · {formatPrice(reg.totalAmount)}
                </p>
              </div>
              <RegistrationActions
                registrationId={reg.id}
                currentStatus={reg.status}
                currentPayment={reg.paymentStatus}
              />
            </div>

            {/* Per-cat details */}
            <div className="space-y-3">
              {reg.cats.map((rc) => (
                <div key={rc.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-csf-dark">{rc.cat.name}</p>
                        {rc.vetValidated && <span className="badge badge-green text-xs">Vét. ✓</span>}
                        {rc.catalogNumber && (
                          <span className="text-xs text-csf-muted">#{rc.catalogNumber}</span>
                        )}
                      </div>
                      <p className="text-sm text-csf-muted">{rc.cat.breed}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-csf-muted mt-1">
                        {rc.wantsCage && <span>Cage</span>}
                        {rc.wantsDoubleCage && <span>Cage double</span>}
                        {rc.mealsCount > 0 && <span>{rc.mealsCount} repas</span>}
                        {rc.participationDays.length > 0 && <span>{rc.participationDays.join(', ')}</span>}
                        {rc.traditionalClass && <span>Classe: {rc.traditionalClass}</span>}
                        {rc.isHorsConcours && <span>H.C.</span>}
                        {rc.wantsComplianceExam && <span>Conformité</span>}
                        {rc.specialParticipations.length > 0 && (
                          <span>{rc.specialParticipations.join(', ')}</span>
                        )}
                        <span className="font-medium text-csf-dark">{formatPrice(rc.amount)}</span>
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
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <p className="text-xs font-medium text-csf-muted uppercase tracking-wide mb-2">Documents</p>
                      <div className="flex flex-wrap gap-3">
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
