import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  sendMembershipApprovedEmail,
  sendMembershipRejectedEmail,
  sendMembershipPaymentRequestEmail,
} from '@/lib/email'
import { getMembershipPaymentConfig } from '@/lib/membership'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const data = await req.json()
  const { action, rejectionReason } = data

  if (!['approve', 'reject', 'remind'].includes(action)) {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  }

  const membershipRequest = await prisma.membershipRequest.findUnique({
    where: { id: params.id },
    include: { user: { select: { id: true, name: true, email: true } } },
  })
  if (!membershipRequest) return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 })

  if (action === 'approve') {
    await prisma.$transaction([
      prisma.membershipRequest.update({
        where: { id: params.id },
        data: { status: 'APPROVED', resolvedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: membershipRequest.userId },
        data: {
          membershipActive: true,
          membershipExpiry: new Date(new Date().getFullYear(), 11, 31),
          role: 'MEMBRE_ACTIF',
        },
      }),
    ])

    sendMembershipApprovedEmail({ name: membershipRequest.user.name, email: membershipRequest.user.email }).catch(console.error)
  } else if (action === 'remind') {
    if (membershipRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Cette demande n\'est plus en attente' }, { status: 400 })
    }
    const payment = await getMembershipPaymentConfig()
    sendMembershipPaymentRequestEmail({ name: membershipRequest.user.name, email: membershipRequest.user.email }, payment).catch(console.error)
  } else {
    if (!rejectionReason?.trim()) {
      return NextResponse.json({ error: 'Motif de refus requis' }, { status: 400 })
    }
    await prisma.membershipRequest.update({
      where: { id: params.id },
      data: { status: 'REJECTED', rejectionReason, resolvedAt: new Date() },
    })
    sendMembershipRejectedEmail(
      { name: membershipRequest.user.name, email: membershipRequest.user.email },
      rejectionReason
    ).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
