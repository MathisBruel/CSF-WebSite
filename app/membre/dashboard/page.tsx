import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { formatDate, formatPrice, REGISTRATION_STATUS_LABELS } from '@/lib/utils'
import { ExhibitionStatus } from '@prisma/client'

export default async function MemberDashboard() {
  const session = await auth()
  if (!session) return null
  const userId = session.user.id

  const [cats, registrations, openExpos] = await Promise.all([
    prisma.cat.count({ where: { ownerId: userId } }),
    prisma.registration.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        exhibition: { select: { title: true, startDate: true, city: true } },
        cat: { select: { name: true } },
      },
    }),
    prisma.exhibition.findMany({
      where: { status: ExhibitionStatus.OPEN },
      take: 3,
      orderBy: { startDate: 'asc' },
    }),
  ])

  const statusColors: Record<string, string> = {
    PENDING: 'badge-yellow',
    VALIDATED: 'badge-green',
    REJECTED: 'badge-red',
    WAITING_DOCS: 'badge-blue',
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark">
          Bonjour, {session.user.name.split(' ')[0]} 👋
        </h1>
        <p className="text-csf-muted mt-1">Bienvenue dans votre espace membre</p>
      </div>

      {/* Membership alert */}
      {!session.user.membershipActive && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-medium text-orange-800">Adhésion en attente de validation</p>
            <p className="text-sm text-orange-700">Votre adhésion est en cours de validation par le bureau. Vous recevrez une confirmation par email.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Mes chats', value: cats, href: '/membre/chats', icon: '🐱' },
          { label: 'Inscriptions', value: registrations.length, href: '/membre/inscriptions', icon: '🎫' },
          { label: 'Expos ouvertes', value: openExpos.length, href: '/expositions', icon: '🏆' },
          { label: 'Statut adhésion', value: session.user.membershipActive ? 'Active' : 'En attente', href: '/membre/profil', icon: '✅' },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}
            className="card hover:shadow-md transition-shadow group text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <p className="text-2xl font-bold text-csf-dark group-hover:text-csf-orange transition-colors">
              {stat.value}
            </p>
            <p className="text-xs text-csf-muted">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent registrations */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-csf-dark">Mes dernières inscriptions</h2>
          <Link href="/membre/inscriptions" className="text-csf-orange text-sm hover:text-csf-orange-dark">
            Voir toutes →
          </Link>
        </div>
        {registrations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-csf-muted text-sm mb-3">Vous n&apos;avez pas encore d&apos;inscriptions.</p>
            <Link href="/expositions" className="btn-primary text-sm">
              Voir les expositions
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {registrations.map((reg) => (
              <div key={reg.id} className="flex items-center justify-between py-2 border-b border-csf-light last:border-0">
                <div>
                  <p className="font-medium text-sm text-csf-dark">{reg.exhibition.title}</p>
                  <p className="text-xs text-csf-muted">{reg.cat.name} · {formatDate(reg.exhibition.startDate)}</p>
                </div>
                <span className={`badge ${statusColors[reg.status]}`}>
                  {REGISTRATION_STATUS_LABELS[reg.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Open expositions */}
      {openExpos.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-csf-dark">Expositions ouvertes aux inscriptions</h2>
            <Link href="/expositions" className="text-csf-orange text-sm hover:text-csf-orange-dark">
              Voir toutes →
            </Link>
          </div>
          <div className="space-y-3">
            {openExpos.map((expo) => (
              <div key={expo.id} className="flex items-center justify-between py-2 border-b border-csf-light last:border-0">
                <div>
                  <p className="font-medium text-sm text-csf-dark">{expo.title}</p>
                  <p className="text-xs text-csf-muted">{expo.city} · {formatDate(expo.startDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-csf-dark">{formatPrice(expo.priceBase)}</span>
                  <Link href={`/membre/inscriptions/${expo.id}`}
                    className="text-xs btn-primary py-1 px-3">
                    S&apos;inscrire
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
