import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import { formatDate } from '@/lib/utils'
import { ExhibitionStatus } from '@prisma/client'
import { auth } from '@/lib/auth'

async function getData() {
  const [latestNews, upcomingExpos, membershipPriceConfig] = await Promise.all([
    prisma.news.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      include: { author: { select: { name: true } } },
    }),
    prisma.exhibition.findMany({
      where: { status: { in: [ExhibitionStatus.OPEN, ExhibitionStatus.DRAFT] } },
      orderBy: { startDate: 'asc' },
      take: 3,
    }),
    prisma.siteConfig.findUnique({ where: { key: 'membership_price' } }),
  ])
  return { latestNews, upcomingExpos, membershipPrice: membershipPriceConfig?.value }
}

export default async function HomePage() {
  const [{ latestNews, upcomingExpos, membershipPrice }, session] = await Promise.all([getData(), auth()])
  const membershipHref = session ? '/membre/dashboard' : '/register'

  return (
    <>
      {/* Hero */}
      <section className="bg-csf-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #d48342 0%, transparent 50%), radial-gradient(circle at 80% 20%, #d48342 0%, transparent 40%)'
          }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-csf-orange/20 text-csf-orange text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-csf-orange animate-pulse" />
              Club félin du Nord-Ouest de la France depuis 2005
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold font-serif leading-tight mb-6">
              Chats Sans<br />
              <span className="text-csf-orange">Frontières</span>
            </h1>
            <p className="text-xl text-csf-light/80 mb-8 leading-relaxed">
              Organisation d&apos;expositions félines dans le <strong>Nord-Ouest de la France</strong>, promotion de l&apos;élevage éthique
              et regroupement de passionnés du chat de race et de maison.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/expositions" className="btn-primary">
                Voir les expositions
              </Link>
              <Link href={membershipHref}
                className="inline-flex items-center px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                Devenir membre
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-white/10 bg-csf-darker/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
              {[
                { value: 'Nord-Ouest', label: 'Secteur d\'activité (France)' },
                { value: '20+', label: 'Années d\'existence' },
                { value: '20+', label: 'Membres bénévoles' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-csf-orange font-serif">{s.value}</p>
                  <p className="text-xs text-csf-light/60 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming exhibitions */}
      {upcomingExpos.length > 0 && (
        <section className="py-16 bg-csf-light/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="section-title">Prochaines Expositions</h2>
                <p className="section-subtitle">Inscrivez vos chats dès maintenant</p>
              </div>
              <Link href="/expositions" className="text-csf-orange hover:text-csf-orange-dark font-medium text-sm hidden sm:block">
                Voir toutes →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingExpos.map((expo) => (
                <div key={expo.id} className="card hover:shadow-md transition-shadow group">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`badge ${expo.status === 'OPEN' ? 'badge-green' : 'badge-gray'}`}>
                      {expo.status === 'OPEN' ? 'Inscriptions ouvertes' : 'Bientôt'}
                    </span>
                    <span className="text-xs text-csf-muted">{expo.city}</span>
                  </div>
                  <h3 className="font-bold text-csf-dark text-lg font-serif leading-tight mb-2 group-hover:text-csf-orange transition-colors">
                    {expo.title}
                  </h3>
                  <div className="space-y-1 text-sm text-csf-muted mb-4">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-csf-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(expo.startDate)} – {formatDate(expo.endDate)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-csf-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {expo.location}, {expo.city}
                    </div>
                  </div>
                  <Link href={`/expositions/${expo.slug}`}
                    className="block w-full text-center py-2 px-4 border border-csf-orange text-csf-orange rounded-lg text-sm font-medium hover:bg-csf-orange hover:text-white transition-colors">
                    En savoir plus
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest news */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title">Actualités</h2>
              <p className="section-subtitle">Les dernières nouvelles du club</p>
            </div>
            <Link href="/actualites" className="text-csf-orange hover:text-csf-orange-dark font-medium text-sm hidden sm:block">
              Toutes les actus →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.map((article, i) => (
              <article key={article.id} className={`card hover:shadow-md transition-shadow group ${i === 0 ? 'md:col-span-1' : ''}`}>
                <div className="text-xs text-csf-muted mb-2">
                  {article.publishedAt && formatDate(article.publishedAt)}
                  {article.author && <span> · {article.author.name}</span>}
                </div>
                <h3 className="font-bold text-csf-dark font-serif text-lg leading-tight mb-2 group-hover:text-csf-orange transition-colors">
                  <Link href={`/actualites/${article.slug}`}>{article.title}</Link>
                </h3>
                {article.excerpt && (
                  <p className="text-csf-muted text-sm leading-relaxed line-clamp-3">{article.excerpt}</p>
                )}
                <Link href={`/actualites/${article.slug}`}
                  className="inline-flex items-center gap-1 mt-4 text-csf-orange text-sm font-medium hover:gap-2 transition-all">
                  Lire la suite
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-csf-orange">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold font-serif mb-4">Rejoignez Chats Sans Frontières</h2>
          <p className="text-white/80 text-lg mb-8">
            Adhérez à l&apos;association pour accéder à l&apos;espace membre, inscrire vos chats aux expositions
            et rejoindre notre communauté de passionnés félins.
            {membershipPrice && ` Cotisation annuelle : ${membershipPrice} €.`}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={membershipHref}
              className="px-8 py-3 bg-white text-csf-orange font-bold rounded-lg hover:bg-csf-cream transition-colors">
              Adhérer maintenant
            </Link>
            <Link href="/contact"
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
