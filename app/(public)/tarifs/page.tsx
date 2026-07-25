import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatPrice, DEFAULT_PRICING } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Tarifs — Chats Sans Frontières' }

export default async function TarifsPage() {
  const globalPricing = await prisma.pricing.findFirst()
  const p = globalPricing ?? DEFAULT_PRICING

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="section-title">Tarifs</h1>
        <p className="section-subtitle">
          Tarifs applicables à toutes les expositions organisées par Chats Sans Frontières.
          Les tarifs adhérents s&apos;appliquent aux exposants à jour de leur cotisation (AS, ACEP, MCCF).
        </p>
      </div>

      {/* Registration fee */}
      <div className="card mb-6 flex items-center justify-between">
        <div>
          <p className="font-semibold text-csf-dark">Frais d&apos;inscription</p>
          <p className="text-sm text-csf-muted">Par dossier d&apos;inscription (quelle que soit la catégorie)</p>
        </div>
        <span className="text-2xl font-bold text-csf-orange">{formatPrice(p.registrationFee)}</span>
      </div>

      {/* Tariff tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Adhérents */}
        <div className="card">
          <div className="mb-4 pb-3 border-b border-csf-light">
            <h2 className="font-bold text-csf-dark text-lg">Adhérents</h2>
            <p className="text-xs text-csf-muted mt-0.5">
              Membres à jour de cotisation — AS, ACEP, MCCF
            </p>
          </div>

          <section className="mb-4">
            <h3 className="text-xs font-semibold text-csf-muted uppercase tracking-wide mb-2">1 Jour</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-csf-light">
                <tr>
                  <td className="py-2 text-csf-muted">1er et 2ème chat</td>
                  <td className="py-2 text-right font-semibold text-csf-dark">{formatPrice(p.memberOneDayCat12)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-csf-muted">3ème chat et suivants</td>
                  <td className="py-2 text-right font-semibold text-csf-dark">{formatPrice(p.memberOneDayCat3Plus)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-csf-muted">Chat de maison</td>
                  <td className="py-2 text-right font-semibold text-csf-dark">{formatPrice(p.memberOneDayHouseCat)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="mb-4">
            <h3 className="text-xs font-semibold text-csf-muted uppercase tracking-wide mb-2">2 Jours</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-csf-light">
                <tr>
                  <td className="py-2 text-csf-muted">1er et 2ème chat</td>
                  <td className="py-2 text-right font-semibold text-csf-dark">{formatPrice(p.memberTwoDayCat12)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-csf-muted">3ème chat et suivants</td>
                  <td className="py-2 text-right font-semibold text-csf-dark">{formatPrice(p.memberTwoDayCat3Plus)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-csf-muted">Chat de maison</td>
                  <td className="py-2 text-right font-semibold text-csf-dark">{formatPrice(p.memberTwoDayHouseCat)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-csf-muted uppercase tracking-wide mb-2">Options</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-csf-light">
                <tr>
                  <td className="py-2 text-csf-muted">Conformité</td>
                  <td className="py-2 text-right font-semibold text-csf-dark">{formatPrice(p.memberConformite)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-csf-muted">Diplômes</td>
                  <td className="py-2 text-right font-semibold text-csf-dark">
                    {p.memberDiploma === 0 ? 'Gratuit' : formatPrice(p.memberDiploma)}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>

        {/* Non-adhérents */}
        <div className="card">
          <div className="mb-4 pb-3 border-b border-csf-light">
            <h2 className="font-bold text-csf-dark text-lg">Non-adhérents</h2>
            <p className="text-xs text-csf-muted mt-0.5">Exposants extérieurs</p>
          </div>

          <section className="mb-4">
            <h3 className="text-xs font-semibold text-csf-muted uppercase tracking-wide mb-2">1 Jour</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-csf-light">
                <tr>
                  <td className="py-2 text-csf-muted">1er et 2ème chat</td>
                  <td className="py-2 text-right font-semibold text-csf-dark">{formatPrice(p.nonMemberOneDayCat12)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-csf-muted">3ème chat et suivants</td>
                  <td className="py-2 text-right font-semibold text-csf-dark">{formatPrice(p.nonMemberOneDayCat3Plus)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-csf-muted">Chat de maison</td>
                  <td className="py-2 text-right font-semibold text-csf-dark">{formatPrice(p.nonMemberOneDayHouseCat)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="mb-4">
            <h3 className="text-xs font-semibold text-csf-muted uppercase tracking-wide mb-2">2 Jours</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-csf-light">
                <tr>
                  <td className="py-2 text-csf-muted">1er et 2ème chat</td>
                  <td className="py-2 text-right font-semibold text-csf-dark">{formatPrice(p.nonMemberTwoDayCat12)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-csf-muted">3ème chat et suivants</td>
                  <td className="py-2 text-right font-semibold text-csf-dark">{formatPrice(p.nonMemberTwoDayCat3Plus)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-csf-muted">Chat de maison</td>
                  <td className="py-2 text-right font-semibold text-csf-dark">{formatPrice(p.nonMemberTwoDayHouseCat)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-csf-muted uppercase tracking-wide mb-2">Options</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-csf-light">
                <tr>
                  <td className="py-2 text-csf-muted">Conformité</td>
                  <td className="py-2 text-right font-semibold text-csf-dark">{formatPrice(p.nonMemberConformite)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-csf-muted">Diplômes</td>
                  <td className="py-2 text-right font-semibold text-csf-dark">
                    {p.nonMemberDiploma === 0 ? 'Gratuit' : formatPrice(p.nonMemberDiploma)}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
      </div>

      {/* Cage & membership */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="font-bold text-csf-dark mb-3">Cage</h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-csf-light">
              <tr>
                <td className="py-2 text-csf-muted">Location de cage</td>
                <td className="py-2 text-right font-semibold text-green-600">Gratuit</td>
              </tr>
              <tr>
                <td className="py-2 text-csf-muted">
                  Caution
                  <span className="block text-xs font-normal">Chèque remis sur place, restitué en fin d&apos;exposition</span>
                </td>
                <td className="py-2 text-right font-semibold text-csf-dark">{formatPrice(p.cageDeposit)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 className="font-bold text-csf-dark mb-3">Adhésion</h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-csf-light">
              <tr>
                <td className="py-2 text-csf-muted">
                  Cotisation annuelle
                  <span className="block text-xs font-normal">Renouvellement le 1er janvier</span>
                </td>
                <td className="py-2 text-right font-semibold text-csf-dark">{formatPrice(p.membershipFee)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancellation policy */}
      <div className="card border-l-4 border-csf-orange">
        <h2 className="font-bold text-csf-dark mb-4">Politique d&apos;annulation</h2>
        <div className="space-y-3 text-sm text-csf-muted">
          <div className="flex gap-3">
            <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
            <p>
              <strong className="text-csf-dark">Avant la date limite :</strong> annulation possible totale ou partielle —
              5 € restent à votre charge.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
            <p>
              <strong className="text-csf-dark">Après la date limite d&apos;annulation :</strong> les engagements restent dus intégralement.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
            <p>
              <strong className="text-csf-dark">Règlement le jour J (sans accord préalable) :</strong> majoration de 10 % sur la somme totale.
            </p>
          </div>
          <p className="pt-2 text-xs border-t border-csf-light">
            En cas de litige, le club se réserve le droit de présenter le dossier contentieux à la commission des expositions
            pour décision du Conseil d&apos;Administration du LOOF.
          </p>
        </div>
      </div>

      {/* Payment info */}
      <div className="card mt-6">
        <h2 className="font-bold text-csf-dark mb-3">Modalités de paiement</h2>
        <p className="text-sm text-csf-muted">
          Le paiement s&apos;effectue par virement bancaire après validation de votre inscription par le bureau.
          Les coordonnées bancaires vous sont communiquées lors de la confirmation.
        </p>
      </div>
    </div>
  )
}
