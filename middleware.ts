import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { SecurityMiddleware } from './lib/security'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create response
  const response = NextResponse.next()

  // Apply security headers to all responses
  SecurityMiddleware.addSecurityHeaders(response)

  // Handle CORS for API routes
  if (pathname.startsWith('/api/')) {
    SecurityMiddleware.handleCORS(request, response)
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers })
    }
  }

  // Protect API routes (except auth and webhooks)
  if (pathname.startsWith('/api/') && 
      !pathname.startsWith('/api/auth/') && 
      !pathname.startsWith('/api/webhooks/') &&
      !pathname.startsWith('/api/cron/')) {
    
    const token = await getToken({ req: request })
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers: response.headers }
      )
    }
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/platforms') || 
      pathname.startsWith('/content') ||
      pathname.startsWith('/settings')) {
    
    const token = await getToken({ req: request })
    
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirect root to dashboard if authenticated
  if (pathname === '/') {
    const token = await getToken({ req: request })
    
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
