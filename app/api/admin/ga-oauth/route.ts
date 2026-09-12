import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { accessToken, refreshToken, expiresAt } = await req.json()

  let config = await prisma.gAConfig.findFirst()
  if (!config) {
    config = await prisma.gAConfig.create({
      data: {
        googleAccessToken: accessToken,
        googleRefreshToken: refreshToken,
        tokenExpiry: expiresAt ? new Date(expiresAt) : null,
      },
    })
  } else {
    config = await prisma.gAConfig.update({
      where: { id: config.id },
      data: {
        googleAccessToken: accessToken,
        googleRefreshToken: refreshToken,
        tokenExpiry: expiresAt ? new Date(expiresAt) : null,
      },
    })
  }

  return NextResponse.json({ success: true })
}
