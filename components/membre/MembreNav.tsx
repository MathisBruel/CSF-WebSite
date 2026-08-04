'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/membre/dashboard', icon: HomeIcon, label: 'Tableau de bord' },
  { href: '/membre/chats', icon: CatIcon, label: 'Mes chats' },
  { href: '/membre/inscriptions', icon: TicketIcon, label: 'Mes inscriptions' },
  { href: '/membre/profil', icon: UserIcon, label: 'Mon profil' },
]

function getUserStatusLabel(role: string, membershipActive?: boolean) {
  if (role === 'ADMIN') return 'Administrateur'
  if (role === 'MEMBRE_ACTIF') return 'Membre Actif'
  if (membershipActive) return 'Adhérent Club'
  return 'Non-adhérent'
}

export function MembreNav({ user }: { user: { name: string; role: string; membershipActive?: boolean } }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
    {/* Mobile top bar */}
    <div className="lg:hidden sticky top-0 z-50 bg-csf-dark text-white w-full border-b border-white/10 shadow-md">
      <div className="flex items-center justify-between px-4 h-14">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-7 h-7 flex-shrink-0">
            <Image src="/images/logo-circle.png" alt="CSF" fill className="object-contain" sizes="28px" />
          </div>
          <span className="text-sm font-medium text-csf-light">Espace membre</span>
        </Link>
        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div className="bg-csf-darker border-t border-white/10 px-4 pb-4 pt-3 space-y-1 shadow-xl">
          <div className="flex items-center gap-3 p-3 mb-2 bg-white/5 rounded-lg border border-white/10">
            <div className="w-8 h-8 rounded-full bg-csf-orange flex items-center justify-center text-sm font-bold flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-csf-light/60 truncate">{getUserStatusLabel(user.role, user.membershipActive)}</p>
            </div>
          </div>
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active ? 'bg-csf-orange text-white' : 'text-csf-light/80 hover:bg-white/10 hover:text-white'
                }`}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </Link>
            )
          })}
          {user.role === 'ADMIN' && (
            <>
              <div className="border-t border-white/10 my-2" />
              <Link href="/admin" onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname.startsWith('/admin') ? 'bg-csf-orange text-white' : 'text-csf-orange/80 hover:bg-white/10 hover:text-csf-orange'
                }`}>
                <ShieldIcon className="w-5 h-5 flex-shrink-0" />
                Administration
              </Link>
            </>
          )}
          <div className="border-t border-white/10 my-2" />
          <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-csf-light/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Retour au site
          </Link>
          <button onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 rounded-lg hover:bg-red-900/20 transition-colors">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </button>
        </div>
      )}
    </div>

    <aside className="w-64 bg-csf-dark text-white flex-shrink-0 hidden lg:flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 mb-4">
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image src="/images/logo-circle.png" alt="CSF" fill className="object-contain" sizes="32px" />
          </div>
          <span className="text-sm font-medium text-csf-light">Espace membre</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-csf-orange flex items-center justify-center text-sm font-bold flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-csf-light/60 truncate">{getUserStatusLabel(user.role, user.membershipActive)}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active ? 'bg-csf-orange text-white' : 'text-csf-light/80 hover:bg-white/10 hover:text-white'
              }`}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          )
        })}

        {user.role === 'ADMIN' && (
          <>
            <div className="border-t border-white/10 my-2" />
            <Link href="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                pathname.startsWith('/admin') ? 'bg-csf-orange text-white' : 'text-csf-orange/80 hover:bg-white/10 hover:text-csf-orange'
              }`}>
              <ShieldIcon className="w-5 h-5 flex-shrink-0" />
              Administration
            </Link>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm text-csf-light/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors mb-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Retour au site
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 rounded-lg hover:bg-red-900/20 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>
    </>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
}
function CatIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}
function TicketIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
}
function UserIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
}
function ShieldIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
}
