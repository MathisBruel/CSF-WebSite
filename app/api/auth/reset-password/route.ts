import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, password } = schema.parse(body)

    const record = await prisma.passwordResetToken.findUnique({ where: { token } })

    if (!record || record.expiresAt < new Date()) {
      if (record) await prisma.passwordResetToken.delete({ where: { token } })
      return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 12)
    await prisma.user.update({
      where: { id: record.userId },
      data: { password: hashed },
    })
    await prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } })

    return NextResponse.json({ message: 'password_reset' })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: err.errors }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
