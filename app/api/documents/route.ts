import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const documents = await prisma.document.findMany({
    where: { public: true },
    orderBy: [{ category: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      url: true,
      originalName: true,
      size: true,
      mimeType: true,
      createdAt: true,
    },
  })
  return NextResponse.json(documents)
}
