import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const data = await req.json()
  const {
    civilite,
    firstName,
    lastName,
    phone,
    phoneFixed,
    city,
    postalCode,
    address,
    address2,
    country,
    exposantType,
    certificatCapacite,
    siret,
    affixe,
    newsletterSubscribed,
  } = data

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      civilite,
      firstName,
      lastName,
      phone,
      phoneFixed,
      city,
      postalCode,
      address,
      address2,
      country,
      exposantType,
      certificatCapacite,
      siret,
      affixe,
      ...(typeof newsletterSubscribed === 'boolean' ? { newsletterSubscribed } : {}),
    },
  })
  return NextResponse.json({ id: user.id })
}
