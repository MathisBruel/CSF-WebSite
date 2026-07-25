import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const catSchema = z.object({
  name: z.string().min(1),
  breed: z.string().min(1),
  color: z.string().optional(),
  gender: z.string(),
  birthDate: z.string(),
  eyeColor: z.string().optional(),
  breeder: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  father: z.string().optional(),
  mother: z.string().optional(),
  icadNumber: z.string().optional().nullable(),
  pedigreeNumber: z.string().optional().nullable(),
  pedigreeInProgress: z.boolean().default(false),
  foreignCatCertificate: z.string().optional(),
  inscritChampionnatFrance: z.boolean().default(false),
  isHouseCat: z.boolean().default(false),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const cats = await prisma.cat.findMany({
    where: { ownerId: session.user.id },
    include: { vaccinations: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(cats)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  try {
    const body = await req.json()
    const data = catSchema.parse(body)

    const cat = await prisma.cat.create({
      data: {
        ...data,
        birthDate: new Date(data.birthDate),
        ownerId: session.user.id,
      },
    })
    return NextResponse.json(cat, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
