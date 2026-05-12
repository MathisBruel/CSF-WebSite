import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Role } from '@prisma/client'

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return null
  return session
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const data = await req.json()
  const updateData: Record<string, unknown> = {}

  if (typeof data.membershipActive === 'boolean') {
    updateData.membershipActive = data.membershipActive
    if (data.membershipActive) {
      updateData.membershipExpiry = new Date(new Date().getFullYear(), 11, 31)
    }
  }
  if (data.role) updateData.role = data.role as Role

  const user = await prisma.user.update({ where: { id: params.id }, data: updateData })
  return NextResponse.json({ id: user.id })
}
