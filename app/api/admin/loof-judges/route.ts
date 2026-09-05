import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export type LoofJudge = {
  firstName: string
  lastName: string
  photoUrl: string | null
  region: string | null
  breeds: string | null
  role: string | null
}

// In-memory cache: 1 hour TTL
let cache: { data: LoofJudge[]; ts: number } | null = null
const CACHE_TTL = 60 * 60 * 1000

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'fr-FR,fr;q=0.9',
}

function extractFieldText(html: string, fieldClass: string): string | null {
  const re = new RegExp(`${fieldClass}[^"]*"[^>]*>([^<]+)<`)
  const m = html.match(re)
  return m ? m[1].trim() : null
}

/** Parse standard judge cards (.component-juges) from a page of HTML */
function parseJudgeCards(html: string): LoofJudge[] {
  const judges: LoofJudge[] = []
  const rows = html.split('<div class="views-row">').slice(1)

  for (const row of rows) {
    if (!row.includes('component-juges')) continue

    const firstName = extractFieldText(row, 'field--name-field-judge-first-name')
    const lastName = extractFieldText(row, 'field--name-field-judge-last-name')
    if (!firstName || !lastName) continue

    const photoMatch = row.match(/<img[^>]+src="([^"]+)"/)
    const photoUrl = photoMatch ? `https://loof.asso.fr${photoMatch[1]}` : null

    const region = extractFieldText(row, 'field--name-field-judge-region')

    const roleMatch = row.match(/field--name-field-judge-role-formatted[^>]*>([\s\S]*?)<\/div>/)
    const role = roleMatch ? roleMatch[1].replace(/<[^>]*>/g, '').trim() : null

    const breedsMatch = row.match(/<span class="ttl">Races<\/span>([\s\S]*?)<\/div>/)
    const breeds = breedsMatch
      ? breedsMatch[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
      : null

    judges.push({ firstName, lastName, photoUrl, region, breeds, role })
  }

  return judges
}

/** Parse trainee judges from "ÉLÈVES JUGES" text section */
function parseElevesJuges(html: string): LoofJudge[] {
  const judges: LoofJudge[] = []
  const idx = html.indexOf('ÉLÈVES JUGES')
  if (idx < 0) return judges

  // Take the next ~8000 chars which contains the eleves section
  const section = html.slice(idx, idx + 8000)
  const nameMatches = [...section.matchAll(/<strong>([^<]+)<\/strong>/g)]

  for (const m of nameMatches) {
    const fullName = m[1].trim()
    if (!fullName || fullName.startsWith('Parrain') || fullName.startsWith('Marraine')) continue

    const parts = fullName.trim().split(/\s+/)
    if (parts.length < 2) continue

    // Heuristic: last segment in ALL CAPS is the last name
    let splitIdx = parts.length - 1
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === parts[i].toUpperCase() && /[A-Z]/.test(parts[i])) {
        splitIdx = i
        break
      }
    }

    const firstName = parts.slice(0, splitIdx).join(' ')
    const lastName = parts.slice(splitIdx).join(' ')
    if (!firstName || !lastName) continue

    judges.push({ firstName, lastName, photoUrl: null, region: null, breeds: null, role: 'Élève-juge' })
  }

  return judges
}

async function fetchAllJudges(): Promise<LoofJudge[]> {
  const seen = new Set<string>()
  const all: LoofJudge[] = []

  // Paginate through ?page=0,1,2... until no new judges found
  for (let page = 0; page <= 20; page++) {
    const url = page === 0
      ? 'https://loof.asso.fr/juges-felins-loof-0'
      : `https://loof.asso.fr/juges-felins-loof-0?page=${page}`

    const res = await fetch(url, { headers: FETCH_HEADERS, cache: 'no-store' })
    if (!res.ok) break
    const html = await res.text()

    const cards = parseJudgeCards(html)
    let newCount = 0
    for (const j of cards) {
      const key = `${j.firstName}|${j.lastName}`
      if (!seen.has(key)) {
        seen.add(key)
        all.push(j)
        newCount++
      }
    }

    // Parse élèves only from page 0 (static section present on every page, avoid duplicates)
    if (page === 0) {
      for (const j of parseElevesJuges(html)) {
        const key = `${j.firstName}|${j.lastName}`
        if (!seen.has(key)) {
          seen.add(key)
          all.push(j)
        }
      }
    }

    if (newCount === 0) break
  }

  return all
}

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data)
  }

  try {
    const judges = await fetchAllJudges()
    cache = { data: judges, ts: Date.now() }
    return NextResponse.json(judges)
  } catch {
    if (cache) return NextResponse.json(cache.data)
    return NextResponse.json({ error: 'Impossible de récupérer les juges LOOF' }, { status: 502 })
  }
}
