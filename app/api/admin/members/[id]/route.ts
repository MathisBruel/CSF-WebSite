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
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const data = await req.json()
  const updateData: Record<string, unknown> = {}

  if (typeof data.membershipActive === 'boolean') {
    updateData.membershipActive = data.membershipActive
    if (data.membershipActive) {
      updateData.membershipExpiry = new Date(new Date().getFullYear(), 11, 31)
    }
  }

  if (data.role) {
    const validRoles = ['ADMIN', 'MEMBRE_ACTIF', 'ADHERENT_CLUB']
    if (!validRoles.includes(data.role)) {
      return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 })
    }

    // Prevent self-demotion from admin
    if (session.user.id === params.id && data.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas retirer votre propre rôle administrateur' },
        { status: 400 }
      )
    }

    updateData.role = data.role as Role
  }

  const user = await prisma.user.update({ where: { id: params.id }, data: updateData })
  return NextResponse.json({ id: user.id })
}
