import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import { ProfilForm } from '@/components/membre/ProfilForm'
import { MembershipRequestButton } from '@/components/membre/MembershipRequestButton'
import { formatDate, ROLE_LABELS } from '@/lib/utils'
import { deriveMemberStatus } from '@/lib/membership'

export default async function ProfilPage() {
  const session = await auth()
  if (!session) return null

  const [user, membershipPriceConfig, pendingRequest] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true, name: true, email: true,
        firstName: true, lastName: true, civilite: true,
        phone: true, phoneFixed: true,
        address: true, address2: true, city: true, postalCode: true, country: true,
        exposantType: true, certificatCapacite: true, siret: true, affixe: true,
        role: true, membershipActive: true, membershipExpiry: true,
        newsletterSubscribed: true, createdAt: true,
      },
    }),
    prisma.siteConfig.findUnique({ where: { key: 'membership_price' } }),
    prisma.membershipRequest.findFirst({ where: { userId: session.user.id, status: 'PENDING' } }),
  ])

  if (!user) return null

  const priceLabel = membershipPriceConfig?.value
  const status = deriveMemberStatus({
    role: user.role,
    membershipActive: user.membershipActive,
    hasPendingRequest: !!pendingRequest,
  })

  const cardStyle = status === 'active'
    ? 'border-green-300 bg-green-50'
    : status === 'admin'
    ? 'border-purple-300 bg-purple-50'
    : 'border-orange-300 bg-orange-50'
  const textStyle = status === 'active'
    ? 'text-green-700'
    : status === 'admin'
    ? 'text-purple-700'
    : 'text-orange-700'

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark">Mon profil</h1>
        <p className="text-csf-muted mt-1">Gérez vos informations personnelles</p>
      </div>

      {/* Membership card */}
      <div className={`card border-2 ${cardStyle}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-csf-dark">{ROLE_LABELS[user.role]}</p>
            <p className={`text-sm ${textStyle}`}>
              {status === 'active' && `Adhésion active${user.membershipExpiry ? ` jusqu'au ${formatDate(user.membershipExpiry)}` : ''}`}
              {status === 'pending' && 'Demande d\'adhésion en attente de validation par le bureau.'}
              {status === 'none' && 'Vous n\'êtes pas adhérent.'}
              {status === 'admin' && 'Administrateur'}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            status === 'active' ? 'bg-green-100' : status === 'admin' ? 'bg-purple-100' : 'bg-orange-100'
          }`}>
            {status === 'active' ? '✓' : status === 'admin' ? '★' : status === 'pending' ? '⏳' : '·'}
          </div>
        </div>

        {status === 'none' && (
          <div className="mt-4 pt-4 border-t border-orange-200">
            <p className="text-sm text-orange-800 mb-1">
              L&apos;adhésion n&apos;est pas obligatoire, mais elle donne accès aux tarifs préférentiels sur les expositions.
              {priceLabel && ` Cotisation annuelle : ${priceLabel} €.`}
            </p>
            <div className="mt-3">
              <MembershipRequestButton price={priceLabel} />
            </div>
          </div>
        )}
      </div>

      <ProfilForm user={JSON.parse(JSON.stringify(user))} />
    </div>
  )
}
