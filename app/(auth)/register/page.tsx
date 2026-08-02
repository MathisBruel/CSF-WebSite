import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = { title: 'Créer un compte' }

export default async function RegisterPage() {
  const config = await prisma.siteConfig.findUnique({ where: { key: 'membership_price' } })
  return <RegisterForm membershipPrice={config?.value} />
}
