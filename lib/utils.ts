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

export function computeBasePrice(
  catCount: number,
  tiers: { minCats: number; pricePerCat: number }[],
  fallback: number
): number {
  if (tiers.length === 0) return fallback
  const sorted = [...tiers].sort((a, b) => b.minCats - a.minCats)
  return sorted.find((t) => catCount >= t.minCats)?.pricePerCat ?? fallback
}

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  PEDIGREE: 'Pedigree',
  ICAD: 'Carte I-CAD',
  VACCIN: 'Carnet de vaccinations',
  OTHER: 'Autre document',
}
