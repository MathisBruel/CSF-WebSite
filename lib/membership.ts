import { prisma } from './prisma'

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
