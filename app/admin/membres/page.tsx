import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import { formatDate } from '@/lib/utils'
import { MemberActions } from '@/components/admin/MemberActions'
import { MembershipRequestActions } from '@/components/admin/MembershipRequestActions'
import { deriveMemberStatus, MEMBER_STATUS_LABELS, type MemberStatus } from '@/lib/membership'
import type { Prisma } from '@prisma/client'

const STATUS_BADGE_CLASS: Record<MemberStatus, string> = {
  admin: 'badge-purple',
  active: 'badge-green',
  pending: 'badge-yellow',
  none: 'badge-gray',
}

function statusWhere(status: MemberStatus): Prisma.UserWhereInput {
  switch (status) {
    case 'admin':
      return { role: 'ADMIN' }
    case 'active':
      return { role: { not: 'ADMIN' }, membershipActive: true }
    case 'pending':
      return { role: { not: 'ADMIN' }, membershipActive: false, membershipRequests: { some: { status: 'PENDING' } } }
    case 'none':
      return { role: { not: 'ADMIN' }, membershipActive: false, membershipRequests: { none: { status: 'PENDING' } } }
  }
}

export default async function AdminMembres({
  searchParams,
}: {
  searchParams: { filter?: string; q?: string }
}) {
  const filter = searchParams.filter as MemberStatus | undefined
  const where: Prisma.UserWhereInput = filter ? statusWhere(filter) : {}
  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q, mode: 'insensitive' } },
      { email: { contains: searchParams.q, mode: 'insensitive' } },
    ]
  }

  const [members, pendingRequests, admin, active, pending, none] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { cats: true, registrations: true } },
        membershipRequests: { where: { status: 'PENDING' }, select: { id: true } },
      },
    }),
    prisma.membershipRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { requestedAt: 'asc' },
      include: { user: { select: { id: true, name: true, email: true, createdAt: true } } },
    }),
    prisma.user.count({ where: statusWhere('admin') }),
    prisma.user.count({ where: statusWhere('active') }),
    prisma.user.count({ where: statusWhere('pending') }),
    prisma.user.count({ where: statusWhere('none') }),
  ])

  const total = admin + active + pending + none

  const filters: { label: string; value: MemberStatus | undefined; count: number }[] = [
    { label: 'Tous', value: undefined, count: total },
    { label: MEMBER_STATUS_LABELS.admin, value: 'admin', count: admin },
    { label: MEMBER_STATUS_LABELS.active, value: 'active', count: active },
    { label: MEMBER_STATUS_LABELS.pending, value: 'pending', count: pending },
    { label: MEMBER_STATUS_LABELS.none, value: 'none', count: none },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-csf-dark">Membres</h1>
          <p className="text-csf-muted">{members.length} résultat{members.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Pending membership requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-amber-200 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full">
              {pendingRequests.length}
            </span>
            <h2 className="font-semibold text-amber-900">Demandes d&apos;adhésion en attente de validation</h2>
          </div>
          <div className="divide-y divide-amber-100">
            {pendingRequests.map((req) => (
              <div key={req.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-csf-dark text-sm">{req.user.name}</p>
                  <p className="text-xs text-csf-muted">{req.user.email} · Demande le {formatDate(req.requestedAt)}</p>
                  {req.message && (
                    <p className="text-xs text-gray-600 mt-1 italic">&ldquo;{req.message}&rdquo;</p>
                  )}
                </div>
                <MembershipRequestActions requestId={req.id} />
              </div>
            ))}
          </div>
          <p className="px-5 py-2 bg-amber-100/60 text-xs text-amber-800">
            Un email demandant le règlement de la cotisation annuelle a été envoyé automatiquement à chaque demande. Utilisez « Relancer paiement » si le règlement se fait attendre, avant de valider.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        {filters.map(({ label, value, count }) => {
          const active = filter === value || (!filter && !value)
          const href = value ? `/admin/membres?filter=${value}` : '/admin/membres'
          return (
            <a key={label} href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-csf-dark text-white' : 'text-csf-muted hover:bg-gray-100'
              }`}>
              {label} ({count})
            </a>
          )
        })}
        <form method="GET" className="ml-auto">
          <input name="q" defaultValue={searchParams.q}
            placeholder="Rechercher..." className="form-input text-sm py-1.5 w-64" />
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-csf-muted">Membre</th>
              <th className="text-left px-4 py-3 font-medium text-csf-muted">Statut</th>
              <th className="text-left px-4 py-3 font-medium text-csf-muted">Chats</th>
              <th className="text-left px-4 py-3 font-medium text-csf-muted">Inscrit le</th>
              <th className="text-left px-4 py-3 font-medium text-csf-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((member) => {
              const status = deriveMemberStatus({
                role: member.role,
                membershipActive: member.membershipActive,
                hasPendingRequest: member.membershipRequests.length > 0,
              })
              return (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-csf-dark">{member.name}</p>
                    <p className="text-xs text-csf-muted">{member.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={STATUS_BADGE_CLASS[status]}>{MEMBER_STATUS_LABELS[status]}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-medium">{member._count.cats}</span>
                    <span className="text-csf-muted ml-1">({member._count.registrations} inscriptions)</span>
                  </td>
                  <td className="px-4 py-3 text-csf-muted">{formatDate(member.createdAt)}</td>
                  <td className="px-4 py-3">
                    <MemberActions memberId={member.id} status={status} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
