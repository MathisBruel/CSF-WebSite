import type { Metadata } from 'next'
import { ContactForm } from '@/components/public/ContactForm'

export const metadata: Metadata = { title: 'Contact' }

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="section-title">Nous Contacter</h1>
        <p className="section-subtitle">Une question ? Nous vous répondrons dans les plus brefs délais</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Info */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="font-bold text-csf-dark mb-4">Coordonnées</h2>
            <ul className="space-y-4 text-sm text-csf-muted">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-csf-orange mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>12 Rue des Félins<br />69001 Lyon, France</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-csf-orange flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:contact@chats-sans-frontieres.fr" className="hover:text-csf-orange transition-colors">
                  contact@chats-sans-frontieres.fr
                </a>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-csf-orange flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                04 72 00 00 00
              </li>
            </ul>
          </div>

          <div className="card">
            <h2 className="font-bold text-csf-dark mb-3">Heures d&apos;ouverture</h2>
            <ul className="space-y-1 text-sm text-csf-muted">
              <li className="flex justify-between">
                <span>Lundi – Vendredi</span><span className="font-medium">9h00 – 18h00</span>
              </li>
              <li className="flex justify-between">
                <span>Samedi</span><span className="font-medium">10h00 – 14h00</span>
              </li>
              <li className="flex justify-between text-csf-muted/60">
                <span>Dimanche</span><span>Fermé</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <ContactForm />
      </div>
    </div>
  )
}
