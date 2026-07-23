import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Contact' }

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="section-title">Nous Contacter</h1>
        <p className="section-subtitle">N&apos;hésitez pas à nous écrire, nous vous répondrons dans les plus brefs délais</p>
      </div>

      <div className="space-y-6">
        <div className="card">
          <h2 className="font-bold text-csf-dark mb-4">Coordonnées</h2>
          <ul className="space-y-4 text-sm text-csf-muted">
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-csf-orange flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href="mailto:contact@assocsf.fr" className="hover:text-csf-orange transition-colors text-base font-medium text-csf-dark">
                contact@assocsf.fr
              </a>
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-csf-orange flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <a href="https://assocsf.fr" className="hover:text-csf-orange transition-colors">
                assocsf.fr
              </a>
            </li>
          </ul>
        </div>

        <div className="card">
          <h2 className="font-bold text-csf-dark mb-3">À propos</h2>
          <p className="text-sm text-csf-muted leading-relaxed">
            Chats Sans Frontières est une association féline dédiée à l&apos;organisation
            d&apos;expositions félines et à la promotion de l&apos;élevage éthique.
            Fondée en 2005, réactivée en 2026.
          </p>
        </div>

        <div className="card">
          <h2 className="font-bold text-csf-dark mb-3">Documents officiels</h2>
          <p className="text-sm text-csf-muted leading-relaxed">
            Retrouvez nos statuts, règlement intérieur et règlement des expositions
            dans la section Documents de l&apos;espace membre.
          </p>
        </div>
      </div>
    </div>
  )
}
