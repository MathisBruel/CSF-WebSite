import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { ExhibitionStatus } from '@prisma/client'
import { computeBasePrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const catEntrySchema = z.object({
  catId: z.string(),
  participationDays: z.array(z.string()).default([]),
  traditionalClass: z.string().optional(),
  traditionalClassOther: z.string().optional(),
  isHorsConcours: z.boolean().default(false),
  wantsComplianceExam: z.boolean().default(false),
  specialParticipations: z.array(z.string()).default([]),
})

const registrationSchema = z.object({
  exhibitionId: z.string(),
  cats: z.array(catEntrySchema).min(1, 'Au moins un chat requis'),
  cageOptionId: z.string().nullable().optional(),
  mealsCount: z.number().int().min(0).default(0),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  try {
    const body = await req.json()
    const data = registrationSchema.parse(body)

    const exhibition = await prisma.exhibition.findUnique({
      where: { id: data.exhibitionId },
      include: { pricingTiers: true, cageOptions: true },
    })
    if (!exhibition || exhibition.status !== ExhibitionStatus.OPEN) {
      return NextResponse.json({ error: 'Exposition non disponible' }, { status: 400 })
    }
    if (new Date() > exhibition.registrationDeadline) {
      return NextResponse.json({ error: "La date limite d'inscription est dépassée" }, { status: 400 })
    }

    // Validate cage option belongs to this exhibition
    let cageOption = null
    if (data.cageOptionId) {
      cageOption = exhibition.cageOptions.find((c) => c.id === data.cageOptionId)
      if (!cageOption) {
        return NextResponse.json({ error: 'Option de cage invalide' }, { status: 400 })
      }
    }

    const catIds = data.cats.map((c) => c.catId)
    const userCats = await prisma.cat.findMany({
      where: { id: { in: catIds }, ownerId: session.user.id },
      select: { id: true },
    })
    if (userCats.length !== catIds.length) {
      return NextResponse.json({ error: 'Un ou plusieurs chats introuvables' }, { status: 404 })
    }

    const existingReg = await prisma.registration.findUnique({
      where: { exhibitionId_userId: { exhibitionId: data.exhibitionId, userId: session.user.id } },
      include: { cats: true },
    })

    const alreadyRegisteredCatIds = existingReg?.cats.map((rc) => rc.catId) ?? []
    const duplicates = catIds.filter((id) => alreadyRegisteredCatIds.includes(id))
    if (duplicates.length > 0) {
      return NextResponse.json({ error: 'Un ou plusieurs chats sont déjà inscrits à cette exposition' }, { status: 409 })
    }

    const totalCatsAfter = alreadyRegisteredCatIds.length + catIds.length
    const basePrice = computeBasePrice(totalCatsAfter, exhibition.pricingTiers, exhibition.priceBase)

    const cagePrice = cageOption?.price ?? 0
    const mealsPrice = data.mealsCount * exhibition.priceMeal

    const newCatData = data.cats.map((entry) => ({
      catId: entry.catId,
      participationDays: entry.participationDays,
      traditionalClass: entry.traditionalClass,
      traditionalClassOther: entry.traditionalClassOther,
      isHorsConcours: entry.isHorsConcours,
      wantsComplianceExam: entry.wantsComplianceExam,
      specialParticipations: entry.specialParticipations,
      amount: basePrice,
    }))

    if (existingReg) {
      // Recalculate existing cat amounts with new base price
      const existingAmounts = existingReg.cats.map((rc) => ({
        id: rc.id,
        amount: basePrice,
      }))
      const catsTotal =
        existingAmounts.reduce((s, c) => s + c.amount, 0) +
        newCatData.reduce((s, c) => s + c.amount, 0)
      const newTotalAmount = catsTotal + cagePrice + mealsPrice

      await prisma.$transaction([
        ...existingAmounts.map(({ id, amount }) =>
          prisma.registrationCat.update({ where: { id }, data: { amount } })
        ),
        prisma.registrationCat.createMany({
          data: newCatData.map((d) => ({ registrationId: existingReg.id, ...d })),
        }),
        prisma.registration.update({
          where: { id: existingReg.id },
          data: {
            totalAmount: newTotalAmount,
            cageOptionId: data.cageOptionId ?? existingReg.cageOptionId,
            mealsCount: data.mealsCount,
          },
        }),
      ])
      return NextResponse.json({ id: existingReg.id }, { status: 200 })
    }

    // Check capacity
    if (exhibition.maxRegistrations) {
      const count = await prisma.registrationCat.count({
        where: { registration: { exhibitionId: data.exhibitionId } },
      })
      if (count + catIds.length > exhibition.maxRegistrations) {
        return NextResponse.json({ error: "L'exposition est complète ou n'a pas assez de places" }, { status: 400 })
      }
    }

    const catsTotal = newCatData.reduce((s, c) => s + c.amount, 0)
    const totalAmount = catsTotal + cagePrice + mealsPrice

    const registration = await prisma.registration.create({
      data: {
        exhibitionId: data.exhibitionId,
        userId: session.user.id,
        totalAmount,
        cageOptionId: data.cageOptionId ?? null,
        mealsCount: data.mealsCount,
        cats: { create: newCatData },
      },
    })
    return NextResponse.json({ id: registration.id }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
