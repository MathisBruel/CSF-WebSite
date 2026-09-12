import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let config = await prisma.gAConfig.findFirst()
  if (!config) {
    config = await prisma.gAConfig.create({ data: {} })
  }

  return NextResponse.json({
    propertyId: config.propertyId,
    measurementId: config.measurementId,
    enabled: config.enabled,
  })
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { propertyId, measurementId, enabled } = await req.json()

  let config = await prisma.gAConfig.findFirst()
  if (!config) {
    config = await prisma.gAConfig.create({
      data: { propertyId, measurementId, enabled },
    })
  } else {
    config = await prisma.gAConfig.update({
      where: { id: config.id },
      data: { propertyId, measurementId, enabled },
    })
  }

  return NextResponse.json({ success: true })
}
