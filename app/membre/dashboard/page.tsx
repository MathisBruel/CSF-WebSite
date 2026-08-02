import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { formatDate, REGISTRATION_STATUS_LABELS } from '@/lib/utils'
import { ExhibitionStatus } from '@prisma/client'
import { MembershipRequestButton } from '@/components/membre/MembershipRequestButton'

export default async function MemberDashboard() {
  const session = await auth()
  if (!session) return null
  const userId = session.user.id

  const [cats, registrations, openExpos, membershipRequest, paymentConfig] = await Promise.all([
    prisma.cat.count({ where: { ownerId: userId } }),
    prisma.registration.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        exhibition: { select: { title: true, startDate: true, city: true } },
        cats: { include: { cat: { select: { name: true } } } },
      },
    }),
    prisma.exhibition.findMany({
      where: { status: ExhibitionStatus.OPEN },
      take: 3,
      orderBy: { startDate: 'asc' },
    }),
    prisma.membershipRequest.findFirst({
      where: { userId },
      orderBy: { requestedAt: 'desc' },
    }),
    prisma.siteConfig.findMany({
      where: {
        key: {
          in: ['membership_price', 'membership_rib_iban', 'membership_rib_bic', 'membership_rib_holder', 'membership_paypal_link'],
        },
      },
    }),
  ])

  const cfg = Object.fromEntries(paymentConfig.map((r) => [r.key, r.value]))

  const statusColors: Record<string, string> = {
    PENDING: 'badge-yellow',
    VALIDATED: 'badge-green',
    REJECTED: 'badge-red',
    WAITING_DOCS: 'badge-blue',
  }

  const priceLabel = cfg['membership_price'] ? `${cfg['membership_price']} €` : null

  // Membership banner logic
  const renderMembershipBanner = () => {
    if (session.user.membershipActive || session.user.role === 'ADMIN') return null

    if (!membershipRequest || membershipRequest.status === 'REJECTED') {
      return (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            {membershipRequest?.status === 'REJECTED' ? (
              <>
                <p className="font-medium text-orange-800">Demande d&apos;adhésion refusée</p>
                {membershipRequest.rejectionReason && (
                  <p className="text-sm text-orange-700 mt-1">Motif : {membershipRequest.rejectionReason}</p>
                )}
                <p className="text-sm text-orange-700 mt-1">Vous pouvez soumettre une nouvelle demande.</p>
              </>
            ) : (
              <>
                <p className="font-medium text-orange-800">Vous n&apos;êtes pas adhérent</p>
                <p className="text-sm text-orange-700">
                  L&apos;adhésion n&apos;est pas obligatoire, mais elle donne accès aux tarifs préférentiels sur les expositions.
                  {priceLabel && ` Cotisation annuelle : ${priceLabel}.`}
                </p>
              </>
            )}
            <div className="mt-3">
              <MembershipRequestButton price={cfg['membership_price']} />
            </div>
          </div>
        </div>
      )
    }

    if (membershipRequest.status === 'PENDING') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-blue-800">Demande d&apos;adhésion en cours</p>
              <p className="text-sm text-blue-700">Soumise le {formatDate(membershipRequest.requestedAt)}. Le bureau validera votre adhésion dès réception du règlement.</p>
            </div>
          </div>
          <div className="mt-3 ml-8">
            <p className="text-sm text-blue-800 font-medium mb-2">
              Cotisation annuelle à régler{priceLabel ? ` : ${priceLabel}` : ''}
            </p>
            {cfg['membership_rib_iban'] && (
              <div className="bg-white border border-blue-200 rounded-lg p-3 text-sm space-y-1 mb-3">
                <p><strong>Virement bancaire :</strong></p>
                <p className="font-mono">IBAN : {cfg['membership_rib_iban']}</p>
                {cfg['membership_rib_bic'] && <p className="font-mono">BIC : {cfg['membership_rib_bic']}</p>}
                {cfg['membership_rib_holder'] && <p className="font-mono">Titulaire : {cfg['membership_rib_holder']}</p>}
              </div>
            )}
            {cfg['membership_paypal_link'] && (
              <a
                href={cfg['membership_paypal_link']}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block btn-primary text-sm">
                Payer via PayPal
              </a>
            )}
          </div>
        </div>
      )
    }

    return null
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

      {renderMembershipBanner()}

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
                  <p className="text-xs text-csf-muted">{reg.cats.map((rc) => rc.cat.name).join(', ')} · {formatDate(reg.exhibition.startDate)}</p>
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
