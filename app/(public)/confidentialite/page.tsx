import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Politique de confidentialité' }

export default function Confidentialite() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold font-serif text-csf-dark mb-6">Politique de confidentialité</h1>
      <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-csf-dark">
        <h2>Données collectées</h2>
        <p>
          Nous collectons : nom, prénom, adresse email, numéro de téléphone, ville, code postal,
          et les informations relatives à vos chats (race, date de naissance, numéros d&apos;identification).
        </p>
        <h2>Utilisation</h2>
        <p>
          Ces données sont utilisées exclusivement pour la gestion des adhésions,
          l&apos;organisation des expositions et la communication associative.
        </p>
        <h2>Conservation</h2>
        <p>Les données sont conservées pendant la durée d&apos;adhésion au club + 3 ans.</p>
        <h2>Vos droits</h2>
        <p>
          Vous pouvez exercer vos droits d&apos;accès, rectification, suppression en contactant :{' '}
          contact@chats-sans-frontieres.fr
        </p>
      </div>
    </div>
  )
}
