import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendMembershipApprovedEmail } from '@/lib/email'
import type { MemberStatus } from '@/lib/membership'
import type { Prisma } from '@prisma/client'

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return null
  return session
}

const VALID_STATUSES: MemberStatus[] = ['none', 'pending', 'active', 'admin']

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const data = await req.json()
  const status = data.status as MemberStatus | undefined

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, email: true, role: true },
  })
  if (!user) return NextResponse.json({ error: 'Membre introuvable' }, { status: 404 })

  // Prevent self-demotion from admin
  if (session.user.id === params.id && user.role === 'ADMIN' && status !== 'admin') {
    return NextResponse.json(
      { error: 'Vous ne pouvez pas retirer votre propre rôle administrateur' },
      { status: 400 }
    )
  }

  const pendingRequest = await prisma.membershipRequest.findFirst({
    where: { userId: params.id, status: 'PENDING' },
  })

  switch (status) {
    case 'admin':
      await prisma.user.update({ where: { id: params.id }, data: { role: 'ADMIN' } })
      break

    case 'active': {
      const ops: Prisma.PrismaPromise<unknown>[] = [
        prisma.user.update({
          where: { id: params.id },
          data: { membershipActive: true, membershipExpiry: new Date(new Date().getFullYear(), 11, 31), role: 'MEMBRE_ACTIF' },
        }),
      ]
      if (pendingRequest) {
        ops.push(prisma.membershipRequest.update({ where: { id: pendingRequest.id }, data: { status: 'APPROVED', resolvedAt: new Date() } }))
      }
      await prisma.$transaction(ops)
      sendMembershipApprovedEmail({ name: user.name, email: user.email }).catch(console.error)
      break
    }

    case 'pending': {
      const ops: Prisma.PrismaPromise<unknown>[] = [
        prisma.user.update({ where: { id: params.id }, data: { membershipActive: false, role: 'ADHERENT_CLUB' } }),
      ]
      if (!pendingRequest) {
        ops.push(prisma.membershipRequest.create({ data: { userId: params.id } }))
      }
      await prisma.$transaction(ops)
      break
    }

    case 'none': {
      const ops: Prisma.PrismaPromise<unknown>[] = [
        prisma.user.update({ where: { id: params.id }, data: { membershipActive: false, role: 'ADHERENT_CLUB' } }),
      ]
      if (pendingRequest) {
        ops.push(prisma.membershipRequest.update({ where: { id: pendingRequest.id }, data: { status: 'REJECTED', resolvedAt: new Date() } }))
      }
      await prisma.$transaction(ops)
      break
    }
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  // Prevent self-deletion
  if (session.user.id === params.id) {
    return NextResponse.json(
      { error: 'Vous ne pouvez pas supprimer votre propre compte' },
      { status: 400 }
    )
  }

  try {
    // Delete in transaction to handle relations
    await prisma.$transaction([
      prisma.registration.deleteMany({ where: { userId: params.id } }),
      prisma.teamMember.updateMany({ where: { userId: params.id }, data: { userId: null } }),
      prisma.user.delete({ where: { id: params.id } })
    ])
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete member error:', error)
    if (error.code === 'P2003') { // Foreign key constraint failed
      return NextResponse.json(
        { error: "Impossible de supprimer ce membre car il possède des données liées (actualités, documents, etc.)" },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}

