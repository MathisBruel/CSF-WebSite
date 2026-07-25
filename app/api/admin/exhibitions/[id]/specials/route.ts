import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return null
  return session
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const specials = await prisma.exhibitionSpecial.findMany({
    where: { exhibitionId: params.id },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(specials)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { name } = z.object({ name: z.string().min(1) }).parse(await req.json())
  const special = await prisma.exhibitionSpecial.create({
    data: { exhibitionId: params.id, name },
  })
  return NextResponse.json(special, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  const { specialId } = z.object({ specialId: z.string() }).parse(await req.json())
  await prisma.exhibitionSpecial.delete({ where: { id: specialId, exhibitionId: params.id } })
  return new NextResponse(null, { status: 204 })
}
