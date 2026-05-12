import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const catSchema = z.object({
  name: z.string().min(1).optional(),
  breed: z.string().optional(),
  color: z.string().optional(),
  gender: z.string().optional(),
  birthDate: z.string().optional(),
  icadNumber: z.string().optional().nullable(),
  pedigreeNumber: z.string().optional().nullable(),
  neutered: z.boolean().optional(),
  notes: z.string().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const cat = await prisma.cat.findFirst({ where: { id: params.id, ownerId: session.user.id } })
  if (!cat) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  try {
    const data = catSchema.parse(await req.json())
    const updated = await prisma.cat.update({
      where: { id: params.id },
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const cat = await prisma.cat.findFirst({ where: { id: params.id, ownerId: session.user.id } })
  if (!cat) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  await prisma.cat.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
