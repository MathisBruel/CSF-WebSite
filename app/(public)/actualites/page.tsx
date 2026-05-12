import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Actualités' }

export default async function ActualitesPage() {
  const news = await prisma.news.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    include: { author: { select: { name: true } } },
  })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="section-title">Actualités</h1>
        <p className="section-subtitle">Les dernières nouvelles de Chats Sans Frontières</p>
      </div>

      {news.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-csf-muted">Aucune actualité pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {news.map((article) => (
            <article key={article.id} className="card hover:shadow-md transition-shadow group">
              <div className="sm:flex gap-6">
                <div className="flex-1">
                  <div className="text-xs text-csf-muted mb-2">
                    {article.publishedAt && formatDate(article.publishedAt)}
                    {article.author && <span> · Par {article.author.name}</span>}
                  </div>
                  <h2 className="text-xl font-bold font-serif text-csf-dark mb-2 group-hover:text-csf-orange transition-colors">
                    <Link href={`/actualites/${article.slug}`}>{article.title}</Link>
                  </h2>
                  {article.excerpt && (
                    <p className="text-csf-muted leading-relaxed mb-4">{article.excerpt}</p>
                  )}
                  <Link href={`/actualites/${article.slug}`}
                    className="inline-flex items-center gap-1 text-csf-orange text-sm font-medium hover:gap-2 transition-all">
                    Lire la suite
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
