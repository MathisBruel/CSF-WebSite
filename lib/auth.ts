import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { verifyRecaptcha } from '@/lib/recaptcha'
import type { Role } from '@prisma/client'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  // Required in Docker / behind a proxy — trusts the incoming Host header
  trustHost: true,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
        recaptchaToken: { label: 'Captcha', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const captchaValid = await verifyRecaptcha(credentials.recaptchaToken as string)
        if (!captchaValid) throw new Error('CAPTCHA_FAILED')

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) return null

        const valid = await bcrypt.compare(credentials.password as string, user.password)
        if (!valid) return null

        if (!user.emailVerified) throw new Error('EMAIL_NOT_VERIFIED')

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          membershipActive: user.membershipActive,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })
        if (!dbUser || dbUser.role !== 'ADMIN') {
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: Role }).role
        token.membershipActive = (user as { membershipActive: boolean }).membershipActive
      }
      if (account?.provider === 'google' && account?.access_token) {
        token.googleAccessToken = account.access_token
        token.googleRefreshToken = account.refresh_token
        token.googleTokenExpiry = account.expires_at
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
        session.user.membershipActive = token.membershipActive as boolean
        ;(session.user as any).googleAccessToken = token.googleAccessToken
      }
      return session
    },
  },
})
