import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ALLOWED_KEYS = [
  'membership_price',
  'membership_rib_iban',
  'membership_rib_bic',
  'membership_rib_holder',
  'membership_paypal_link',
]

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const rows = await prisma.siteConfig.findMany({ where: { key: { in: ALLOWED_KEYS } } })
  const config = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  return NextResponse.json(config)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const body: Record<string, string> = await req.json()

  const ops = Object.entries(body)
    .filter(([key]) => ALLOWED_KEYS.includes(key))
    .map(([key, value]) =>
      prisma.siteConfig.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      })
    )

  await Promise.all(ops)
  return NextResponse.json({ ok: true })
}
