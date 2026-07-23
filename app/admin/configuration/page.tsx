import { prisma } from '@/lib/prisma'
import { AdminConfigForm } from '@/components/admin/AdminConfigForm'

export const dynamic = 'force-dynamic'

const KEYS = [
  'membership_price',
  'membership_rib_iban',
  'membership_rib_bic',
  'membership_rib_holder',
  'membership_paypal_link',
]

export default async function AdminConfigPage() {
  const rows = await prisma.siteConfig.findMany({ where: { key: { in: KEYS } } })
  const config = Object.fromEntries(rows.map((r) => [r.key, r.value]))

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark">Configuration</h1>
        <p className="text-csf-muted">Paramètres d&apos;adhésion et de paiement</p>
      </div>

      <AdminConfigForm config={config} />
    </div>
  )
}
