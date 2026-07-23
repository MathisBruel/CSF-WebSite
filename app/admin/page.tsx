import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
import { RegistrationStatus, ExhibitionStatus } from '@prisma/client'

export default async function AdminDashboard() {
  const [
    totalMembers,
    pendingMembers,
    totalCats,
    openExpos,
    pendingRegistrations,
    totalRegistrations,
    pendingDocs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { membershipActive: false } }),
    prisma.cat.count(),
    prisma.exhibition.count({ where: { status: ExhibitionStatus.OPEN } }),
    prisma.registration.count({ where: { status: RegistrationStatus.PENDING } }),
    prisma.registration.count(),
    prisma.catDocument.count({ where: { validated: false } }),
  ])

  const recentRegistrations = await prisma.registration.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true } },
      exhibition: { select: { title: true } },
      cats: { include: { cat: { select: { name: true } } } },
    },
  })

  const statusColors: Record<string, string> = {
    PENDING: 'badge-yellow', VALIDATED: 'badge-green',
    REJECTED: 'badge-red', WAITING_DOCS: 'badge-blue',
  }
  const statusLabels: Record<string, string> = {
    PENDING: 'En attente', VALIDATED: 'Validée',
    REJECTED: 'Refusée', WAITING_DOCS: 'Docs manquants',
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark">Administration</h1>
        <p className="text-csf-muted">Tableau de bord — Chats Sans Frontières</p>
      </div>

      {/* Alerts */}
      {(pendingMembers > 0 || pendingRegistrations > 0 || pendingDocs > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pendingMembers > 0 && (
            <Link href="/admin/membres?filter=pending"
              className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors">
              <span className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">{pendingMembers}</span>
              <span className="text-sm font-medium text-orange-800">adhésion{pendingMembers > 1 ? 's' : ''} à valider</span>
            </Link>
          )}
          {pendingRegistrations > 0 && (
            <Link href="/admin/inscriptions?filter=pending"
              className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors">
              <span className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">{pendingRegistrations}</span>
              <span className="text-sm font-medium text-blue-800">inscription{pendingRegistrations > 1 ? 's' : ''} en attente</span>
            </Link>
          )}
          {pendingDocs > 0 && (
            <Link href="/admin/inscriptions?filter=docs"
              className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl hover:bg-yellow-100 transition-colors">
              <span className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center text-yellow-700 font-bold text-sm">{pendingDocs}</span>
              <span className="text-sm font-medium text-yellow-800">document{pendingDocs > 1 ? 's' : ''} à valider</span>
            </Link>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Membres total', value: totalMembers, href: '/admin/membres', color: 'bg-blue-500' },
          { label: 'Chats enregistrés', value: totalCats, href: '/admin/membres', color: 'bg-csf-orange' },
          { label: 'Expos ouvertes', value: openExpos, href: '/admin/expositions', color: 'bg-green-500' },
          { label: 'Inscriptions total', value: totalRegistrations, href: '/admin/inscriptions', color: 'bg-purple-500' },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className={`w-8 h-1 ${stat.color} rounded-full mb-3`} />
            <p className="text-3xl font-bold text-csf-dark">{stat.value}</p>
            <p className="text-sm text-csf-muted mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent registrations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-csf-dark">Dernières inscriptions</h2>
          <Link href="/admin/inscriptions" className="text-csf-orange text-sm hover:text-csf-orange-dark">
            Voir toutes →
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentRegistrations.map((reg) => (
            <div key={reg.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-csf-dark">
                  {reg.user.name} — {reg.cats.map((rc) => rc.cat.name).join(', ')}
                </p>
                <p className="text-xs text-csf-muted">{reg.exhibition.title}</p>
              </div>
              <span className={`badge ${statusColors[reg.status]}`}>
                {statusLabels[reg.status]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
