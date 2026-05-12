import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { ExhibitionStatus } from '@prisma/client'
import { RegistrationWizard } from '@/components/membre/RegistrationWizard'

type Props = { params: { expoId: string } }

export default async function InscriptionPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/login')

  const [expo, cats] = await Promise.all([
    prisma.exhibition.findUnique({ where: { id: params.expoId } }),
    prisma.cat.findMany({
      where: { ownerId: session.user.id },
      include: { catDocuments: true },
    }),
  ])

  if (!expo || expo.status !== ExhibitionStatus.OPEN) notFound()

  // Check already registered cats for this expo
  const existingRegs = await prisma.registration.findMany({
    where: { exhibitionId: params.expoId, userId: session.user.id },
    select: { catId: true },
  })
  const registeredCatIds = existingRegs.map((r) => r.catId)

  const availableCats = cats.filter((c) => !registeredCatIds.includes(c.id))

  return (
    <div className="max-w-2xl">
      <RegistrationWizard
        exhibition={JSON.parse(JSON.stringify(expo))}
        cats={JSON.parse(JSON.stringify(availableCats))}
      />
    </div>
  )
}
