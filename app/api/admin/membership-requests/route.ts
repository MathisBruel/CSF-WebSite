import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const requests = await prisma.membershipRequest.findMany({
    orderBy: { requestedAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, createdAt: true } },
    },
  })

  return NextResponse.json(requests)
}
