import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Protect /membre/* routes
  if (pathname.startsWith('/membre')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, req.url))
    }
  }

  // Protect /admin/* routes
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (req.auth?.user?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/membre/dashboard', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/membre/:path*', '/admin/:path*'],
}
