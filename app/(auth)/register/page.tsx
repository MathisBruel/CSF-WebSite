import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = { title: 'Adhérer au club' }

export default function RegisterPage() {
  return <RegisterForm />
}
