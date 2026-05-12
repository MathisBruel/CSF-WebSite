import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import { ProfilForm } from '@/components/membre/ProfilForm'
import { formatDate, ROLE_LABELS } from '@/lib/utils'

export default async function ProfilPage() {
  const session = await auth()
  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, firstName: true, lastName: true, email: true,
      phone: true, city: true, postalCode: true, address: true,
      role: true, membershipActive: true, membershipExpiry: true,
      createdAt: true,
    },
  })

  if (!user) return null

  return (
    <div className="max-w-2xl space-y-6">
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
