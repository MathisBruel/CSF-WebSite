import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const news = await prisma.news.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    select: { id: true, title: true, slug: true, excerpt: true, publishedAt: true },
  })
  return NextResponse.json(news)
}
