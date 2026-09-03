import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate, formatDateShort, formatPrice, DEFAULT_PRICING } from '@/lib/utils'
import { ExhibitionStatus } from '@prisma/client'
import RegistrationsList from '@/components/exhibitions/RegistrationsList'

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const expo = await prisma.exhibition.findUnique({ where: { slug: params.slug } })
  if (!expo) return { title: 'Exposition introuvable' }
  return { title: expo.title }
}

export default async function ExpoDetailPage({ params }: Props) {
  const [expo, globalPricing] = await Promise.all([
    prisma.exhibition.findUnique({
      where: { slug: params.slug },
      include: { _count: { select: { registrations: true } } },
    }),
    prisma.pricing.findFirst(),
  ])

  if (!expo) notFound()

  const pricing = globalPricing ?? DEFAULT_PRICING
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

          {/* Global tariff table */}
          <div className="card">
            <h2 className="font-bold text-csf-dark mb-4">Tarifs</h2>
            <p className="text-xs text-csf-muted mb-4">
              Frais d&apos;inscription : <strong>{formatPrice(pricing.registrationFee)}</strong> par inscription
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Adhérents */}
              <div>
                <h3 className="text-sm font-semibold text-csf-dark mb-3 pb-1 border-b border-csf-light">
                  Adhérents
                </h3>
                <p className="text-xs font-medium text-csf-muted uppercase tracking-wide mb-1">1 Jour</p>
                <table className="w-full text-sm mb-3">
                  <tbody className="divide-y divide-csf-light">
                    <tr>
                      <td className="py-1.5 text-csf-muted">1er et 2ème chat</td>
                      <td className="py-1.5 text-right font-medium text-csf-dark">{formatPrice(pricing.memberOneDayCat12)}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-csf-muted">3ème chat et +</td>
                      <td className="py-1.5 text-right font-medium text-csf-dark">{formatPrice(pricing.memberOneDayCat3Plus)}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-csf-muted">Chat de maison</td>
                      <td className="py-1.5 text-right font-medium text-csf-dark">{formatPrice(pricing.memberOneDayHouseCat)}</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs font-medium text-csf-muted uppercase tracking-wide mb-1">2 Jours</p>
                <table className="w-full text-sm mb-3">
                  <tbody className="divide-y divide-csf-light">
                    <tr>
                      <td className="py-1.5 text-csf-muted">1er et 2ème chat</td>
                      <td className="py-1.5 text-right font-medium text-csf-dark">{formatPrice(pricing.memberTwoDayCat12)}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-csf-muted">3ème chat et +</td>
                      <td className="py-1.5 text-right font-medium text-csf-dark">{formatPrice(pricing.memberTwoDayCat3Plus)}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-csf-muted">Chat de maison</td>
                      <td className="py-1.5 text-right font-medium text-csf-dark">{formatPrice(pricing.memberTwoDayHouseCat)}</td>
                    </tr>
                  </tbody>
                </table>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-csf-light">
                    <tr>
                      <td className="py-1.5 text-csf-muted">Conformité</td>
                      <td className="py-1.5 text-right font-medium text-csf-dark">{formatPrice(pricing.memberConformite)}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-csf-muted">Diplômes</td>
                      <td className="py-1.5 text-right font-medium text-csf-dark">
                        {pricing.memberDiploma === 0 ? 'Gratuit' : formatPrice(pricing.memberDiploma)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Non-adhérents */}
              <div>
                <h3 className="text-sm font-semibold text-csf-dark mb-3 pb-1 border-b border-csf-light">
                  Non-adhérents
                </h3>
                <p className="text-xs font-medium text-csf-muted uppercase tracking-wide mb-1">1 Jour</p>
                <table className="w-full text-sm mb-3">
                  <tbody className="divide-y divide-csf-light">
                    <tr>
                      <td className="py-1.5 text-csf-muted">1er et 2ème chat</td>
                      <td className="py-1.5 text-right font-medium text-csf-dark">{formatPrice(pricing.nonMemberOneDayCat12)}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-csf-muted">3ème chat et +</td>
                      <td className="py-1.5 text-right font-medium text-csf-dark">{formatPrice(pricing.nonMemberOneDayCat3Plus)}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-csf-muted">Chat de maison</td>
                      <td className="py-1.5 text-right font-medium text-csf-dark">{formatPrice(pricing.nonMemberOneDayHouseCat)}</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs font-medium text-csf-muted uppercase tracking-wide mb-1">2 Jours</p>
                <table className="w-full text-sm mb-3">
                  <tbody className="divide-y divide-csf-light">
                    <tr>
                      <td className="py-1.5 text-csf-muted">1er et 2ème chat</td>
                      <td className="py-1.5 text-right font-medium text-csf-dark">{formatPrice(pricing.nonMemberTwoDayCat12)}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-csf-muted">3ème chat et +</td>
                      <td className="py-1.5 text-right font-medium text-csf-dark">{formatPrice(pricing.nonMemberTwoDayCat3Plus)}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-csf-muted">Chat de maison</td>
                      <td className="py-1.5 text-right font-medium text-csf-dark">{formatPrice(pricing.nonMemberTwoDayHouseCat)}</td>
                    </tr>
                  </tbody>
                </table>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-csf-light">
                    <tr>
                      <td className="py-1.5 text-csf-muted">Conformité</td>
                      <td className="py-1.5 text-right font-medium text-csf-dark">{formatPrice(pricing.nonMemberConformite)}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-csf-muted">Diplômes</td>
                      <td className="py-1.5 text-right font-medium text-csf-dark">
                        {pricing.nonMemberDiploma === 0 ? 'Gratuit' : formatPrice(pricing.nonMemberDiploma)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-csf-light text-sm text-csf-muted space-y-1">
              <p>Cage : <strong className="text-csf-dark">Gratuit</strong> — caution de {formatPrice(pricing.cageDeposit)} par chèque remis sur place</p>
              <p>Cotisation annuelle : <strong className="text-csf-dark">{formatPrice(pricing.membershipFee)}</strong></p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Poster */}
          {expo.coverImageUrl && (
            <div className="relative w-full aspect-[210/297] bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={expo.coverImageUrl} alt={`Affiche ${expo.title}`}
                className="w-full h-full object-contain" />
            </div>
          )}

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

      {/* Registrations Section */}
      <div className="mt-16 pt-8 border-t border-csf-light">
        <h2 className="text-2xl font-bold font-serif text-csf-dark mb-6">Suivi des inscrits</h2>
        <RegistrationsList exhibitionId={expo.id} />
      </div>
    </div>
  )
}
