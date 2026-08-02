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
        maxRegistrations: data.maxRegistrations || null,
        rules: data.rules,
        coverImageUrl: data.coverImageUrl || null,
      },
    })
    return NextResponse.json(expo, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
