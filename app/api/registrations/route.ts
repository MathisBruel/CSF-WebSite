import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { ExhibitionStatus } from '@prisma/client'

const registrationSchema = z.object({
  exhibitionId: z.string(),
  catId: z.string(),
  wantsCage: z.boolean().default(false),
  wantsDoubleCage: z.boolean().default(false),
  mealsCount: z.number().int().min(0).max(4).default(0),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  try {
    const body = await req.json()
    const data = registrationSchema.parse(body)

    // Verify exhibition is open
    const exhibition = await prisma.exhibition.findUnique({ where: { id: data.exhibitionId } })
    if (!exhibition || exhibition.status !== ExhibitionStatus.OPEN) {
      return NextResponse.json({ error: 'Exposition non disponible' }, { status: 400 })
    }

    // Check registration deadline
    if (new Date() > exhibition.registrationDeadline) {
      return NextResponse.json({ error: 'La date limite d\'inscription est dépassée' }, { status: 400 })
    }

    // Check max registrations
    if (exhibition.maxRegistrations) {
      const count = await prisma.registration.count({ where: { exhibitionId: data.exhibitionId } })
      if (count >= exhibition.maxRegistrations) {
        return NextResponse.json({ error: 'L\'exposition est complète' }, { status: 400 })
      }
    }

    // Verify cat ownership
    const cat = await prisma.cat.findFirst({
      where: { id: data.catId, ownerId: session.user.id },
    })
    if (!cat) return NextResponse.json({ error: 'Chat introuvable' }, { status: 404 })

    // Check no duplicate
    const existing = await prisma.registration.findUnique({
      where: { exhibitionId_catId: { exhibitionId: data.exhibitionId, catId: data.catId } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Ce chat est déjà inscrit à cette exposition' }, { status: 409 })
    }

    // Calculate total
    const totalAmount =
      exhibition.priceBase +
      (data.wantsCage ? exhibition.priceCage : 0) +
      (data.wantsDoubleCage ? exhibition.priceDoubleCage : 0) +
      data.mealsCount * exhibition.priceMeal

    const registration = await prisma.registration.create({
      data: {
        ...data,
        userId: session.user.id,
        totalAmount,
      },
    })
    return NextResponse.json(registration, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
