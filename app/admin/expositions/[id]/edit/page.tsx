import { prisma } from '@/lib/prisma'
import { ExhibitionForm } from '@/components/admin/ExhibitionForm'
import { ExhibitionSpecials } from '@/components/admin/ExhibitionSpecials'
import { ExhibitionJudges } from '@/components/admin/ExhibitionJudges'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminExpoEdit({ params }: { params: { id: string } }) {
  const exhibition = await prisma.exhibition.findUnique({
    where: { id: params.id },
    include: {
      specials: { orderBy: { createdAt: 'asc' } },
      judges: { orderBy: { order: 'asc' } },
      registrations: {
        select: {
          status: true,
          _count: { select: { cats: true } },
        },
      },
    },
  })
  if (!exhibition) notFound()

  const totalRegs = exhibition.registrations.length
  const pendingRegs = exhibition.registrations.filter((r) => r.status === 'PENDING').length
  const totalCats = exhibition.registrations.reduce((s, r) => s + r._count.cats, 0)
  const pendingCats = exhibition.registrations
    .filter((r) => r.status === 'PENDING')
    .reduce((s, r) => s + r._count.cats, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark">Modifier l&apos;exposition</h1>
        <p className="text-csf-muted">{exhibition.title}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-csf-dark">{totalRegs}</p>
          <p className="text-xs text-csf-muted mt-0.5">Inscrits</p>
        </div>
        <div className="bg-white rounded-xl border border-yellow-200 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{pendingRegs}</p>
          <p className="text-xs text-csf-muted mt-0.5">En attente</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-csf-dark">{totalCats}</p>
          <p className="text-xs text-csf-muted mt-0.5">Chats inscrits</p>
        </div>
        <div className="bg-white rounded-xl border border-yellow-200 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{pendingCats}</p>
          <p className="text-xs text-csf-muted mt-0.5">Chats en attente</p>
        </div>
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
          coverImageUrl: exhibition.coverImageUrl || '',
        }}
      />

      <ExhibitionSpecials
        exhibitionId={exhibition.id}
        initialSpecials={exhibition.specials}
      />

      <ExhibitionJudges
        exhibitionId={exhibition.id}
        initialJudges={exhibition.judges}
        initialComplete={exhibition.judgeListComplete}
      />
    </div>
  )
}
