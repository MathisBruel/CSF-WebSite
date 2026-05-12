import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await prisma.news.findUnique({ where: { slug: params.slug } })
  if (!article) return { title: 'Article introuvable' }
  return { title: article.title, description: article.excerpt ?? undefined }
}

export default async function ArticlePage({ params }: Props) {
  const article = await prisma.news.findUnique({
    where: { slug: params.slug, published: true },
    include: { author: { select: { name: true } } },
  })

  if (!article) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/actualites" className="inline-flex items-center gap-1 text-csf-muted hover:text-csf-orange text-sm mb-8 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Toutes les actualités
      </Link>

      <article>
        <div className="text-sm text-csf-muted mb-3">
          {article.publishedAt && formatDate(article.publishedAt)}
          {article.author && <span> · Par {article.author.name}</span>}
        </div>
        <h1 className="text-4xl font-bold font-serif text-csf-dark mb-6 leading-tight">{article.title}</h1>
        {article.excerpt && (
          <p className="text-xl text-csf-muted leading-relaxed mb-8 border-l-4 border-csf-orange pl-4 italic">
            {article.excerpt}
          </p>
        )}
        <div
          className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-csf-dark prose-a:text-csf-orange"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </div>
  )
}
