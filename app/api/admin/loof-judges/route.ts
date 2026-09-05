import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

type LoofJudge = {
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

function extractFieldText(html: string, fieldClass: string): string | null {
  const re = new RegExp(`${fieldClass}[^"]*"[^>]*>([^<]+)<`)
  const m = html.match(re)
  return m ? m[1].trim() : null
}

function parseJudges(html: string): LoofJudge[] {
  // Cut at JUGES HONORAIRES section (they appear in component-simple-text after the view)
  const cutIdx = html.indexOf('JUGES HONORAIRES')
  const working = cutIdx > 0 ? html.slice(0, cutIdx) : html

  const rows = working.split('<div class="views-row">').slice(1)
  const judges: LoofJudge[] = []

  for (const row of rows) {
    const firstName = extractFieldText(row, 'field--name-field-judge-first-name')
    const lastName = extractFieldText(row, 'field--name-field-judge-last-name')
    if (!firstName || !lastName) continue

    // Photo URL (first img in judge block)
    const photoMatch = row.match(/<img[^>]+src="([^"]+)"/)
    const photoUrl = photoMatch ? `https://loof.asso.fr${photoMatch[1]}` : null

    // Region
    const region = extractFieldText(row, 'field--name-field-judge-region')

    // Role: extract text from role formatted field
    const roleMatch = row.match(/field--name-field-judge-role-formatted[^>]*>([\s\S]*?)<\/div>/)
    const role = roleMatch ? roleMatch[1].replace(/<[^>]*>/g, '').trim() : null

    // Breeds: text after "Races" span inside .block
    const breedsMatch = row.match(/<span class="ttl">Races<\/span>([\s\S]*?)<\/div>/)
    const breeds = breedsMatch
      ? breedsMatch[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
      : null

    judges.push({ firstName, lastName, photoUrl, region, breeds, role })
  }

  return judges
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
    const res = await fetch('https://loof.asso.fr/juges-felins-loof-0', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      },
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()
    const judges = parseJudges(html)
    cache = { data: judges, ts: Date.now() }
    return NextResponse.json(judges)
  } catch {
    // Return cached data even if stale on error
    if (cache) return NextResponse.json(cache.data)
    return NextResponse.json({ error: 'Impossible de récupérer les juges LOOF' }, { status: 502 })
  }
}
