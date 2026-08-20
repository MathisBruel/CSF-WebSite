import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendRegistrationRejectedEmail, sendPaymentReminderEmail } from '@/lib/email'
import type { RegistrationStatus, PaymentStatus } from '@prisma/client'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const data = await req.json()

  // If rejecting, send refusal email and delete the registration so the member can re-register cleanly
  if (data.status === 'REJECTED') {
    const reg = await prisma.registration.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { name: true, email: true } },
        exhibition: { select: { title: true } },
      },
    })
    if (!reg) return NextResponse.json({ error: 'Inscription introuvable' }, { status: 404 })

    if (data.rejectionReason && reg.user.email) {
      sendRegistrationRejectedEmail(
        { name: reg.user.name, email: reg.user.email },
        { title: reg.exhibition.title },
        data.rejectionReason
      ).catch(console.error)
    }

    await prisma.registration.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Inscription refusée et supprimée' })
  }

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

  // "Paiement reçu" validates both status and payment atomically
  if (data.action === 'payment_received') {
    updateData.status = 'VALIDATED'
    updateData.paymentStatus = 'PAID'
    updateData.paidAt = new Date()
  }

  const reg = await prisma.registration.update({
    where: { id: params.id },
    data: updateData,
    include: {
      user: { select: { name: true, email: true } },
      exhibition: { select: { title: true, startDate: true, city: true } },
    },
  })

  if (data.action === 'remind_payment') {
    prisma.siteConfig.findMany({
      where: { key: { in: ['membership_rib_iban', 'membership_rib_bic', 'membership_rib_holder', 'membership_paypal_link'] } },
    }).then((configs) => {
      const cfg = Object.fromEntries(configs.map((c) => [c.key, c.value]))
      return sendPaymentReminderEmail(
        { name: reg.user.name, email: reg.user.email },
        { title: reg.exhibition.title, startDate: reg.exhibition.startDate, city: reg.exhibition.city },
        reg.totalAmount,
        {
          iban: cfg['membership_rib_iban'] || '',
          bic: cfg['membership_rib_bic'] || '',
          holder: cfg['membership_rib_holder'] || '',
          paypalLink: cfg['membership_paypal_link'] || '',
        }
      )
    }).catch(console.error)
  }

  return NextResponse.json(reg)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  try {
    await prisma.registration.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Inscription supprimée' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
