import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = schema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } })

    // Always return success — avoid leaking whether an email is registered.
    if (user && user.password) {
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
      await prisma.passwordResetToken.create({
        data: { token, userId: user.id, expiresAt },
      })

      sendPasswordResetEmail({ name: user.name, email: user.email }, token).catch(console.error)
    }

    return NextResponse.json({ message: 'reset_email_sent' })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: err.errors }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
