import { prisma } from '@/lib/prisma'
import { PricingForm } from '@/components/admin/PricingForm'
import { DEFAULT_PRICING } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminPricingPage() {
  const pricing = await prisma.pricing.findFirst()
  const initialData = pricing
    ? {
        registrationFee: pricing.registrationFee,
        memberOneDayCat12: pricing.memberOneDayCat12,
        memberOneDayCat3Plus: pricing.memberOneDayCat3Plus,
        memberOneDayHouseCat: pricing.memberOneDayHouseCat,
        memberTwoDayCat12: pricing.memberTwoDayCat12,
        memberTwoDayCat3Plus: pricing.memberTwoDayCat3Plus,
        memberTwoDayHouseCat: pricing.memberTwoDayHouseCat,
        memberConformite: pricing.memberConformite,
        memberDiploma: pricing.memberDiploma,
        nonMemberOneDayCat12: pricing.nonMemberOneDayCat12,
        nonMemberOneDayCat3Plus: pricing.nonMemberOneDayCat3Plus,
        nonMemberOneDayHouseCat: pricing.nonMemberOneDayHouseCat,
        nonMemberTwoDayCat12: pricing.nonMemberTwoDayCat12,
        nonMemberTwoDayCat3Plus: pricing.nonMemberTwoDayCat3Plus,
        nonMemberTwoDayHouseCat: pricing.nonMemberTwoDayHouseCat,
        nonMemberConformite: pricing.nonMemberConformite,
        nonMemberDiploma: pricing.nonMemberDiploma,
        membershipFee: pricing.membershipFee,
        cageDeposit: pricing.cageDeposit,
      }
    : DEFAULT_PRICING

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark">Tarifs</h1>
        <p className="text-csf-muted">Tarifs globaux appliqués à toutes les expositions</p>
      </div>

      <PricingForm initialData={initialData} />
    </div>
  )
}
