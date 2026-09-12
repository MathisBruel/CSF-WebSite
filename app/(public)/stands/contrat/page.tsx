import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Contrat de location de stand' }

export default function ContratPage() {
  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 print:mb-4">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-csf-orange text-white rounded-lg text-sm font-medium hover:bg-csf-orange-dark transition-colors print:hidden"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H9m4 0h4m-2-8V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4" />
            </svg>
            Imprimer / Télécharger en PDF
          </button>
        </div>

        <article className="prose prose-sm max-w-none space-y-6 text-justify">
          {/* Header */}
          <div className="text-center border-b-2 border-gray-300 pb-6 print:pb-3">
            <h1 className="text-2xl font-bold mb-2 print:text-lg print:mb-1">
              CONTRAT DE MISE À DISPOSITION D&apos;UN EMPLACEMENT
            </h1>
            <p className="text-sm text-gray-600 print:text-xs">
              Chats Sans Frontières (C.S.F.)
            </p>
          </div>

          {/* Rules section */}
          <div>
            <h2 className="text-xl font-bold mb-4 print:text-base print:mb-2 print:mt-4">RÈGLEMENT GÉNÉRAL</h2>

            <div className="space-y-4">
              {/* Article 1 */}
              <div>
                <h3 className="font-bold mb-2 print:text-sm">ARTICLE 1 CONDITIONS LIMINAIRES</h3>
                <div className="space-y-2 text-sm print:text-xs leading-relaxed">
                  <p>
                    En signant ce contrat, le locataire du stand reconnaît avoir pris connaissance du présent règlement et s&apos;engage à en respecter toutes les prescriptions.
                  </p>
                  <p>
                    Toute infraction constatée par la Présidence de Chats Sans Frontières (C.S.F.) entraînera la résiliation immédiate de l&apos;accord, pouvant aller jusqu&apos;à l&apos;expulsion sans préjudice ni remboursement.
                  </p>
                  <p>
                    Chaque demande doit être accompagnée d&apos;un acompte de 30% des frais de participation, qui reste définitivement acquis à C.S.F. (sauf en cas de refus du dossier par l&apos;association).
                  </p>
                  <p>
                    La réservation ne sera effective qu&apos;à réception du contrat par l&apos;association.
                  </p>
                  <p>
                    Le plan de salle comporte des modules de 2m x 2m numérotés.
                  </p>
                  <p>
                    C.S.F. se réserve le droit de refuser la participation ou l&apos;entrée de toute personne, sans justification.
                  </p>
                </div>
              </div>

              {/* Article 2 */}
              <div>
                <h3 className="font-bold mb-2 print:text-sm">ARTICLE 2 OBLIGATIONS DU LOCATAIRE</h3>
                <div className="space-y-2 text-sm print:text-xs leading-relaxed">
                  <p>
                    Le solde de la participation est dû au plus tard le matin du premier jour de l&apos;exposition. Un non-règlement entraîne l&apos;annulation de l&apos;emplacement sans remboursement de l&apos;acompte.
                  </p>
                  <p>
                    Seul un désistement justifié et notifié au moins 5 jours avant l&apos;ouverture de la manifestation permet un remboursement, déduction faite de 15 euros de frais de dossier acquis à l&apos;association. En cas d&apos;inoccupation hors de ce délai, les sommes sont conservées par C.S.F.
                  </p>
                  <p>
                    Les frais de transport, parking, installation et matériel sont à la charge exclusive du locataire.
                  </p>
                  <p>
                    Le locataire doit s&apos;installer la veille de l&apos;ouverture, entre 13h et 19h. Passé ce délai, l&apos;emplacement est récupéré par le club sans dédommagement.
                  </p>
                  <p>
                    Les emplacements sont livrés nus et décorés sous l&apos;entière responsabilité du locataire.
                  </p>
                  <p>
                    L&apos;ignifugation des installations est obligatoire, et un intervalle de 0,50m doit être conservé entre les stands pour des raisons de sécurité. Les allées ne doivent pas être obstruées.
                  </p>
                  <p>
                    Le stand doit être occupé en permanence par une personne compétente durant les heures d&apos;ouverture, avec une présentation impeccable (emballages et vestiaires cachés du public).
                  </p>
                  <p>
                    Il est formellement interdit de :
                  </p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>Distribuer des documents hors du stand sans accord de la Présidence de C.S.F</li>
                    <li>Distribuer des prospectus sans rapport avec l&apos;activité du locataire</li>
                    <li>Vendre des billets de tombola sans dérogation</li>
                    <li>Effectuer des sondages dans les allées</li>
                    <li>Faire une publicité trompeuse</li>
                    <li>Utiliser du matériel sonore, lumineux ou à moteur thermique gênant les voisins ou perceptible hors du stand</li>
                  </ul>
                </div>
              </div>

              {/* Article 3 */}
              <div>
                <h3 className="font-bold mb-2 print:text-sm">ARTICLE 3 OBLIGATIONS ET DROITS DE L&apos;ASSOCIATION</h3>
                <div className="space-y-2 text-sm print:text-xs leading-relaxed">
                  <p>
                    C.S.F. s&apos;engage à réserver l&apos;emplacement jusqu&apos;à l&apos;heure limite d&apos;installation (la veille à 19h).
                  </p>
                  <p>
                    C.S.F. peut faire supprimer ou modifier toute installation nuisant à l&apos;aspect général ou gênant les visiteurs/voisins.
                  </p>
                  <p>
                    L&apos;association conserve le droit exclusif d&apos;affichage hors de l&apos;emprise des stands.
                  </p>
                  <p>
                    C.S.F. est exonérée de toute responsabilité concernant les préjudices commerciaux ou troubles de jouissance (retard, fermeture, incendie, etc.).
                  </p>
                  <p>
                    En cas de force majeure annulant l&apos;événement, C.S.F. proposera un avoir pour une prochaine exposition ou un remboursement par virement.
                  </p>
                </div>
              </div>

              {/* Article 4 */}
              <div>
                <h3 className="font-bold mb-2 print:text-sm">ARTICLE 4 TARIFS</h3>
                <div className="space-y-2 text-sm print:text-xs leading-relaxed">
                  <p>
                    Les tarifs ne peuvent être fractionnés et sont nets de taxes (association non assujettie à la TVA).
                  </p>
                  <div className="bg-gray-50 p-3 rounded print:bg-white print:border print:border-gray-300">
                    <p className="font-semibold mb-1">Emplacement pour un module de base (2m long x 3m de large) : 50€</p>
                    <p>Branchement électrique : facturé sur justificatif selon la salle</p>
                  </div>
                </div>
              </div>

              {/* Article 5 */}
              <div>
                <h3 className="font-bold mb-2 print:text-sm">ARTICLE 5 RESPONSABILITÉS ET LITIGES</h3>
                <div className="space-y-2 text-sm print:text-xs leading-relaxed">
                  <p>
                    C.S.F. peut exiger la modification d&apos;un stand si les règles de sécurité ne sont pas respectées.
                  </p>
                  <p>
                    Le locataire est responsable des accidents survenant de son fait autour de son stand.
                  </p>
                  <p>
                    C.S.F. n&apos;est pas responsable des vols ou dégradations, y compris pendant la fermeture nocturne.
                  </p>
                  <p>
                    Seuls les membres du Conseil d&apos;Administration de C.S.F. présents sur place ont autorité pour régler les litiges.
                  </p>
                  <p>
                    Tout litige insoluble à l&apos;amiable sera transmis au Tribunal de Commerce dont dépend la ville de l&apos;exposition.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t-2 border-gray-300 my-8 print:my-4"></div>

          {/* Contract form */}
          <div>
            <h2 className="text-xl font-bold mb-4 print:text-base print:mb-2">
              CONTRAT DE MISE À DISPOSITION D&apos;UN EMPLACEMENT
            </h2>

            <div className="space-y-4 text-sm print:text-xs">
              <div className="bg-gray-50 p-4 rounded print:bg-white">
                <p className="font-bold mb-2">ENTRE LES SOUSSIGNÉS</p>

                <div className="space-y-3">
                  <p>
                    L&apos;association <strong>Chats Sans Frontières</strong>, domiciliée au <strong>60 QUAI DE LA LIBÉRATION, 76480 DUCLAIR</strong>, immatriculée sous le N° SIRET: <strong>48331477900016</strong>, représentée par Madame <strong>BEAUCOUSIN Frédérique</strong>, agissant en qualité de Présidente pour le compte de Chats Sans Frontières, dûment habilitée au fins des présentes.
                  </p>
                  <p className="text-xs">
                    Tél: 06 11 52 15 26 • Email: frederique.beaucousin@assocsf.fr
                  </p>
                  <p className="font-semibold">Dénommée ci-après &ldquo;Chats Sans Frontières&rdquo;</p>
                </div>

                <div className="my-3 text-center font-bold">D&apos;UNE PART,</div>

                <div className="border-t pt-3 space-y-2 text-xs">
                  <p>ET</p>
                  <div className="space-y-1">
                    <p>Raison sociale ou Nom : _____________________________________________________________</p>
                    <p>Adresse : ___________________________________________________________________________</p>
                    <p>Code postale : __________________ Ville : _______________________________________________</p>
                    <p>Tél : ______________________________ SIRET : ____________________________________________</p>
                    <p>KBIS : ___________________________________________________________________________</p>
                    <p>Représentée par : ________________________________________________________________</p>
                    <p>Tél : __________________________</p>
                  </div>
                </div>

                <div className="my-3 text-center font-bold">D&apos;AUTRE PART,</div>

                <div className="space-y-3">
                  <p>
                    Ce contrat à pour objet de fixer les modalités de mise à disposition d&apos;un emplacement d&apos;un stand de vente ou de promotion de produits entre Chats Sans Frontières et Le Locataire lors de la manifestation féline :
                  </p>

                  <div className="space-y-2 text-xs">
                    <p>Nom de la manifestation : __________________________________________________________</p>
                    <p>Date(s) : ________________________________________________________________________</p>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded">
                    <p className="font-semibold mb-2">Le Locataire reconnaît avoir pris connaissance et accepter tous les articles du Règlement Général.</p>
                    <p className="text-xs">Présence sur place du : __________________ à ___h___ jusqu&apos;au __________________ à ___h___</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Le Locataire fait la demande de mise à disposition suivante :</p>
                    <div className="border border-gray-300 p-2 text-xs space-y-1">
                      <div className="flex justify-between border-b pb-1">
                        <span>Dimensions du stand</span>
                        <span>Montant HT</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span>☐ 2m × 3m</span>
                        <span>50€</span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span>Branchement électrique</span>
                        <span>À justifier</span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span>Autre ?</span>
                        <span>_______</span>
                      </div>
                      <div className="flex justify-between border-t pt-1 font-bold">
                        <span>TOTAL HT :</span>
                        <span>_______€</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold mb-1">Description obligatoire et exhaustive des produits présentés :</p>
                    <div className="border border-gray-300 p-2 min-h-16"></div>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="mt-8 space-y-6 print:mt-4 print:space-y-3">
                <div>
                  <p className="font-semibold mb-1">SIGNATURES</p>
                  <div className="grid grid-cols-2 gap-8 print:gap-4">
                    <div className="space-y-3 print:space-y-2">
                      <p className="font-bold">Chats Sans Frontières</p>
                      <div className="text-xs space-y-2 print:space-y-1">
                        <p>FAIT À ___________________________</p>
                        <p>LE ____ / ____ / ________</p>
                      </div>
                      <div className="space-y-1 text-xs">
                        <p>BEAUCOUSIN Frédérique (Présidente)</p>
                        <div className="h-12 print:h-6"></div>
                        <p>BRUEL Mathis (Secrétaire)</p>
                        <div className="h-12 print:h-6"></div>
                      </div>
                    </div>
                    <div className="space-y-3 print:space-y-2">
                      <p className="font-bold">Le Locataire</p>
                      <div className="text-xs space-y-2 print:space-y-1">
                        <p>FAIT À ___________________________</p>
                        <p>LE ____ / ____ / ________</p>
                      </div>
                      <div className="space-y-1 text-xs">
                        <p>Faire précéder la signature de la mention manuscrite :</p>
                        <p className="italic">&laquo; Lu et approuvé &raquo;</p>
                        <div className="h-12 print:h-6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
