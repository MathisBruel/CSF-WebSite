import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import { ProfilForm } from '@/components/membre/ProfilForm'
import { formatDate, ROLE_LABELS } from '@/lib/utils'

export default async function ProfilPage() {
  const session = await auth()
  if (!session) return null

  const [user, membershipPriceConfig] = await Promise.all([
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
  ])

  if (!user) return null

  const priceLabel = membershipPriceConfig?.value ? `${membershipPriceConfig.value} €` : null

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark">Mon profil</h1>
        <p className="text-csf-muted mt-1">Gérez vos informations personnelles</p>
      </div>

      {/* Membership card */}
      <div className={`card border-2 ${user.membershipActive ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-csf-dark">{ROLE_LABELS[user.role]}</p>
            <p className={`text-sm ${user.membershipActive ? 'text-green-700' : 'text-orange-700'}`}>
              {user.membershipActive
                ? `Adhésion active${user.membershipExpiry ? ` jusqu'au ${formatDate(user.membershipExpiry)}` : ''}`
                : 'Adhésion en attente de validation'}
            </p>
            {!user.membershipActive && priceLabel && (
              <p className="text-xs text-orange-700 mt-1">Cotisation annuelle : {priceLabel}</p>
            )}
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            user.membershipActive ? 'bg-green-100' : 'bg-orange-100'
          }`}>
            {user.membershipActive ? '✓' : '⏳'}
          </div>
        </div>
      </div>

      <ProfilForm user={JSON.parse(JSON.stringify(user))} />
    </div>
  )
}
