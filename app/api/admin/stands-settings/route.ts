import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { saveUploadedFile, deleteUploadedFile } from '@/lib/upload'

export async function GET() {
  try {
    const [email, phone, contractUrl] = await Promise.all([
      prisma.siteConfig.findUnique({ where: { key: 'standContactEmail' } }),
      prisma.siteConfig.findUnique({ where: { key: 'standContactPhone' } }),
      prisma.siteConfig.findUnique({ where: { key: 'standContractUrl' } }),
    ])

    return NextResponse.json({
      contactEmail: email?.value || 'frederique.beaucousin@assocsf.fr',
      contactPhone: phone?.value || '06 11 52 15 26',
      contractUrl: contractUrl?.value,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
    }

    // Delete old contract if exists
    const oldContract = await prisma.siteConfig.findUnique({
      where: { key: 'standContractUrl' },
    })
    if (oldContract?.value) {
      await deleteUploadedFile(oldContract.value)
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const { url } = await saveUploadedFile(buffer, file.name, file.type, 'stands')

    // Update or create config
    await prisma.siteConfig.upsert({
      where: { key: 'standContractUrl' },
      update: { value: url },
      create: { key: 'standContractUrl', value: url },
    })

    return NextResponse.json({ success: true, url })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: (err as Error).message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { contactEmail, contactPhone } = body

    if (!contactEmail || !contactPhone) {
      return NextResponse.json({ error: 'Email et téléphone requis' }, { status: 400 })
    }

    await Promise.all([
      prisma.siteConfig.upsert({
        where: { key: 'standContactEmail' },
        update: { value: contactEmail },
        create: { key: 'standContactEmail', value: contactEmail },
      }),
      prisma.siteConfig.upsert({
        where: { key: 'standContactPhone' },
        update: { value: contactPhone },
        create: { key: 'standContactPhone', value: contactPhone },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: (err as Error).message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
