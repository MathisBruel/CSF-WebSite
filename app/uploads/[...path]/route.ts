import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { join, extname } from 'path'

export const dynamic = 'force-dynamic'

const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), 'public/uploads')

const MIME_TYPES: Record<string, string> = {
  // Images
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  // Documents
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.txt': 'text/plain',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const relativePath = params.path.join('/')

  // Security: prevent path traversal
  if (relativePath.includes('..') || relativePath.includes('\\') || relativePath.startsWith('/')) {
    return NextResponse.json({ error: 'Chemin invalide' }, { status: 400 })
  }

  const filepath = join(UPLOAD_DIR, relativePath)

  // Security: ensure resolved path is still within UPLOAD_DIR
  if (!filepath.startsWith(UPLOAD_DIR)) {
    return NextResponse.json({ error: 'Chemin invalide' }, { status: 400 })
  }

  try {
    const fileStat = await stat(filepath)
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 })
    }

    const ext = extname(relativePath).toLowerCase()
    const contentType = MIME_TYPES[ext]

    if (!contentType) {
      return NextResponse.json({ error: 'Type non autorisé' }, { status: 403 })
    }

    const buffer = await readFile(filepath)

    const isImage = contentType.startsWith('image/')
    const cacheControl = isImage
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=3600'

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileStat.size.toString(),
        'Cache-Control': cacheControl,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 })
  }
}
