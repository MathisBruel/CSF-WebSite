import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { trackEventToGA } from '@/lib/ga-events'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { eventName, eventData } = await req.json()

  if (!eventName) {
    return NextResponse.json(
      { error: 'Missing event name' },
      { status: 400 }
    )
  }

  await trackEventToGA(eventName, {
    ...eventData,
    user_id: session.user.id,
  })

  return NextResponse.json({ success: true })
}
