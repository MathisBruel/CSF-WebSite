import { prisma } from '@/lib/prisma'
import { PricingForm } from '@/components/admin/PricingForm'

export const dynamic = 'force-dynamic'

export default async function AdminPricingPage() {
  const pricing = await prisma.pricing.findFirst()

  const initialData = pricing ?? {
    registrationOneDay: 40,
    registrationWeekend: 70,
    extraCageOneDay: 20,
    extraCageWeekend: 35,
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark">Tarifs</h1>
        <p className="text-csf-muted">Gestion des tarifs pour les expositions</p>
      </div>

      <PricingForm initialData={initialData} />
    </div>
  )
}
