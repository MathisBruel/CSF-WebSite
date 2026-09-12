import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { getGoogleAuthUrl } from '@/lib/ga-oauth'

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = getGoogleAuthUrl()
  return NextResponse.json({ url })
}
