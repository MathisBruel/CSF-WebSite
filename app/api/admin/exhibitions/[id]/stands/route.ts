import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { saveUploadedFile, deleteUploadedFile } from '@/lib/upload'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as 'plan' | 'contract' | null

    if (!file || !type) {
      return NextResponse.json({ error: 'Fichier ou type manquant' }, { status: 400 })
    }

    const exhibition = await prisma.exhibition.findUnique({ where: { id: params.id } })
    if (!exhibition) {
      return NextResponse.json({ error: 'Exposition introuvable' }, { status: 404 })
    }

    // Delete old file if exists
    if (type === 'plan' && exhibition.standPlanUrl) {
      await deleteUploadedFile(exhibition.standPlanUrl)
    }
    if (type === 'contract' && exhibition.standContractUrl) {
      await deleteUploadedFile(exhibition.standContractUrl)
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const { url } = await saveUploadedFile(buffer, file.name, file.type, `exhibitions/${params.id}/stands`)

    const updateData = type === 'plan'
      ? { standPlanUrl: url }
      : { standContractUrl: url }

    const updated = await prisma.exhibition.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      url,
      exhibition: updated
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: (err as Error).message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { standBasePricePerModule } = body

    if (standBasePricePerModule === undefined) {
      return NextResponse.json({ error: 'Tarif requis' }, { status: 400 })
    }

    const exhibition = await prisma.exhibition.findUnique({ where: { id: params.id } })
    if (!exhibition) {
      return NextResponse.json({ error: 'Exposition introuvable' }, { status: 404 })
    }

    const updated = await prisma.exhibition.update({
      where: { id: params.id },
      data: { standBasePricePerModule: parseInt(standBasePricePerModule, 10) },
    })

    return NextResponse.json({ success: true, exhibition: updated })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: (err as Error).message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
