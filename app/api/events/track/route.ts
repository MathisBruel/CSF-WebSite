import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function sendToGoogleAnalytics(
  measurementId: string,
  apiSecret: string,
  clientId: string,
  eventName: string,
  eventData: Record<string, any>
) {
  const payload = {
    client_id: clientId,
    events: [
      {
        name: eventName,
        params: eventData,
      },
    ],
  }

  try {
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    )
    return response.ok
  } catch (error) {
    console.error('GA Measurement Protocol error:', error)
    return false
  }
}

export async function POST(req: NextRequest) {
  const { eventName, eventData, clientId } = await req.json()

  if (!eventName || !clientId) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  const gaConfig = await prisma.gAConfig.findFirst({
    where: { enabled: true },
  })

  if (!gaConfig?.measurementId || !gaConfig?.apiSecret) {
    return NextResponse.json(
      { error: 'GA4 not configured' },
      { status: 400 }
    )
  }

  const success = await sendToGoogleAnalytics(
    gaConfig.measurementId,
    gaConfig.apiSecret,
    clientId,
    eventName,
    eventData
  )

  return NextResponse.json({ success })
}
