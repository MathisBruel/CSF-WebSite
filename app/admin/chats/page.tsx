import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { ChatsFilterBar } from '@/components/admin/ChatsFilterBar'
import type { Prisma } from '@prisma/client'

export default async function AdminChats({
  searchParams,
}: {
  searchParams: { q?: string; exposant?: string }
}) {
  const q = searchParams.q ?? ''
  const exposantId = searchParams.exposant ?? ''

  const where: Prisma.CatWhereInput = {}
  if (exposantId) where.ownerId = exposantId
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { breed: { contains: q, mode: 'insensitive' } },
      { color: { contains: q, mode: 'insensitive' } },
      { icadNumber: { contains: q, mode: 'insensitive' } },
      { pedigreeNumber: { contains: q, mode: 'insensitive' } },
      { owner: { name: { contains: q, mode: 'insensitive' } } },
    ]
  }

  const [cats, ownersRaw] = await Promise.all([
    prisma.cat.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        owner: { select: { id: true, name: true, breedingName: true } },
        _count: { select: { registrations: true } },
      },
    }),
    prisma.user.findMany({
      where: { cats: { some: {} } },
      select: { id: true, name: true, breedingName: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const owners = ownersRaw.map((o) => ({
    id: o.id,
    label: o.breedingName ? `${o.name} — ${o.breedingName}` : o.name,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark">Chats</h1>
        <p className="text-csf-muted">{cats.length} chat{cats.length !== 1 ? 's' : ''} enregistré{cats.length !== 1 ? 's' : ''}</p>
      </div>

      <ChatsFilterBar owners={owners} defaultQ={q} defaultExposantId={exposantId} />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-csf-muted">Chat</th>
              <th className="text-left px-4 py-3 font-medium text-csf-muted">Race</th>
              <th className="text-left px-4 py-3 font-medium text-csf-muted">Robe</th>
              <th className="text-left px-4 py-3 font-medium text-csf-muted">Sexe</th>
              <th className="text-left px-4 py-3 font-medium text-csf-muted">Naissance</th>
              <th className="text-left px-4 py-3 font-medium text-csf-muted">Exposant</th>
              <th className="text-left px-4 py-3 font-medium text-csf-muted">ICAD</th>
              <th className="text-left px-4 py-3 font-medium text-csf-muted">Inscriptions</th>
              <th className="text-left px-4 py-3 font-medium text-csf-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cats.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-csf-dark">{cat.name}</p>
                  {cat.pedigreeNumber && <p className="text-xs text-csf-muted">Pedigree {cat.pedigreeNumber}</p>}
                </td>
                <td className="px-4 py-3 text-csf-dark">{cat.breed}</td>
                <td className="px-4 py-3 text-csf-dark">{cat.color ?? '—'}</td>
                <td className="px-4 py-3 text-csf-dark">{cat.gender}</td>
                <td className="px-4 py-3 text-csf-muted">{formatDate(cat.birthDate)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-csf-dark">{cat.owner.name}</p>
                  {cat.owner.breedingName && <p className="text-xs text-csf-muted">{cat.owner.breedingName}</p>}
                </td>
                <td className="px-4 py-3 text-csf-muted">{cat.icadNumber ?? '—'}</td>
                <td className="px-4 py-3 text-center">{cat._count.registrations}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/chats/${cat.id}/edit`} className="text-csf-orange hover:underline font-medium">
                    Modifier
                  </Link>
                </td>
              </tr>
            ))}
            {cats.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-csf-muted">Aucun chat ne correspond à ces critères.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
