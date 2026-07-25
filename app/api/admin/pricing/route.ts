import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const pricingSchema = z.object({
  registrationFee: z.number().int().min(0),
  memberOneDayCat12: z.number().int().min(0),
  memberOneDayCat3Plus: z.number().int().min(0),
  memberOneDayHouseCat: z.number().int().min(0),
  memberTwoDayCat12: z.number().int().min(0),
  memberTwoDayCat3Plus: z.number().int().min(0),
  memberTwoDayHouseCat: z.number().int().min(0),
  memberConformite: z.number().int().min(0),
  memberDiploma: z.number().int().min(0),
  nonMemberOneDayCat12: z.number().int().min(0),
  nonMemberOneDayCat3Plus: z.number().int().min(0),
  nonMemberOneDayHouseCat: z.number().int().min(0),
  nonMemberTwoDayCat12: z.number().int().min(0),
  nonMemberTwoDayCat3Plus: z.number().int().min(0),
  nonMemberTwoDayHouseCat: z.number().int().min(0),
  nonMemberConformite: z.number().int().min(0),
  nonMemberDiploma: z.number().int().min(0),
  membershipFee: z.number().int().min(0),
  cageDeposit: z.number().int().min(0),
})

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const body = await req.json()
  const result = pricingSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: 'Données invalides', details: result.error }, { status: 400 })
  }

  const existing = await prisma.pricing.findFirst()
  if (existing) {
    await prisma.pricing.update({ where: { id: existing.id }, data: result.data })
  } else {
    await prisma.pricing.create({ data: result.data })
  }

  return NextResponse.json({ ok: true })
}
