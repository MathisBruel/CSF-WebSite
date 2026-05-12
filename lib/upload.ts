import path from 'path'
import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'
import mime from 'mime-types'

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads')
const PUBLIC_URL = process.env.NEXT_PUBLIC_UPLOAD_URL || '/uploads'

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export async function saveUploadedFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  subfolder: string = 'general'
): Promise<{ filename: string; url: string; size: number }> {
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new Error(`Type de fichier non autorisé: ${mimeType}`)
  }

  if (buffer.length > MAX_SIZE) {
    throw new Error('Fichier trop volumineux (max 10 MB)')
  }

  const ext = mime.extension(mimeType) || 'bin'
  const filename = `${uuidv4()}.${ext}`
  const dir = path.join(UPLOAD_DIR, subfolder)

  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(path.join(dir, filename), buffer)

  return {
    filename,
    url: `${PUBLIC_URL}/${subfolder}/${filename}`,
    size: buffer.length,
  }
}

export async function deleteUploadedFile(url: string): Promise<void> {
  const relative = url.replace(PUBLIC_URL, '')
  const filePath = path.join(UPLOAD_DIR, relative)
  try {
    await fs.unlink(filePath)
  } catch {
    // File may already be deleted
  }
}
