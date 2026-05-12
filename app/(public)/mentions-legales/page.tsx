import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mentions légales' }

export default function MentionsLegales() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold font-serif text-csf-dark mb-6">Mentions légales</h1>
      <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-csf-dark">
        <h2>Éditeur du site</h2>
        <p>
          <strong>Chats Sans Frontières (C.S.F.)</strong><br />
          Association loi 1901<br />
          Déclarée le 29 avril 2005<br />
          Réactivée le 17 février 2026<br />
          Email : <a href="mailto:contact@assocsf.fr">contact@assocsf.fr</a><br />
          Site web : <a href="https://assocsf.fr">assocsf.fr</a>
        </p>

        <h2>Présidente de l&apos;association</h2>
        <p>Frédérique BEAUCOUSIN</p>

        <h2>Objet de l&apos;association</h2>
        <p>
          L&apos;association a pour objet principal l&apos;organisation d&apos;expositions félines
          (concours de beauté et de conformité) et la gestion de tout événement lié au chat,
          en respectant les règlements officiels, notamment ceux du LOOF.
        </p>

        <h2>Hébergement</h2>
        <p>
          Le site est hébergé par l&apos;association Chats Sans Frontières.<br />
          Domaine : assocsf.fr
        </p>

        <h2>Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble du contenu de ce site (textes, images, logos, éléments graphiques)
          est la propriété de l&apos;association Chats Sans Frontières ou de ses partenaires.
          Toute reproduction, même partielle, sans autorisation préalable est interdite.
        </p>

        <h2>Protection des données personnelles (RGPD)</h2>
        <p>
          Les données personnelles collectées sur ce site sont uniquement utilisées dans le cadre
          de la gestion des adhésions, des inscriptions aux expositions et de la communication
          avec les membres.
        </p>
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez
          d&apos;un droit d&apos;accès, de rectification, de suppression et de portabilité de vos
          données personnelles. Vous pouvez exercer ces droits en contactant l&apos;association
          à l&apos;adresse : <a href="mailto:contact@assocsf.fr">contact@assocsf.fr</a>.
        </p>

        <h2>Cookies</h2>
        <p>
          Ce site utilise des cookies strictement nécessaires au bon fonctionnement du service
          (authentification, session utilisateur). Aucun cookie de traçage ou publicitaire n&apos;est utilisé.
        </p>

        <h2>Responsabilité</h2>
        <p>
          L&apos;association Chats Sans Frontières s&apos;efforce d&apos;assurer l&apos;exactitude
          des informations diffusées sur ce site. Toutefois, elle ne saurait être tenue responsable
          des erreurs, omissions ou des résultats qui pourraient être obtenus par un mauvais usage
          de ces informations.
        </p>
      </div>
    </div>
  )
}
