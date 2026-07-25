import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/email'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(`${APP_URL}/verify-email?error=missing`)
  }

  const record = await prisma.emailVerificationToken.findUnique({ where: { token } })

  if (!record || record.expiresAt < new Date()) {
    if (record) await prisma.emailVerificationToken.delete({ where: { token } })
    return NextResponse.redirect(`${APP_URL}/verify-email?error=invalid`)
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: new Date() },
  })
  await prisma.emailVerificationToken.delete({ where: { token } })

  const user = await prisma.user.findUnique({ where: { id: record.userId } })
  if (user) sendWelcomeEmail({ name: user.name, email: user.email }).catch(console.error)

  return NextResponse.redirect(`${APP_URL}/verify-email?success=1`)
}
