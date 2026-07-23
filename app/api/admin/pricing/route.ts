import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const pricingSchema = z.object({
  registrationOneDay: z.number().int().min(0),
  registrationWeekend: z.number().int().min(0),
  extraCageOneDay: z.number().int().min(0),
  extraCageWeekend: z.number().int().min(0),
})

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const body = await req.json()
  const parsingResult = pricingSchema.safeParse(body)

  if (!parsingResult.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsingResult.error }, { status: 400 })
  }

  const data = parsingResult.data

  const existingPricing = await prisma.pricing.findFirst()

  if (existingPricing) {
    await prisma.pricing.update({
      where: { id: existingPricing.id },
      data,
    })
  } else {
    await prisma.pricing.create({
      data,
    })
  }

  return NextResponse.json({ ok: true })
}
