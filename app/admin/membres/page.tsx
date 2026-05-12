import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
import { formatDate, ROLE_LABELS } from '@/lib/utils'
import { MemberActions } from '@/components/admin/MemberActions'

export default async function AdminMembres({
  searchParams,
}: {
  searchParams: { filter?: string; q?: string }
}) {
  const where: Record<string, unknown> = {}
  if (searchParams.filter === 'pending') where.membershipActive = false
  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q, mode: 'insensitive' } },
      { email: { contains: searchParams.q, mode: 'insensitive' } },
    ]
  }

  const members = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { cats: true, registrations: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-csf-dark">Membres</h1>
          <p className="text-csf-muted">{members.length} résultat{members.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <a href="/admin/membres"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            !searchParams.filter ? 'bg-csf-dark text-white' : 'text-csf-muted hover:bg-gray-100'
          }`}>
          Tous ({members.length})
        </a>
        <a href="/admin/membres?filter=pending"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            searchParams.filter === 'pending' ? 'bg-csf-dark text-white' : 'text-csf-muted hover:bg-gray-100'
          }`}>
          En attente
        </a>
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
                  <span className={`badge ${member.membershipActive ? 'badge-green' : 'badge-yellow'}`}>
                    {member.membershipActive ? 'Active' : 'En attente'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-medium">{member._count.cats}</span>
                  <span className="text-csf-muted ml-1">({member._count.registrations} inscriptions)</span>
                </td>
                <td className="px-4 py-3 text-csf-muted">{formatDate(member.createdAt)}</td>
                <td className="px-4 py-3">
                  <MemberActions memberId={member.id} active={member.membershipActive} role={member.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
