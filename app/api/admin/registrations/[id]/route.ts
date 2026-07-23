import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { RegistrationStatus, PaymentStatus } from '@prisma/client'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const data = await req.json()
  const updateData: Record<string, unknown> = {}

  if (data.status) updateData.status = data.status as RegistrationStatus
  if (data.rejectionReason !== undefined) updateData.rejectionReason = data.rejectionReason
  if (data.paymentStatus) {
    updateData.paymentStatus = data.paymentStatus as PaymentStatus
    if (data.paymentStatus === 'PAID') updateData.paidAt = new Date()
  }
  if (data.adminNotes !== undefined) updateData.adminNotes = data.adminNotes
  if (data.convocationUrl !== undefined) {
    updateData.convocationUrl = data.convocationUrl
    updateData.convocationSentAt = new Date()
  }

  const reg = await prisma.registration.update({ where: { id: params.id }, data: updateData })
  return NextResponse.json(reg)
}
