import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendNewsPublishedNewsletter } from '@/lib/email'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const newsSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  published: z.boolean(),
  authorId: z.string().optional(),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { authorId, ...parsedData } = newsSchema.parse(body)

    // Check previous state to detect publish event
    const previous = await prisma.news.findUnique({
      where: { id: params.id },
      select: { published: true },
    })

    const news = await prisma.news.update({
      where: { id: params.id },
      data: {
        ...parsedData,
        ...(authorId ? { authorId } : {}),
        ...(parsedData.published && !previous?.published ? { publishedAt: new Date() } : {}),
      },
    })

    // Send newsletter only when transitioning to published
    if (parsedData.published && !previous?.published) {
      sendNewsPublishedNewsletter({
        title: news.title,
        excerpt: news.excerpt ?? null,
        slug: news.slug,
      }).catch(console.error)
    }

    return NextResponse.json(news)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  try {
    await prisma.news.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
