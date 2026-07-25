import Link from 'next/link'
import Image from 'next/image'
import { Logo } from '@/components/ui/Logo'

export function Footer() {
  return (
    <footer className="bg-csf-dark text-csf-light/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Logo className="mb-4 [&_p]:text-white [&_.text-csf-dark]:text-white [&_.text-csf-muted]:text-csf-light/60" />
            <p className="text-sm leading-relaxed text-csf-light/70 max-w-sm">
              Association féline dédiée à l&apos;organisation d&apos;expositions félines,
              au regroupement d&apos;éleveurs et de passionnés, et à la promotion de l&apos;élevage éthique.
              Fondée en 2005.
            </p>
            <div className="flex gap-4 mt-4">
              {/* Facebook — lien à mettre à jour quand le compte sera créé */}
              <a href="https://facebook.com/chatsansfrontieres" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-csf-orange transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* Instagram — lien à mettre à jour quand le compte sera créé */}
              <a href="https://instagram.com/chatsansfrontieres" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-csf-orange transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-csf-light/50 mb-2">Affiliation</p>
              <a
                href="https://www.loof.asso.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md bg-white px-3 py-2 transition-transform hover:scale-[1.02]"
                aria-label="LOOF - Livre Officiel des Origines Félines"
              >
                <Image
                  src="/images/loof_logo.jpg"
                  alt="Logo LOOF"
                  width={132}
                  height={48}
                  className="h-10 w-auto object-contain"
                />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/actualites', label: 'Actualités' },
                { href: '/expositions', label: 'Expositions' },
                { href: '/equipe', label: 'L\'Équipe' },
                { href: '/documents', label: 'Documents' },
                { href: '/contact', label: 'Contact' },
                { href: '/register', label: 'Adhérer au club' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-csf-orange transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-csf-orange flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:contact@assocsf.fr" className="hover:text-csf-orange transition-colors">
                  contact@assocsf.fr
                </a>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-csf-orange flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <a href="https://assocsf.fr" className="hover:text-csf-orange transition-colors">
                  assocsf.fr
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-csf-light/50">
          <p>© {new Date().getFullYear()} Chats Sans Frontières. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-csf-orange transition-colors">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-csf-orange transition-colors">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
