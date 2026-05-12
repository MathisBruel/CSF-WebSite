import type { Metadata } from 'next'
import { Lora, Lato } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/ui/SessionProvider'
import { auth } from '@/lib/auth'

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-lato',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Chats Sans Frontières',
    default: 'Chats Sans Frontières — Association Féline',
  },
  description: "Association féline dédiée à l'organisation d'expositions félines, au regroupement d'éleveurs et de passionnés, et à la promotion de l'élevage éthique. Fondée en 2005.",
  icons: { icon: '/images/logo-icon.png' },
  metadataBase: new URL('https://assocsf.fr'),
  openGraph: {
    title: 'Chats Sans Frontières',
    description: 'Association féline — Expositions, élevage éthique et passion du chat',
    url: 'https://assocsf.fr',
    siteName: 'Chats Sans Frontières',
    locale: 'fr_FR',
    type: 'website',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <html lang="fr" className={`${lora.variable} ${lato.variable}`}>
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
