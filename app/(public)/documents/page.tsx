import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import { DocumentViewer } from '@/components/public/DocumentViewer'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Documents' }

const categoryOrder = ['rules', 'general', 'forms', 'guides', 'other']

export default async function DocumentsPage() {
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
    },
  })

  const byCategory = documents.reduce<Record<string, typeof documents>>((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = []
    acc[doc.category].push(doc)
    return acc
  }, {})

  const sortedCategories = Object.keys(byCategory).sort(
    (a, b) => (categoryOrder.indexOf(a) === -1 ? 99 : categoryOrder.indexOf(a)) -
              (categoryOrder.indexOf(b) === -1 ? 99 : categoryOrder.indexOf(b))
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="section-title">Documents officiels</h1>
        <p className="section-subtitle">Règlements, statuts, formulaires et autres documents de l&apos;association</p>
      </div>

      <DocumentViewer
        documents={documents}
        byCategory={byCategory}
        sortedCategories={sortedCategories}
      />
    </div>
  )
}
