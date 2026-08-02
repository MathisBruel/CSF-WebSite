import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import { ProfilForm } from '@/components/membre/ProfilForm'

export default async function ProfilPage() {
  const session = await auth()
  if (!session) return null

  const user = await prisma.user.findUnique({
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
  })

  if (!user) return null

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark">Mon profil</h1>
        <p className="text-csf-muted mt-1">Gérez vos informations personnelles</p>
      </div>

      <ProfilForm user={JSON.parse(JSON.stringify(user))} />
    </div>
  )
}
