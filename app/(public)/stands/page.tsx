import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate, EXHIBITION_STATUS_LABELS } from '@/lib/utils'
import { ExhibitionStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Location de stands' }

export default async function StandsPage() {
  const [exhibitions, emailConfig, phoneConfig, contractConfig] = await Promise.all([
    prisma.exhibition.findMany({
      where: {
        status: { in: [ExhibitionStatus.OPEN, ExhibitionStatus.CLOSED] },
        startDate: { gte: new Date('2026-01-01') }
      },
      orderBy: { startDate: 'asc' },
    }),
    prisma.siteConfig.findUnique({ where: { key: 'standContactEmail' } }),
    prisma.siteConfig.findUnique({ where: { key: 'standContactPhone' } }),
    prisma.siteConfig.findUnique({ where: { key: 'standContractUrl' } }),
  ])

  const contactEmail = emailConfig?.value || 'frederique.beaucousin@assocsf.fr'
  const contactPhone = phoneConfig?.value || '06 11 52 15 26'
  const contractUrl = contractConfig?.value

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="section-title">Location de Stands</h1>
        <p className="section-subtitle">Louer un stand lors de nos expositions félines</p>
      </div>

      {/* Contract section */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-csf-orange/10 to-transparent rounded-xl border border-csf-orange/20 p-8">
          <h2 className="text-2xl font-bold text-csf-dark mb-3">Conditions de participation</h2>
          <p className="text-csf-muted mb-6">
            Avant de louer un stand, consultez notre contrat complet de mise à disposition d&apos;emplacement et le règlement général de nos expositions.
          </p>
          <div className="flex gap-3">
            <a href="/stands/contrat" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-csf-orange text-white rounded-lg font-medium hover:bg-csf-orange-dark transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Consulter le contrat
            </a>
            {contractUrl && (
              <a href={contractUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-csf-orange text-csf-orange rounded-lg font-medium hover:bg-csf-orange hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Télécharger le PDF
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Exhibitions with stands */}
      <section>
        <h2 className="text-2xl font-bold text-csf-dark mb-6">Expositions disponibles</h2>

        {exhibitions.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-csf-muted">Aucune exposition disponible pour la location de stands pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {exhibitions.map((expo) => (
              <div key={expo.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-csf-dark">{expo.title}</h3>
                      <p className="text-sm text-csf-muted mt-1">{expo.location} • {expo.city}</p>
                    </div>
                    <span className="badge badge-orange text-xs">
                      {formatDate(expo.startDate)} – {formatDate(expo.endDate)}
                    </span>
                  </div>
                  {expo.description && (
                    <p className="text-csf-muted text-sm">{expo.description}</p>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  {/* Pricing */}
                  <div>
                    <h4 className="font-semibold text-csf-dark mb-3">Tarifs</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-csf-muted">Module 2m × 3m</span>
                        <span className="font-bold text-csf-dark">{expo.standBasePricePerModule}€</span>
                      </div>
                      <p className="text-xs text-csf-muted pt-2 border-t border-gray-200">
                        Branchement électrique facturé à part selon besoin
                      </p>
                      <div className="text-xs text-csf-muted pt-2 border-t border-gray-200 italic">
                        <p className="mb-1"><strong>Tarifs négociables :</strong> Les tarifs peuvent être discutés et adaptés au cas par cas.</p>
                        <p><strong>Exposants réguliers :</strong> Des tarifs préférentiels sont proposés aux exposants fidèles de nos manifestations.</p>
                      </div>
                    </div>
                  </div>

                  {/* Stand plan */}
                  <div>
                    <h4 className="font-semibold text-csf-dark mb-2">Plan des emplacements</h4>
                    {expo.standPlanUrl ? (
                      <a href={expo.standPlanUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-csf-orange text-csf-orange rounded-lg text-sm font-medium hover:bg-csf-orange hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Consulter le plan
                      </a>
                    ) : (
                      <button disabled
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Plan à venir
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex gap-2 justify-end">
                  <Link href={`/expositions/${expo.slug}`}
                    className="px-4 py-2 border border-csf-orange text-csf-orange rounded-lg text-sm font-medium hover:bg-csf-orange hover:text-white transition-colors">
                    Détails exposition
                  </Link>
                  <a href={`mailto:frederique.beaucousin@assocsf.fr?subject=Demande de location de stand - ${expo.title}`}
                    className="px-4 py-2 bg-csf-orange text-white rounded-lg text-sm font-medium hover:bg-csf-orange-dark transition-colors">
                    Me renseigner
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Info section */}
      <section className="mt-12 bg-gray-50 rounded-xl border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-csf-dark mb-4">Comment réserver un stand ?</h2>
        <ol className="space-y-3 text-csf-muted">
          <li className="flex gap-3">
            <span className="font-bold text-csf-orange min-w-6">1.</span>
            <span>Consultez le plan de salle pour voir les emplacements disponibles</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-csf-orange min-w-6">2.</span>
            <span>Téléchargez et complétez le contrat de location</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-csf-orange min-w-6">3.</span>
            <span>Versez un acompte de 30% des frais (non remboursable sauf refus du dossier)</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-csf-orange min-w-6">4.</span>
            <span>Envoyez le contrat signé avec l&apos;acompte à Chats Sans Frontières</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-csf-orange min-w-6">5.</span>
            <span>Versez le solde avant le premier jour de l&apos;exposition</span>
          </li>
        </ol>

        <div className="mt-6 space-y-3">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Contact :</strong> <a href={`mailto:${contactEmail}`} className="hover:underline">{contactEmail}</a> • <a href={`tel:${contactPhone}`} className="hover:underline">{contactPhone}</a>
            </p>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900">
              <strong>📌 Tarification flexible :</strong> Les tarifs affichés sont nos tarifs de base. Nous sommes ouverts à la négociation selon votre profil et votre fidélité. Contactez-nous pour discuter d&apos;une offre adaptée à votre situation.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
