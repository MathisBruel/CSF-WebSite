import { prisma } from '@/lib/prisma'
import { RegistrationStatus } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const registrations = await prisma.registration.findMany({
      where: {
        exhibitionId: params.id,
        status: { in: [RegistrationStatus.VALIDATED, RegistrationStatus.PENDING] },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            exposantType: true,
          },
        },
        cats: {
          include: {
            cat: {
              select: {
                id: true,
                name: true,
                breed: true,
                birthDate: true,
                isHouseCat: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const data = registrations.map((reg) => ({
      registrationId: reg.id,
      status: reg.status,
      exhibitor: {
        id: reg.user.id,
        name: reg.user.name,
        firstName: reg.user.firstName,
        lastName: reg.user.lastName,
        type: reg.user.exposantType,
      },
      cats: reg.cats.map((rc) => ({
        catId: rc.cat.id,
        name: rc.cat.name,
        breed: rc.cat.breed,
        birthDate: rc.cat.birthDate.toISOString().split('T')[0],
        isHouseCat: rc.cat.isHouseCat,
        class: [
          rc.traditionalClassSaturday,
          rc.traditionalClassSunday,
          rc.traditionalClassOther,
        ]
          .filter(Boolean)
          .join(' / '),
        catalogNumber: rc.catalogNumber,
      })),
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}
