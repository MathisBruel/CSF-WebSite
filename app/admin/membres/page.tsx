import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import { formatDate, ROLE_LABELS } from '@/lib/utils'
import { MemberActions } from '@/components/admin/MemberActions'
import { MembershipRequestActions } from '@/components/admin/MembershipRequestActions'

export default async function AdminMembres({
  searchParams,
}: {
  searchParams: { filter?: string; q?: string }
}) {
  const where: Record<string, unknown> = {}
  if (searchParams.filter === 'pending') where.membershipActive = false
  if (searchParams.filter === 'ADMIN') where.role = 'ADMIN'
  if (searchParams.filter === 'MEMBRE_ACTIF') where.role = 'MEMBRE_ACTIF'
  if (searchParams.filter === 'ADHERENT_CLUB') where.role = 'ADHERENT_CLUB'
  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q, mode: 'insensitive' } },
      { email: { contains: searchParams.q, mode: 'insensitive' } },
    ]
  }

  const [members, pendingRequests, roleCounts, inactiveCount] = await Promise.all([
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
    prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    }),
    prisma.user.count({ where: { membershipActive: false } }),
  ])

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
            <h2 className="font-semibold text-amber-900">Demandes d&apos;adhésion en attente</h2>
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
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        {(() => {
          const countMap = Object.fromEntries(roleCounts.map((r) => [r.role, r._count.role]))
          const totalCount = roleCounts.reduce((s, r) => s + r._count.role, 0)
          const filters: { label: string; value: string | undefined; count: number }[] = [
            { label: 'Tous', value: undefined, count: totalCount },
            { label: 'Administrateurs', value: 'ADMIN', count: countMap['ADMIN'] ?? 0 },
            { label: 'Membres Actifs', value: 'MEMBRE_ACTIF', count: countMap['MEMBRE_ACTIF'] ?? 0 },
            { label: 'Adhérents Club', value: 'ADHERENT_CLUB', count: countMap['ADHERENT_CLUB'] ?? 0 },
            { label: 'Non adhérents', value: 'pending', count: inactiveCount },
          ]
          return filters.map(({ label, value, count }) => {
            const active = searchParams.filter === value || (!searchParams.filter && !value)
            const href = value ? `/admin/membres?filter=${value}` : '/admin/membres'
            const displayCount = active ? members.length : count
            return (
              <a key={label} href={href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-csf-dark text-white' : 'text-csf-muted hover:bg-gray-100'
                }`}>
                {label} ({displayCount})
              </a>
            )
          })
        })()}
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
              <th className="text-left px-4 py-3 font-medium text-csf-muted">Rôle</th>
              <th className="text-left px-4 py-3 font-medium text-csf-muted">Adhésion</th>
              <th className="text-left px-4 py-3 font-medium text-csf-muted">Chats</th>
              <th className="text-left px-4 py-3 font-medium text-csf-muted">Inscrit le</th>
              <th className="text-left px-4 py-3 font-medium text-csf-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-csf-dark">{member.name}</p>
                  <p className="text-xs text-csf-muted">{member.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="badge badge-blue">{ROLE_LABELS[member.role]}</span>
                </td>
                <td className="px-4 py-3">
                  {member.membershipActive ? (
                    <span className="badge badge-green">Active</span>
                  ) : member.membershipRequests.length > 0 ? (
                    <span className="badge badge-yellow">En attente</span>
                  ) : (
                    <span className="badge badge-gray">Non adhérent</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-medium">{member._count.cats}</span>
                  <span className="text-csf-muted ml-1">({member._count.registrations} inscriptions)</span>
                </td>
                <td className="px-4 py-3 text-csf-muted">{formatDate(member.createdAt)}</td>
                <td className="px-4 py-3">
                  <MemberActions memberId={member.id} active={member.membershipActive} role={member.role} hasPendingRequest={member.membershipRequests.length > 0} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
