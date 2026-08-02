import { prisma } from './prisma'

export type MemberStatus = 'none' | 'pending' | 'active' | 'admin'

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  none: 'Pas adhérent',
  pending: 'En attente de validation',
  active: 'Adhérent',
  admin: 'Administrateur',
}

export function deriveMemberStatus(member: { role: string; membershipActive: boolean; hasPendingRequest: boolean }): MemberStatus {
  if (member.role === 'ADMIN') return 'admin'
  if (member.membershipActive) return 'active'
  if (member.hasPendingRequest) return 'pending'
  return 'none'
}

export async function getMembershipPaymentConfig() {
  const configs = await prisma.siteConfig.findMany({
    where: {
      key: {
        in: ['membership_price', 'membership_rib_iban', 'membership_rib_bic', 'membership_rib_holder', 'membership_paypal_link'],
      },
    },
  })
  const cfg = Object.fromEntries(configs.map((c) => [c.key, c.value]))
  return {
    price: cfg['membership_price'] || '?',
    iban: cfg['membership_rib_iban'] || 'Non configuré',
    bic: cfg['membership_rib_bic'] || 'Non configuré',
    holder: cfg['membership_rib_holder'] || 'Non configuré',
    paypalLink: cfg['membership_paypal_link'] || '',
  }
}
