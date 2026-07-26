import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatPrice, DEFAULT_PRICING } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Conditions Générales de Vente' }

export default async function CGV() {
  const globalPricing = await prisma.pricing.findFirst()
  const p = globalPricing ?? DEFAULT_PRICING

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold font-serif text-csf-dark mb-2">Conditions Générales de Vente</h1>
      <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : juillet 2026</p>

      <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-csf-dark">

        <h2>Article 1 – Objet et champ d&apos;application</h2>
        <p>
          Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles
          entre l&apos;association <strong>Chats Sans Frontières (C.S.F.)</strong> et toute personne
          physique majeure souhaitant :
        </p>
        <ul>
          <li>Souscrire une adhésion annuelle à l&apos;association ;</li>
          <li>S&apos;inscrire à une exposition féline organisée par l&apos;association ;</li>
          <li>Louer une cage lors d&apos;une exposition.</li>
        </ul>
        <p>
          Toute commande ou inscription implique l&apos;acceptation sans réserve des présentes CGV.
        </p>

        <h2>Article 2 – Identification de l&apos;association</h2>
        <p>
          <strong>Chats Sans Frontières (C.S.F.)</strong><br />
          Association régie par la loi du 1er juillet 1901<br />
          Numéro RNA : W763010519<br />
          Déclarée le 29 avril 2005 – Réactivée le 17 février 2026<br />
          Siège social : 60 Quai de la Libération, 76480 Duclair<br />
          Présidente : Frédérique BEAUCOUSIN<br />
          Email : <a href="mailto:contact@assocsf.fr">contact@assocsf.fr</a><br />
          Site web : <a href="https://assocsf.fr">assocsf.fr</a>
        </p>

        <h2>Article 3 – Services proposés</h2>

        <h3>3.1 Adhésion annuelle</h3>
        <p>
          L&apos;adhésion annuelle confère le statut d&apos;<strong>adhérent</strong> de l&apos;association et
          ouvre droit à des tarifs préférentiels lors des expositions. Elle est valable du 1er janvier
          au 31 décembre de l&apos;année en cours. Le tarif en vigueur est consultable sur la page
          <a href="/tarifs"> Tarifs</a> du site.
        </p>

        <h3>3.2 Inscription à une exposition</h3>
        <p>
          L&apos;inscription à une exposition comprend :
        </p>
        <ul>
          <li>Des <strong>frais de dossier</strong> ({formatPrice(p.registrationFee)}) non remboursables en toutes circonstances ;</li>
          <li>Des <strong>frais d&apos;inscription par chat</strong> selon le barème en vigueur (nombre de jours,
            statut membre ou non-membre, rang du chat) ;</li>
          <li>Des options facultatives : examen de conformité, diplômes.</li>
        </ul>
        <p>
          Les tarifs détaillés sont disponibles sur la page <a href="/tarifs">Tarifs</a>.
        </p>

        <h3>3.3 Location de cage</h3>
        <p>
          La location de cage lors d&apos;une exposition est gratuite. Elle est conditionnée à la remise
          d&apos;un <strong>chèque de caution de {formatPrice(p.cageDeposit)}</strong> le jour de l&apos;événement. Ce chèque
          est restitué à l&apos;issue de l&apos;exposition, sauf dans les cas suivants :
        </p>
        <ul>
          <li>Dégradation de la cage ;</li>
          <li>Cage non nettoyée lors de la restitution ;</li>
          <li>Cage non rendue à la fin de l&apos;exposition.</li>
        </ul>
        <p>
          En cas de non-restitution de la cage, le chèque de caution sera encaissé.
        </p>

        <h2>Article 4 – Conditions d&apos;inscription et de commande</h2>

        <h3>4.1 Adhésion</h3>
        <p>
          Toute demande d&apos;adhésion est soumise à l&apos;approbation du bureau de l&apos;association.
          Une fois la demande approuvée, les coordonnées bancaires sont communiquées par email.
          L&apos;adhésion n&apos;est effective qu&apos;après réception du paiement complet par
          l&apos;association.
        </p>

        <h3>4.2 Inscription à une exposition</h3>
        <p>
          Toute inscription est soumise à validation du bureau. Elle n&apos;est définitivement
          enregistrée qu&apos;après réception du paiement. À titre exceptionnel et après accord
          explicite du bureau, un paiement différé ou un paiement sur place peut être accordé.
        </p>
        <p>
          Les inscriptions sont ouvertes aux seules <strong>personnes physiques majeures</strong>.
          Les mineurs ne peuvent pas s&apos;inscrire en tant qu&apos;exposants.
        </p>

        <h2>Article 5 – Prix et modalités de paiement</h2>
        <p>
          Tous les prix sont exprimés en euros. L&apos;association n&apos;est pas assujettie à la TVA.
        </p>
        <p>
          Le paiement peut être effectué par :
        </p>
        <ul>
          <li><strong>Virement bancaire</strong> — les coordonnées IBAN/BIC sont communiquées par
            email après validation ;</li>
          <li><strong>PayPal</strong> — si disponible, le lien est fourni dans l&apos;email de
            confirmation.</li>
        </ul>
        <p>
          Aucun paiement en ligne direct n&apos;est possible depuis le site. Le paiement doit intervenir
          dans le délai indiqué dans l&apos;email de confirmation.
        </p>

        <h2>Article 6 – Politique d&apos;annulation et de remboursement</h2>

        <h3>6.1 Annulation à l&apos;initiative de l&apos;exposant</h3>
        <p>
          En cas d&apos;annulation de son inscription par l&apos;exposant :
        </p>
        <ul>
          <li>
            <strong>Plus de 15 jours avant le premier jour de l&apos;exposition :</strong> remboursement
            intégral des frais d&apos;inscription par chat. Les frais de dossier ({formatPrice(p.registrationFee)}) restent acquis
            à l&apos;association dans tous les cas.
          </li>
          <li>
            <strong>Moins de 15 jours avant l&apos;exposition ou non-présentation :</strong> aucun
            remboursement n&apos;est possible, sauf décision exceptionnelle du bureau.
          </li>
        </ul>

        <h3>6.2 Annulation de l&apos;exposition par l&apos;association</h3>
        <p>
          En cas d&apos;annulation d&apos;une exposition par l&apos;association (force majeure,
          circonstances exceptionnelles ou toute autre cause), la totalité des sommes versées
          (y compris les frais de dossier) est remboursée dans un délai maximum d&apos;un mois.
        </p>
        <p>
          Le remboursement est effectué par le même moyen de paiement que celui utilisé lors du
          règlement initial. En cas d&apos;impossibilité, un virement bancaire sera effectué sur les
          coordonnées communiquées par l&apos;exposant.
        </p>

        <h2>Article 7 – Droit de rétractation</h2>
        <p>
          Conformément à l&apos;article L.221-28 du Code de la consommation, le droit de rétractation
          de 14 jours ne s&apos;applique pas aux prestations de services de loisirs dont l&apos;exécution
          est prévue à une date ou une période déterminée. Les inscriptions aux expositions et
          les adhésions annuelles relèvent de cette exception et ne peuvent donc pas faire
          l&apos;objet d&apos;un droit de rétractation.
        </p>

        <h2>Article 8 – Responsabilité</h2>
        <p>
          L&apos;association décline toute responsabilité en cas de vol, perte ou dommage causé aux
          animaux, équipements ou effets personnels des exposants pendant l&apos;événement. Chaque
          exposant est seul responsable de ses animaux et de ses équipements.
        </p>

        <h2>Article 9 – Données personnelles</h2>
        <p>
          Les données collectées dans le cadre des inscriptions et adhésions sont traitées
          conformément à notre{' '}
          <a href="/confidentialite">politique de confidentialité</a>.
        </p>

        <h2>Article 10 – Litiges et loi applicable</h2>
        <p>
          Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable
          sera recherchée en priorité en contactant l&apos;association à{' '}
          <a href="mailto:contact@assocsf.fr">contact@assocsf.fr</a>.
        </p>
        <p>
          À défaut de résolution amiable, le tribunal compétent sera celui du siège social de
          l&apos;association (Duclair, Seine-Maritime).
        </p>
        <p>
          En cas de litige avec un consommateur résidant dans l&apos;Union européenne, la Commission
          européenne met à disposition une plateforme de résolution des litiges en ligne accessible
          à l&apos;adresse :{' '}
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
            https://ec.europa.eu/consumers/odr/
          </a>.
        </p>

      </div>
    </div>
  )
}
