import { auth } from '@/lib/auth'
import { GoogleAnalyticsConfig } from '@/components/admin/GoogleAnalyticsConfig'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/admin')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark">Google Analytics 4</h1>
        <p className="text-csf-muted">Configurez Google Analytics pour suivre les statistiques du site</p>
      </div>

      <GoogleAnalyticsConfig />
    </div>
  )
}
