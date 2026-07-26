import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sendNewsletterToSubscribers, sendExhibitionMailing } from '@/lib/email'
import { z } from 'zod'

const schema = z.object({
  subject: z.string().min(1),
  content: z.string().min(1),
  test: z.boolean().optional(),
  exhibitionId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  try {
    const body = schema.parse(await req.json())
    const { prisma } = await import('@/lib/prisma')

    if (body.exhibitionId) {
      if (body.test) {
        await sendExhibitionMailing(body.exhibitionId, body.subject, body.content, {
          testEmail: session.user.email!,
        })
        return NextResponse.json({ ok: true, message: `Email de test envoyé à ${session.user.email}` })
      }

      const count = await prisma.registration.count({
        where: { exhibitionId: body.exhibitionId, status: 'VALIDATED' },
      })

      sendExhibitionMailing(body.exhibitionId, body.subject, body.content).catch(console.error)

      return NextResponse.json({ ok: true, message: `Mailing envoyé à ${count} inscrit(s) validé(s)` })
    }

    if (body.test) {
      await sendNewsletterToSubscribers(body.subject, body.content, {
        testEmail: session.user.email!,
      })
      return NextResponse.json({ ok: true, message: `Email de test envoyé à ${session.user.email}` })
    }

    const count = await prisma.user.count({
      where: { newsletterSubscribed: true },
    })

    sendNewsletterToSubscribers(body.subject, body.content).catch(console.error)

    return NextResponse.json({ ok: true, message: `Newsletter envoyée à ${count} abonné(s)` })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
