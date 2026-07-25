import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { z } from 'zod'

const registerSchema = z.object({
  civilite: z.string().optional(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  exposantType: z.enum(['PARTICULIER', 'ELEVEUR', 'SOCIETE']).default('PARTICULIER'),
  certificatCapacite: z.string().optional(),
  siret: z.string().optional(),
  affixe: z.string().optional(),
  address: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  phoneFixed: z.string().optional(),
  phone: z.string().optional(),
  wantsAdhesion: z.boolean().default(false),
  newsletterSubscribed: z.boolean().default(true),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 409 })
    }

    const baseName = `${data.firstName} ${data.lastName}`
    const hashed = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        name: baseName,
        firstName: data.firstName,
        lastName: data.lastName,
        civilite: data.civilite,
        phone: data.phone,
        phoneFixed: data.phoneFixed,
        address: data.address,
        address2: data.address2,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country || 'France',
        exposantType: data.exposantType,
        certificatCapacite: data.certificatCapacite,
        siret: data.siret,
        affixe: data.affixe,
        newsletterSubscribed: data.newsletterSubscribed,
      },
    })

    if (data.wantsAdhesion) {
      await prisma.membershipRequest.create({
        data: { userId: user.id },
      })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await prisma.emailVerificationToken.create({
      data: { token, userId: user.id, expiresAt },
    })

    sendVerificationEmail({ name: user.name, email: user.email }, token).catch(console.error)

    return NextResponse.json({ message: 'verification_email_sent' }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: err.errors }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
