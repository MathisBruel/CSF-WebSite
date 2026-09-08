import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

import { RegistrationFilters } from '@/components/admin/RegistrationFilters'
import { RegistrationCard } from '@/components/admin/RegistrationCard'

export default async function AdminInscriptions({
  searchParams,
}: {
  searchParams: { filter?: string; expo?: string; search?: string }
}) {
  const where: Record<string, unknown> = {}
  if (searchParams.expo) where.exhibitionId = searchParams.expo
  if (searchParams.filter === 'pending') where.status = 'PENDING'
  if (searchParams.filter === 'docs') {
    where.cats = { some: { cat: { catDocuments: { some: { validated: false } } } } }
  }

  if (searchParams.search) {
    where.OR = [
      { user: { name: { contains: searchParams.search, mode: 'insensitive' } } },
      { user: { email: { contains: searchParams.search, mode: 'insensitive' } } },
      { user: { breedingName: { contains: searchParams.search, mode: 'insensitive' } } },
      { cats: { some: { cat: { name: { contains: searchParams.search, mode: 'insensitive' } } } } },
    ]
  }

  const registrations = await prisma.registration.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true, city: true, breedingName: true } },
      exhibition: { select: { title: true, startDate: true } },
      cats: {
        include: {
          cat: { include: { catDocuments: true } },
        },
      },
    },
  })

  const exhibitions = await prisma.exhibition.findMany({
    select: { id: true, title: true },
    orderBy: { startDate: 'desc' },
    take: 20,
  })

  const totalCats = registrations.reduce((sum, r) => sum + r.cats.length, 0)
  const pendingRegs = registrations.filter((r) => r.status === 'PENDING').length
  const pendingCats = registrations
    .filter((r) => r.status === 'PENDING')
    .reduce((sum, r) => sum + r.cats.length, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-csf-dark">Inscriptions</h1>
          <p className="text-csf-muted">{registrations.length} inscription{registrations.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-csf-dark">{registrations.length}</p>
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

      <RegistrationFilters
        exhibitions={exhibitions}
        currentExpo={searchParams.expo}
        currentFilter={searchParams.filter}
      />

      {registrations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-csf-muted">Aucune inscription trouvée</p>
        </div>
      )}

      <div className="space-y-2">
        {registrations.map((reg) => (
          <RegistrationCard key={reg.id} reg={reg} />
        ))}
      </div>
    </div>
  )
}
