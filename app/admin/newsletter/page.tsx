import { prisma } from '@/lib/prisma'
import { NewsletterForm } from '@/components/admin/NewsletterForm'

export const dynamic = 'force-dynamic'

export default async function AdminNewsletterPage() {
  const [subscriberCount, exhibitions] = await Promise.all([
    prisma.user.count({ where: { newsletterSubscribed: true } }),
    prisma.exhibition.findMany({
      where: { status: { notIn: ['DRAFT', 'CANCELLED'] } },
      select: { id: true, title: true, startDate: true, city: true },
      orderBy: { startDate: 'desc' },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark">Newsletter</h1>
        <p className="text-csf-muted">{subscriberCount} abonné{subscriberCount !== 1 ? 's' : ''}</p>
      </div>

      <NewsletterForm exhibitions={exhibitions} />
    </div>
  )
}
