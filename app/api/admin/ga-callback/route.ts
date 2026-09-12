import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTokensFromCode } from '@/lib/ga-oauth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin/ga?error=unauthorized`)
  }

  const code = req.nextUrl.searchParams.get('code')
  const error = req.nextUrl.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/admin/analytics?error=${encodeURIComponent(error)}`
    )
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin/analytics?error=no_code`)
  }

  try {
    const tokens = await getTokensFromCode(code)

    let config = await prisma.gAConfig.findFirst()
    if (!config) {
      config = await prisma.gAConfig.create({
        data: {
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token,
          tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        },
      })
    } else {
      await prisma.gAConfig.update({
        where: { id: config.id },
        data: {
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token,
          tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        },
      })
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin/analytics?success=true`)
  } catch (error) {
    console.error('GA OAuth error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/admin/analytics?error=oauth_failed`)
  }
}
