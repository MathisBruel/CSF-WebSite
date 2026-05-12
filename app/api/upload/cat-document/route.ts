import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { saveUploadedFile } from '@/lib/upload'
import { DocumentType } from '@prisma/client'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const catId = formData.get('catId') as string
    const type = formData.get('type') as DocumentType

    if (!file || !catId || !type) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    // Verify cat ownership
    const cat = await prisma.cat.findFirst({ where: { id: catId, ownerId: session.user.id } })
    if (!cat) return NextResponse.json({ error: 'Chat introuvable' }, { status: 404 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const { filename, url, size } = await saveUploadedFile(buffer, file.name, file.type, `cats/${catId}`)

    const doc = await prisma.catDocument.create({
      data: {
        catId,
        type,
        filename,
        originalName: file.name,
        mimeType: file.type,
        size,
        url,
      },
    })
    return NextResponse.json(doc, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: (err as Error).message || 'Erreur serveur' }, { status: 500 })
  }
}
