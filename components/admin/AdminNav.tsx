'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/admin', label: 'Tableau de bord', exact: true },
  { href: '/admin/membres', label: 'Membres', badge: 'members' },
  { href: '/admin/expositions', label: 'Expositions' },
  { href: '/admin/inscriptions', label: 'Inscriptions' },
  { href: '/admin/contenu', label: 'Contenu' },
  { href: '/admin/documents', label: 'Documents' },
  { href: '/admin/newsletter', label: 'Newsletter' },
  { href: '/admin/configuration', label: 'Configuration' },
]

export function AdminNav({ pendingMembershipRequests = 0 }: { pendingMembershipRequests?: number }) {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-csf-darker text-white flex-shrink-0 hidden lg:flex flex-col">
      <div className="p-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 mb-1">
          <div className="relative w-7 h-7 flex-shrink-0">
            <Image src="/images/logo-circle.png" alt="CSF" fill className="object-contain" sizes="28px" />
          </div>
          <span className="text-sm font-semibold text-white">Administration</span>
        </Link>
        <p className="text-xs text-csf-light/40">Chats Sans Frontières</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, label, exact, badge }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          const count = badge === 'members' ? pendingMembershipRequests : 0
          return (
            <Link key={href} href={href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                active ? 'bg-csf-orange text-white' : 'text-csf-light/70 hover:bg-white/10 hover:text-white'
              }`}>
              <span>{label}</span>
              {count > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                  active ? 'bg-white/25 text-white' : 'bg-csf-orange text-white'
                }`}>
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <Link href="/membre/dashboard"
          className="flex items-center px-3 py-2 text-sm text-csf-light/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
          Espace membre
        </Link>
        <Link href="/"
          className="flex items-center px-3 py-2 text-sm text-csf-light/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
          Site public
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:text-red-300 rounded-lg hover:bg-red-900/20 transition-colors">
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
