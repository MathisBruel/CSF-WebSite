import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { MembreNav } from '@/components/membre/MembreNav'

export default async function MembreLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <MembreNav user={session.user} />
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
