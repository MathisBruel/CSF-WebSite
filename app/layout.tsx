import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/components/ui/SessionProvider'
import { auth } from '@/lib/auth'

export const metadata: Metadata = {
  title: {
    template: '%s | Chats Sans Frontières',
    default: 'Chats Sans Frontières — Association Féline',
  },
  description: 'Association féline reconnue, organisatrice d\'expositions nationales depuis 1982.',
  icons: { icon: '/images/logo-icon.png' },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <html lang="fr">
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
