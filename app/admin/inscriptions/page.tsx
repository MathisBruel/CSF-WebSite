import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

import { formatDate, formatPrice, REGISTRATION_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/utils'
import { RegistrationActions } from '@/components/admin/RegistrationActions'
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
    where.cat = { catDocuments: { some: { validated: false } } }
  }

  const registrations = await prisma.registration.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true, city: true } },
      cat: {
        include: { catDocuments: true },
      },
      exhibition: { select: { title: true, startDate: true } },
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

      {/* Filters */}
      <RegistrationFilters
        exhibitions={exhibitions}
        currentExpo={searchParams.expo}
        currentFilter={searchParams.filter}
      />

      {/* List */}
      <div className="space-y-4">
        {registrations.map((reg) => (
          <div key={reg.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`badge ${statusColors[reg.status]}`}>
                    {REGISTRATION_STATUS_LABELS[reg.status]}
                  </span>
                  <span className={`badge ${payColors[reg.paymentStatus]}`}>
                    Paiement: {PAYMENT_STATUS_LABELS[reg.paymentStatus]}
                  </span>
                  {reg.vetValidated && <span className="badge badge-green">Vétérinaire ✓</span>}
                </div>
                <h3 className="font-bold text-csf-dark">{reg.user.name} — {reg.cat.name}</h3>
                <p className="text-sm text-csf-muted">
                  {reg.exhibition.title} · {formatDate(reg.exhibition.startDate)}
                </p>
                <p className="text-sm text-csf-muted mt-0.5">
                  {reg.cat.breed} · {reg.user.city || 'Ville non renseignée'}
                </p>
                <div className="flex gap-4 text-xs text-csf-muted mt-1">
                  {reg.wantsCage && <span>Cage</span>}
                  {reg.wantsDoubleCage && <span>Cage double</span>}
                  {reg.mealsCount > 0 && <span>{reg.mealsCount} repas</span>}
                  <span className="font-medium text-csf-dark">{formatPrice(reg.totalAmount)}</span>
                </div>
              </div>

              <RegistrationActions
                registrationId={reg.id}
                currentStatus={reg.status}
                currentPayment={reg.paymentStatus}
                vetValidated={reg.vetValidated}
                catalogNumber={reg.catalogNumber}
              />
            </div>

            {/* Documents */}
            {reg.cat.catDocuments.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-xs font-medium text-csf-muted uppercase tracking-wide mb-2">Documents</p>
                <div className="flex flex-wrap gap-3">
                  {reg.cat.catDocuments.map((doc) => (
                    <DocumentValidation key={doc.id} doc={doc} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
