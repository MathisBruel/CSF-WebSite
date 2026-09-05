import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return null
  return session
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const body = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    photoUrl: z.string().nullable().optional(),
    region: z.string().nullable().optional(),
    breeds: z.string().nullable().optional(),
    role: z.string().nullable().optional(),
  }).parse(await req.json())

  const count = await prisma.exhibitionJudge.count({ where: { exhibitionId: params.id } })

  const judge = await prisma.exhibitionJudge.create({
    data: { exhibitionId: params.id, order: count, ...body },
  })
  return NextResponse.json(judge, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { judgeId } = z.object({ judgeId: z.string() }).parse(await req.json())
  await prisma.exhibitionJudge.delete({ where: { id: judgeId, exhibitionId: params.id } })
  return new NextResponse(null, { status: 204 })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { judgeListComplete } = z.object({ judgeListComplete: z.boolean() }).parse(await req.json())
  await prisma.exhibition.update({
    where: { id: params.id },
    data: { judgeListComplete },
  })
  return NextResponse.json({ ok: true })
}
