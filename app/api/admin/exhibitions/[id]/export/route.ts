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
    include: {
      user: { select: { name: true, email: true, phone: true, city: true } },
      cats: {
        orderBy: { catalogNumber: 'asc' },
        include: {
          cat: {
            select: { name: true, breed: true, gender: true, birthDate: true, icadNumber: true, pedigreeNumber: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  const headers = [
    'N° Catalogue', 'Nom chat', 'Race', 'Sexe', 'Naissance', 'I-CAD', 'Pedigree',
    'Propriétaire', 'Email', 'Téléphone', 'Ville',
    'Statut inscription', 'Paiement',
    'Cage', 'Cage double', 'Repas', 'Montant chat',
    'Jours', 'Classe', 'H.C.', 'Total inscription',
  ]

  const rows: (string | number)[][] = []
  for (const reg of registrations) {
    for (const rc of reg.cats) {
      rows.push([
        rc.catalogNumber ?? '',
        rc.cat.name,
        rc.cat.breed,
        rc.cat.gender,
        rc.cat.birthDate.toLocaleDateString('fr-FR'),
        rc.cat.icadNumber ?? '',
        rc.cat.pedigreeNumber ?? '',
        reg.user.name,
        reg.user.email,
        reg.user.phone ?? '',
        reg.user.city ?? '',
        reg.status,
        reg.paymentStatus,
        rc.wantsCage ? 'Oui' : 'Non',
        rc.wantsDoubleCage ? 'Oui' : 'Non',
        rc.mealsCount,
        rc.amount.toFixed(2),
        rc.participationDays.join('+'),
        rc.traditionalClass ?? '',
        rc.isHorsConcours ? 'Oui' : 'Non',
        reg.totalAmount.toFixed(2),
      ])
    }
  }

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
