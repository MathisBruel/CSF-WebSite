import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const expo = await prisma.exhibition.findUnique({ where: { id: params.id } })
  if (!expo) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const registrations = await prisma.registration.findMany({
    where: { exhibitionId: params.id },
    orderBy: [{ catalogNumber: 'asc' }, { createdAt: 'asc' }],
    include: {
      user: { select: { name: true, email: true, phone: true, city: true } },
      cat: { select: { name: true, breed: true, gender: true, birthDate: true, icadNumber: true, pedigreeNumber: true } },
    },
  })

  const headers = [
    'N° Catalogue', 'Nom chat', 'Race', 'Sexe', 'Naissance', 'I-CAD', 'Pedigree',
    'Propriétaire', 'Email', 'Téléphone', 'Ville', 'Statut', 'Paiement',
    'Cage', 'Cage double', 'Repas', 'Total',
  ]

  const rows = registrations.map((r) => [
    r.catalogNumber ?? '',
    r.cat.name,
    r.cat.breed,
    r.cat.gender,
    r.cat.birthDate.toLocaleDateString('fr-FR'),
    r.cat.icadNumber ?? '',
    r.cat.pedigreeNumber ?? '',
    r.user.name,
    r.user.email,
    r.user.phone ?? '',
    r.user.city ?? '',
    r.status,
    r.paymentStatus,
    r.wantsCage ? 'Oui' : 'Non',
    r.wantsDoubleCage ? 'Oui' : 'Non',
    r.mealsCount,
    r.totalAmount.toFixed(2),
  ])

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const filename = `inscrits-${expo.slug}-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
