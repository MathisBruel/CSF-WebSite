import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; catId: string } }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const data = await req.json()
  const updateData: Record<string, unknown> = {}

  if (typeof data.vetValidated === 'boolean') {
    updateData.vetValidated = data.vetValidated
    updateData.vetValidatedAt = data.vetValidated ? new Date() : null
  }
  if (data.vetNotes !== undefined) updateData.vetNotes = data.vetNotes
  if (data.catalogNumber !== undefined) updateData.catalogNumber = data.catalogNumber

  const rc = await prisma.registrationCat.update({
    where: { registrationId_catId: { registrationId: params.id, catId: params.catId } },
    data: updateData,
  })
  return NextResponse.json(rc)
}
