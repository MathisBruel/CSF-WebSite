import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatDate(date: Date | string, fmt = 'd MMMM yyyy'): string {
  return format(new Date(date), fmt, { locale: fr })
}

export function formatDateShort(date: Date | string): string {
  return format(new Date(date), 'dd/MM/yyyy', { locale: fr })
}

export function formatDatetime(date: Date | string): string {
  return format(new Date(date), "d MMMM yyyy 'à' HH'h'mm", { locale: fr })
}

export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { locale: fr, addSuffix: true })
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  MEMBRE_ACTIF: 'Membre Actif',
  ADHERENT_CLUB: 'Adhérent Club',
}

export const EXHIBITION_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  OPEN: 'Inscriptions ouvertes',
  CLOSED: 'Inscriptions fermées',
  CANCELLED: 'Annulée',
  ARCHIVED: 'Archivée',
}

export const REGISTRATION_STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  VALIDATED: 'Validée',
  REJECTED: 'Refusée',
  WAITING_DOCS: 'Documents manquants',
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  PAID: 'Payé',
  REFUNDED: 'Remboursé',
}

export type GlobalPricing = {
  registrationFee: number
  memberOneDayCat12: number
  memberOneDayCat3Plus: number
  memberOneDayHouseCat: number
  memberTwoDayCat12: number
  memberTwoDayCat3Plus: number
  memberTwoDayHouseCat: number
  memberConformite: number
  memberDiploma: number
  nonMemberOneDayCat12: number
  nonMemberOneDayCat3Plus: number
  nonMemberOneDayHouseCat: number
  nonMemberTwoDayCat12: number
  nonMemberTwoDayCat3Plus: number
  nonMemberTwoDayHouseCat: number
  nonMemberConformite: number
  nonMemberDiploma: number
  membershipFee: number
  cageDeposit: number
}

export const DEFAULT_PRICING: GlobalPricing = {
  registrationFee: 5,
  memberOneDayCat12: 36,
  memberOneDayCat3Plus: 31,
  memberOneDayHouseCat: 30,
  memberTwoDayCat12: 46,
  memberTwoDayCat3Plus: 41,
  memberTwoDayHouseCat: 35,
  memberConformite: 10,
  memberDiploma: 0,
  nonMemberOneDayCat12: 42,
  nonMemberOneDayCat3Plus: 36,
  nonMemberOneDayHouseCat: 30,
  nonMemberTwoDayCat12: 51,
  nonMemberTwoDayCat3Plus: 46,
  nonMemberTwoDayHouseCat: 35,
  nonMemberConformite: 15,
  nonMemberDiploma: 10,
  membershipFee: 25,
  cageDeposit: 100,
}

export function computeCatPrice(
  position: number,
  participationDays: string[],
  isHouseCat: boolean,
  wantsComplianceExam: boolean,
  wantsDiploma: boolean,
  isMember: boolean,
  pricing: GlobalPricing,
  isConformityOnly: boolean = false
): number {
  if (isConformityOnly) {
    const conformite = isMember ? pricing.memberConformite : pricing.nonMemberConformite
    const diploma = wantsDiploma ? (isMember ? pricing.memberDiploma : pricing.nonMemberDiploma) : 0
    return conformite + diploma
  }

  const twoDay = participationDays.length >= 2
  let base: number
  if (isHouseCat) {
    base = isMember
      ? (twoDay ? pricing.memberTwoDayHouseCat : pricing.memberOneDayHouseCat)
      : (twoDay ? pricing.nonMemberTwoDayHouseCat : pricing.nonMemberOneDayHouseCat)
  } else if (position <= 2) {
    base = isMember
      ? (twoDay ? pricing.memberTwoDayCat12 : pricing.memberOneDayCat12)
      : (twoDay ? pricing.nonMemberTwoDayCat12 : pricing.nonMemberOneDayCat12)
  } else {
    base = isMember
      ? (twoDay ? pricing.memberTwoDayCat3Plus : pricing.memberOneDayCat3Plus)
      : (twoDay ? pricing.nonMemberTwoDayCat3Plus : pricing.nonMemberOneDayCat3Plus)
  }
  const conformite = wantsComplianceExam
    ? (isMember ? pricing.memberConformite : pricing.nonMemberConformite)
    : 0
  const diploma = wantsDiploma
    ? (isMember ? pricing.memberDiploma : pricing.nonMemberDiploma)
    : 0
  return base + conformite + diploma
}

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  PEDIGREE: 'Pedigree',
  ICAD: 'Carte I-CAD',
  VACCIN: 'Carnet de vaccinations',
  OTHER: 'Autre document',
}
