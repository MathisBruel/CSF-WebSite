import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { DocumentForm } from '@/components/admin/DocumentForm'
import { notFound, redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminDocumentsEdit({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { fileName?: string }
}) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const document = await prisma.document.findUnique({
    where: { id: params.id },
  })

  if (!document) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark">Modifier le document</h1>
        <p className="text-csf-muted">{document.title}</p>
      </div>

      <DocumentForm
        docId={document.id}
        fileName={searchParams.fileName || document.originalName}
        defaultValues={{
          title: document.title,
          description: document.description || '',
          category: document.category,
          public: document.public,
        }}
      />
    </div>
  )
}
