import { prisma } from '@/lib/prisma'
import { ExhibitionForm } from '@/components/admin/ExhibitionForm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminExpoEdit({ params }: { params: { id: string } }) {
  const exhibition = await prisma.exhibition.findUnique({ where: { id: params.id } })
  if (!exhibition) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark">Modifier l&apos;exposition</h1>
        <p className="text-csf-muted">{exhibition.title}</p>
      </div>

      <ExhibitionForm
        expoId={exhibition.id}
        defaultValues={{
          title: exhibition.title,
          description: exhibition.description || '',
          location: exhibition.location,
          address: exhibition.address || '',
          city: exhibition.city,
          startDate: exhibition.startDate.toISOString().slice(0, 16),
          endDate: exhibition.endDate.toISOString().slice(0, 16),
          registrationDeadline: exhibition.registrationDeadline.toISOString().slice(0, 16),
          maxRegistrations: exhibition.maxRegistrations || undefined,
          rules: exhibition.rules || '',
        }}
      />
    </div>
  )
}
