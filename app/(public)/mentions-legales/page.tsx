import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mentions légales' }

export default function MentionsLegales() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold font-serif text-csf-dark mb-6">Mentions légales</h1>
      <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-csf-dark">
        <h2>Éditeur</h2>
        <p>Association Chats Sans Frontières — Loi 1901<br />
        12 Rue des Félins, 69001 Lyon<br />
        contact@chats-sans-frontieres.fr</p>
        <h2>Hébergement</h2>
        <p>Application auto-hébergée via Docker.</p>
        <h2>Protection des données</h2>
        <p>Les données personnelles collectées sont uniquement utilisées dans le cadre de la gestion des adhésions et inscriptions aux expositions. Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données.</p>
      </div>
    </div>
  )
}
