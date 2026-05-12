import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Politique de confidentialité' }

export default function Confidentialite() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold font-serif text-csf-dark mb-6">Politique de confidentialité</h1>
      <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-csf-dark">
        <p className="text-csf-muted">Dernière mise à jour : mai 2026</p>

        <h2>Responsable du traitement</h2>
        <p>
          <strong>Chats Sans Frontières (C.S.F.)</strong><br />
          Association loi 1901<br />
          Email : <a href="mailto:contact@assocsf.fr">contact@assocsf.fr</a>
        </p>

        <h2>Données collectées</h2>
        <p>Dans le cadre de nos activités, nous collectons les données suivantes :</p>
        <ul>
          <li><strong>Données d&apos;identification :</strong> nom, prénom, adresse email, numéro de téléphone</li>
          <li><strong>Données de localisation :</strong> ville, code postal</li>
          <li><strong>Données relatives aux chats :</strong> race, date de naissance, numéros d&apos;identification LOOF, pedigree</li>
          <li><strong>Données de connexion :</strong> identifiants, cookies de session</li>
        </ul>

        <h2>Finalités du traitement</h2>
        <p>Ces données sont utilisées exclusivement pour :</p>
        <ul>
          <li>La gestion des adhésions et des comptes membres</li>
          <li>L&apos;organisation et la gestion des inscriptions aux expositions félines</li>
          <li>La communication associative (actualités, événements)</li>
          <li>Le respect des obligations réglementaires liées au LOOF</li>
        </ul>

        <h2>Base légale</h2>
        <p>
          Le traitement des données repose sur le consentement de la personne concernée
          lors de son inscription, ainsi que sur l&apos;exécution du contrat d&apos;adhésion
          à l&apos;association.
        </p>

        <h2>Destinataires des données</h2>
        <p>
          Les données personnelles ne sont pas transmises à des tiers commerciaux.
          Elles peuvent être communiquées au LOOF dans le cadre des expositions
          officielles, conformément à la réglementation en vigueur.
        </p>

        <h2>Durée de conservation</h2>
        <ul>
          <li><strong>Données des membres actifs :</strong> pendant la durée de l&apos;adhésion</li>
          <li><strong>Données après résiliation :</strong> 3 ans après la fin de l&apos;adhésion</li>
          <li><strong>Données d&apos;inscription aux expositions :</strong> 5 ans (obligations comptables)</li>
        </ul>

        <h2>Vos droits</h2>
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD),
          vous disposez des droits suivants :
        </p>
        <ul>
          <li><strong>Droit d&apos;accès :</strong> obtenir la communication de vos données</li>
          <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
          <li><strong>Droit de suppression :</strong> demander l&apos;effacement de vos données</li>
          <li><strong>Droit de portabilité :</strong> recevoir vos données dans un format structuré</li>
          <li><strong>Droit d&apos;opposition :</strong> vous opposer au traitement de vos données</li>
        </ul>
        <p>
          Pour exercer ces droits, contactez-nous à :{' '}
          <a href="mailto:contact@assocsf.fr">contact@assocsf.fr</a>
        </p>

        <h2>Cookies</h2>
        <p>
          Ce site utilise uniquement des cookies strictement nécessaires au fonctionnement
          du service (authentification, gestion de session). Aucun cookie de traçage,
          de publicité ou d&apos;analyse n&apos;est utilisé.
        </p>

        <h2>Sécurité</h2>
        <p>
          Nous mettons en œuvre les mesures techniques et organisationnelles appropriées
          pour protéger vos données personnelles contre tout accès non autorisé,
          modification, divulgation ou destruction.
        </p>
      </div>
    </div>
  )
}
