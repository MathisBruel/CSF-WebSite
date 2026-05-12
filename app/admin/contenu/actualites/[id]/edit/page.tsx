import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NewsForm } from '@/components/admin/NewsForm'
import { notFound, redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminNewsEdit({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const news = await prisma.news.findUnique({
    where: { id: params.id },
  })

  if (!news) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark">Modifier l&apos;actualité</h1>
        <p className="text-csf-muted">{news.title}</p>
      </div>

      <NewsForm
        newsId={news.id}
        defaultValues={{
          title: news.title,
          excerpt: news.excerpt || '',
          content: news.content,
          published: news.published,
        }}
      />
    </div>
  )
}
