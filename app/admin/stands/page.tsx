import { prisma } from '@/lib/prisma'
import { StandsGlobalSettings } from '@/components/admin/StandsGlobalSettings'

export const dynamic = 'force-dynamic'

export default async function AdminStandsPage() {
  const [emailConfig, phoneConfig, contractConfig] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { key: 'standContactEmail' } }),
    prisma.siteConfig.findUnique({ where: { key: 'standContactPhone' } }),
    prisma.siteConfig.findUnique({ where: { key: 'standContractUrl' } }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif text-csf-dark">Location de stands</h1>
        <p className="text-csf-muted mt-1">Gérez les paramètres globaux de la location de stands</p>
      </div>

      <StandsGlobalSettings
        initialContactEmail={emailConfig?.value}
        initialContactPhone={phoneConfig?.value}
        initialContractUrl={contractConfig?.value}
      />
    </div>
  )
}
