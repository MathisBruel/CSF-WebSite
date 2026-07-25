import { prisma } from '@/lib/prisma'
import { NewsletterForm } from '@/components/admin/NewsletterForm'

export const dynamic = 'force-dynamic'

export default async function AdminNewsletterPage() {
  const subscriberCount = await prisma.user.count({ where: { newsletterSubscribed: true } })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark">Newsletter</h1>
        <p className="text-csf-muted">{subscriberCount} abonné{subscriberCount !== 1 ? 's' : ''}</p>
      </div>

      <NewsletterForm />
    </div>
  )
}
