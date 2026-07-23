import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate, formatDateShort, formatPrice } from '@/lib/utils'
import { ExhibitionStatus } from '@prisma/client'

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const expo = await prisma.exhibition.findUnique({ where: { slug: params.slug } })
  if (!expo) return { title: 'Exposition introuvable' }
  return { title: expo.title }
}

export default async function ExpoDetailPage({ params }: Props) {
  const expo = await prisma.exhibition.findUnique({
    where: { slug: params.slug },
    include: {
      _count: { select: { registrations: true } },
      pricingTiers: { orderBy: { minCats: 'asc' } },
      cageOptions: { orderBy: { order: 'asc' } },
    },
  })

  if (!expo) notFound()

  const isOpen = expo.status === ExhibitionStatus.OPEN
  const registrationFull = expo.maxRegistrations
    ? expo._count.registrations >= expo.maxRegistrations
    : false

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/expositions" className="inline-flex items-center gap-1 text-csf-muted hover:text-csf-orange text-sm mb-8 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Toutes les expositions
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main info */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold font-serif text-csf-dark mb-4">{expo.title}</h1>
          {expo.description && (
            <p className="text-csf-muted text-lg leading-relaxed mb-6">{expo.description}</p>
          )}

          {expo.rules && (
            <div className="card mb-6">
              <h2 className="font-bold text-csf-dark mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-csf-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Règlement & Conditions
              </h2>
              <p className="text-sm text-csf-muted leading-relaxed">{expo.rules}</p>
            </div>
          )}

          {/* Pricing table */}
          <div className="card">
            <h2 className="font-bold text-csf-dark mb-4">Tarifs</h2>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-csf-light">
                {expo.pricingTiers.length > 0 ? (
                  expo.pricingTiers.map((tier, idx) => {
                    const isLast = idx === expo.pricingTiers.length - 1
                    const label = isLast
                      ? `Inscription — ${tier.minCats}+ chat${tier.minCats > 1 ? 's' : ''}`
                      : `Inscription — ${tier.minCats} chat${tier.minCats > 1 ? 's' : ''}`
                    return (
                      <tr key={tier.id}>
                        <td className="py-2 text-csf-muted">{label}</td>
                        <td className="py-2 text-right font-medium text-csf-dark">{formatPrice(tier.pricePerCat)} / chat</td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td className="py-2 text-csf-muted">Inscription de base (par chat)</td>
                    <td className="py-2 text-right font-medium text-csf-dark">{formatPrice(expo.priceBase)}</td>
                  </tr>
                )}
                {expo.cageOptions.map((opt) => (
                  <tr key={opt.id}>
                    <td className="py-2 text-csf-muted">{opt.name}</td>
                    <td className="py-2 text-right font-medium text-csf-dark">
                      {opt.price > 0 ? formatPrice(opt.price) : 'Inclus'}
                    </td>
                  </tr>
                ))}
                {expo.mealsEnabled && (
                  <tr>
                    <td className="py-2 text-csf-muted">Repas (pré-commande)</td>
                    <td className="py-2 text-right font-medium text-csf-dark">{formatPrice(expo.priceMeal)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status card */}
          <div className={`card border-2 ${isOpen ? 'border-green-400' : 'border-gray-200'}`}>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
              isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {isOpen ? 'Inscriptions ouvertes' : 'Inscriptions fermées'}
            </div>
            {expo.maxRegistrations && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-csf-muted mb-1">
                  <span>{expo._count.registrations} inscrits</span>
                  <span>{expo.maxRegistrations} places max</span>
                </div>
                <div className="h-2 bg-csf-light rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-csf-orange rounded-full transition-all"
                    style={{ width: `${Math.min(100, (expo._count.registrations / expo.maxRegistrations) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            {isOpen && !registrationFull ? (
              <Link href={`/membre/inscriptions/${expo.id}`} className="btn-primary w-full text-sm">
                S&apos;inscrire à cette exposition
              </Link>
            ) : (
              <p className="text-sm text-csf-muted text-center">
                {registrationFull ? 'Complet' : 'Les inscriptions sont fermées'}
              </p>
            )}
          </div>

          {/* Details */}
          <div className="card space-y-3 text-sm">
            <div>
              <p className="text-xs text-csf-muted uppercase tracking-wide mb-1">Dates</p>
              <p className="font-medium">{formatDate(expo.startDate)} – {formatDate(expo.endDate)}</p>
            </div>
            <div>
              <p className="text-xs text-csf-muted uppercase tracking-wide mb-1">Lieu</p>
              <p className="font-medium">{expo.location}</p>
              {expo.address && <p className="text-csf-muted">{expo.address}</p>}
              <p className="text-csf-muted">{expo.city}</p>
            </div>
            <div>
              <p className="text-xs text-csf-muted uppercase tracking-wide mb-1">Clôture des inscriptions</p>
              <p className="font-medium text-orange-600">{formatDateShort(expo.registrationDeadline)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
