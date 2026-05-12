'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Logo } from '@/components/ui/Logo'

const navLinks = [
  { href: '/actualites', label: 'Actualités' },
  { href: '/expositions', label: 'Expositions' },
  { href: '/equipe', label: 'L\'Équipe' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <nav className="bg-csf-dark text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo className="[&_p]:text-white [&_.text-csf-dark]:text-white [&_.text-csf-muted]:text-csf-light/70" />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href}
                className="text-csf-light/90 hover:text-csf-orange transition-colors text-sm font-medium">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Auth / CTA */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm">
                  <div className="w-7 h-7 rounded-full bg-csf-orange flex items-center justify-center text-xs font-bold">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-csf-light">{session.user.name?.split(' ')[0]}</span>
                  <svg className="w-4 h-4 text-csf-light/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-csf-light/40 py-1 z-50"
                    onMouseLeave={() => setUserMenuOpen(false)}>
                    <Link href="/membre/dashboard" className="block px-4 py-2 text-sm text-csf-dark hover:bg-csf-cream transition-colors">
                      Mon espace
                    </Link>
                    <Link href="/membre/chats" className="block px-4 py-2 text-sm text-csf-dark hover:bg-csf-cream transition-colors">
                      Mes chats
                    </Link>
                    <Link href="/membre/inscriptions" className="block px-4 py-2 text-sm text-csf-dark hover:bg-csf-cream transition-colors">
                      Mes inscriptions
                    </Link>
                    <Link href="/membre/profil" className="block px-4 py-2 text-sm text-csf-dark hover:bg-csf-cream transition-colors">
                      Mon profil
                    </Link>
                    {(session.user.role === 'ADMIN') && (
                      <>
                        <div className="border-t border-csf-light my-1" />
                        <Link href="/admin" className="block px-4 py-2 text-sm text-csf-orange font-medium hover:bg-csf-cream transition-colors">
                          Administration
                        </Link>
                      </>
                    )}
                    <div className="border-t border-csf-light my-1" />
                    <button onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-csf-light/90 hover:text-white text-sm font-medium transition-colors">
                  Connexion
                </Link>
                <Link href="/register"
                  className="px-4 py-2 bg-csf-orange hover:bg-csf-orange-dark text-white text-sm font-semibold rounded-lg transition-colors">
                  Adhérer
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-csf-darker border-t border-white/10 px-4 pb-4 pt-2 space-y-1">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href}
              className="block py-2 px-3 text-csf-light hover:text-csf-orange rounded-lg transition-colors"
              onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="border-t border-white/10 pt-3 mt-2 space-y-2">
            {session ? (
              <>
                <Link href="/membre/dashboard" className="block py-2 px-3 text-csf-light hover:text-csf-orange transition-colors"
                  onClick={() => setMenuOpen(false)}>
                  Mon espace
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin" className="block py-2 px-3 text-csf-orange font-medium"
                    onClick={() => setMenuOpen(false)}>
                    Administration
                  </Link>
                )}
                <button onClick={() => signOut({ callbackUrl: '/' })}
                  className="block w-full text-left py-2 px-3 text-red-400">
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2 px-3 text-csf-light" onClick={() => setMenuOpen(false)}>
                  Connexion
                </Link>
                <Link href="/register"
                  className="block py-2 px-3 bg-csf-orange text-white rounded-lg text-center font-medium"
                  onClick={() => setMenuOpen(false)}>
                  Adhérer
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
