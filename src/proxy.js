import { NextResponse } from 'next/server'

export function proxy(request) {
  const session = request.cookies.get('cp_session')
  const isAuthenticated = session?.value === 'authenticated'
  const { pathname } = request.nextUrl

  if (!isAuthenticated && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
