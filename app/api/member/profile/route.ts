import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const data = await req.json()
  const { 
    firstName, 
    lastName, 
    phone, 
    city, 
    postalCode, 
    address, 
    country,
    affixe,
    breedingName,
    website,
    gpsCoordinates,
    newsletterSubscribed 
  } = data

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      firstName,
      lastName,
      phone,
      city,
      postalCode,
      address,
      country,
      affixe,
      breedingName,
      website,
      gpsCoordinates,
      ...(typeof newsletterSubscribed === 'boolean' ? { newsletterSubscribed } : {}),
    },
  })
  return NextResponse.json({ id: user.id })
}
