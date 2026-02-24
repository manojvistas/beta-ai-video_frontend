import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // 1. Root Redirect (formerly in proxy.ts)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/notebooks', request.url))
  }

  // 2. API Proxy logic
  // This replaces the static rewrites in next.config.ts to allow dynamic runtime configuration
  if (pathname.startsWith('/api/')) {
    // Determine backend URL from environment or default
    let internalApiUrl = process.env.INTERNAL_API_URL || 'http://localhost:15055'

    // Route /api/auth/* to the Auth API container if configured
    if (pathname.startsWith('/api/auth/')) {
      internalApiUrl = process.env.INTERNAL_AUTH_API_URL || 'http://auth-api:4000'
    }
    
    // Construct target URL
    // internalApiUrl should be like "http://backend:15055" or "http://auth-api:4000"
    // pathname preserves the "/api/..." prefix
    const targetUrlStr = `${internalApiUrl.replace(/\/$/, '')}${pathname}${search}`
    const targetUrl = new URL(targetUrlStr)

    // Log for debugging (visible in container logs)
    console.log(`[Middleware] Proxying ${pathname} to ${targetUrl}`)
    
    // Rewrite the request to the backend
    return NextResponse.rewrite(targetUrl)
  }

  return NextResponse.next()
}

// Configure which paths invoke the middleware
export const config = {
  matcher: [
    '/',
    '/api/:path*',
  ],
}
