import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  sendMembershipRequestReceivedEmail,
  notifyAdminMembershipRequest,
} from '@/lib/email'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const request = await prisma.membershipRequest.findFirst({
    where: { userId: session.user.id },
    orderBy: { requestedAt: 'desc' },
  })

  return NextResponse.json(request)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  // Already an active member
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { membershipActive: true, name: true, email: true },
  })
  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  if (user.membershipActive) {
    return NextResponse.json({ error: 'Vous êtes déjà membre actif.' }, { status: 400 })
  }

  // Block if already pending
  const existing = await prisma.membershipRequest.findFirst({
    where: { userId: session.user.id, status: 'PENDING' },
  })
  if (existing) {
    return NextResponse.json({ error: 'Une demande est déjà en cours.' }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const request = await prisma.membershipRequest.create({
    data: {
      userId: session.user.id,
      message: body.message?.trim() || null,
    },
  })

  // Notifications (fire-and-forget)
  sendMembershipRequestReceivedEmail({ name: user.name, email: user.email }).catch(console.error)
  notifyAdminMembershipRequest({ name: user.name, email: user.email }).catch(console.error)

  // In-app notification for admin
  prisma.notification.create({
    data: {
      type: 'MEMBERSHIP_REQUEST',
      title: `Nouvelle demande d'adhésion de ${user.name}`,
      link: '/admin/membres',
    },
  }).catch(console.error)

  return NextResponse.json(request, { status: 201 })
}
