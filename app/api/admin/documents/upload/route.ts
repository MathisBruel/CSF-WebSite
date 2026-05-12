import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuid } from 'uuid'

export const dynamic = 'force-dynamic'

const UPLOAD_DIR = join(process.env.UPLOAD_DIR || join(process.cwd(), 'public/uploads'), 'documents')
const MAX_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/png',
  'image/jpeg',
]

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Fichier trop volumineux' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${uuid()}-${file.name.replace(/[^a-z0-9.-]/gi, '_').toLowerCase()}`
    const filepath = join(UPLOAD_DIR, filename)

    await mkdir(UPLOAD_DIR, { recursive: true })
    await writeFile(filepath, buffer)

    const doc = await prisma.document.create({
      data: {
        title: file.name.replace(/\.[^/.]+$/, ''),
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: `/uploads/documents/${filename}`,
        uploadedById: session.user.id,
      },
    })

    return NextResponse.json(doc, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
