import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { ExhibitionStatus } from '@prisma/client'
import { RegistrationWizard } from '@/components/membre/RegistrationWizard'
import { DEFAULT_PRICING } from '@/lib/utils'
import Link from 'next/link'

type Props = { params: { expoId: string } }

export default async function InscriptionPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/login')

  const [expo, cats, userRecord, globalPricing] = await Promise.all([
    prisma.exhibition.findUnique({
      where: { id: params.expoId },
      include: { specials: { orderBy: { createdAt: 'asc' } } },
    }),
    prisma.cat.findMany({
      where: { ownerId: session.user.id },
      include: { catDocuments: true },
    }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { membershipActive: true } }),
    prisma.pricing.findFirst(),
  ])

  if (!expo || expo.status !== ExhibitionStatus.OPEN) notFound()

  const existingReg = await prisma.registration.findUnique({
    where: { exhibitionId_userId: { exhibitionId: params.expoId, userId: session.user.id } },
    select: { cats: { select: { catId: true } } },
  })

  const registeredCatIds = existingReg?.cats.map((rc) => rc.catId) ?? []
  const availableCats = cats.filter((c) => !registeredCatIds.includes(c.id))

  if (availableCats.length === 0 && registeredCatIds.length > 0) {
    return (
      <div className="max-w-2xl">
        <div className="card text-center py-10">
          <p className="text-csf-dark font-medium mb-2">Tous vos chats sont déjà inscrits à cette exposition.</p>
          <Link href="/membre/inscriptions" className="btn-primary">Voir mes inscriptions</Link>
        </div>
      </div>
    )
  }

  const pricing = globalPricing ?? DEFAULT_PRICING
  const isMember = userRecord?.membershipActive ?? false

  return (
    <div className="max-w-2xl">
      <RegistrationWizard
        exhibition={JSON.parse(JSON.stringify(expo))}
        cats={JSON.parse(JSON.stringify(availableCats))}
        pricing={pricing}
        isMember={isMember}
      />
    </div>
  )
}
