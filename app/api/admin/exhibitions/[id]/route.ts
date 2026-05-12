import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ExhibitionStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const session = await auth()
  return session?.user.role === 'ADMIN' ? session : null
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const data = await req.json()
  const expo = await prisma.exhibition.update({
    where: { id: params.id },
    data: { status: data.status as ExhibitionStatus },
  })
  return NextResponse.json(expo)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const data = await req.json()
  const expo = await prisma.exhibition.update({
    where: { id: params.id },
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      location: data.location,
      address: data.address,
      city: data.city,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      registrationDeadline: new Date(data.registrationDeadline),
      priceBase: parseFloat(data.priceBase),
      priceCage: parseFloat(data.priceCage),
      priceDoubleCage: parseFloat(data.priceDoubleCage),
      priceMeal: parseFloat(data.priceMeal),
      maxRegistrations: data.maxRegistrations || null,
      rules: data.rules,
    },
  })
  return NextResponse.json(expo)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  try {
    // Check if there are any registrations
    const registrationCount = await prisma.registration.count({
      where: { exhibitionId: params.id },
    })

    if (registrationCount > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer: ${registrationCount} inscription(s) existante(s)` },
        { status: 400 }
      )
    }

    // Delete the exhibition
    await prisma.exhibition.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
