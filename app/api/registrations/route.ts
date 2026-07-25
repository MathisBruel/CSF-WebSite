import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { ExhibitionStatus } from '@prisma/client'
import { computeCatPrice, DEFAULT_PRICING } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const catEntrySchema = z.object({
  catId: z.string(),
  participationDays: z.array(z.string()).default([]),
  traditionalClass: z.string().optional(),
  traditionalClassOther: z.string().optional(),
  isHorsConcours: z.boolean().default(false),
  isHouseCat: z.boolean().default(false),
  wantsComplianceExam: z.boolean().default(false),
  wantsDiploma: z.boolean().default(false),
  specialParticipations: z.array(z.string()).default([]),
})

const registrationSchema = z.object({
  exhibitionId: z.string(),
  cats: z.array(catEntrySchema).min(1, 'Au moins un chat requis'),
  needsCage: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  try {
    const body = await req.json()
    const data = registrationSchema.parse(body)

    const [exhibition, userRecord, globalPricing] = await Promise.all([
      prisma.exhibition.findUnique({ where: { id: data.exhibitionId } }),
      prisma.user.findUnique({ where: { id: session.user.id }, select: { membershipActive: true } }),
      prisma.pricing.findFirst(),
    ])

    if (!exhibition || exhibition.status !== ExhibitionStatus.OPEN) {
      return NextResponse.json({ error: 'Exposition non disponible' }, { status: 400 })
    }
    if (new Date() > exhibition.registrationDeadline) {
      return NextResponse.json({ error: "La date limite d'inscription est dépassée" }, { status: 400 })
    }

    const pricing = globalPricing ?? DEFAULT_PRICING
    const isMember = userRecord?.membershipActive ?? false

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
      include: { cats: { select: { catId: true } } },
    })

    const alreadyRegisteredCatIds = existingReg?.cats.map((rc) => rc.catId) ?? []
    const duplicates = catIds.filter((id) => alreadyRegisteredCatIds.includes(id))
    if (duplicates.length > 0) {
      return NextResponse.json({ error: 'Un ou plusieurs chats sont déjà inscrits à cette exposition' }, { status: 409 })
    }

    const existingCount = alreadyRegisteredCatIds.length

    const newCatData = data.cats.map((entry, idx) => {
      const position = existingCount + idx + 1
      const amount = computeCatPrice(
        position,
        entry.participationDays,
        entry.isHouseCat,
        entry.wantsComplianceExam,
        entry.wantsDiploma,
        isMember,
        pricing
      )
      return {
        catId: entry.catId,
        participationDays: entry.participationDays,
        traditionalClass: entry.traditionalClass,
        traditionalClassOther: entry.traditionalClassOther,
        isHorsConcours: entry.isHorsConcours,
        isHouseCat: entry.isHouseCat,
        wantsComplianceExam: entry.wantsComplianceExam,
        wantsDiploma: entry.wantsDiploma,
        specialParticipations: entry.specialParticipations,
        amount,
      }
    })

    if (existingReg) {
      const newCatsTotal = newCatData.reduce((s, c) => s + c.amount, 0)
      const newTotalAmount = existingReg.totalAmount + newCatsTotal

      await prisma.$transaction([
        prisma.registrationCat.createMany({
          data: newCatData.map((d) => ({ registrationId: existingReg.id, ...d })),
        }),
        prisma.registration.update({
          where: { id: existingReg.id },
          data: { totalAmount: newTotalAmount, needsCage: data.needsCage || existingReg.needsCage },
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

    const registrationFee = pricing.registrationFee
    const catsTotal = newCatData.reduce((s, c) => s + c.amount, 0)
    const totalAmount = registrationFee + catsTotal

    const registration = await prisma.registration.create({
      data: {
        exhibitionId: data.exhibitionId,
        userId: session.user.id,
        registrationFee,
        totalAmount,
        needsCage: data.needsCage,
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
