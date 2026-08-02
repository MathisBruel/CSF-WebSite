import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const metadata: Metadata = { title: 'Créer un compte' }

export default async function RegisterPage() {
  const session = await auth()
  if (session) redirect('/membre/dashboard')

  const config = await prisma.siteConfig.findUnique({ where: { key: 'membership_price' } })
  return <RegisterForm membershipPrice={config?.value} />
}
