import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  try {
    const data = await req.json()
    const pricingTiers: { minCats: number; pricePerCat: number }[] = data.pricingTiers ?? []
    const cageOptions: { name: string; price: number; order: number }[] = data.cageOptions ?? []

    const expo = await prisma.exhibition.create({
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
        priceMeal: parseFloat(data.priceMeal ?? 0),
        mealsEnabled: Boolean(data.mealsEnabled),
        mealsRequired: Boolean(data.mealsRequired),
        maxRegistrations: data.maxRegistrations || null,
        rules: data.rules,
        pricingTiers: pricingTiers.length > 0
          ? { create: pricingTiers.map(({ minCats, pricePerCat }) => ({ minCats, pricePerCat })) }
          : undefined,
        cageOptions: cageOptions.length > 0
          ? { create: cageOptions.map(({ name, price, order }) => ({ name, price, order })) }
          : undefined,
      },
    })
    return NextResponse.json(expo, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
