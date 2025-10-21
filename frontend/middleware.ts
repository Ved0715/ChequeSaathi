import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Smart Middleware - Auto-detects same-domain vs cross-domain auth
 *
 * Same-domain (localhost OR same Railway/Vercel domain):
 *   - Uses server-side cookie checks in middleware
 *   - Provides protection before page loads
 *
 * Cross-domain (Different subdomains/domains):
 *   - Skips middleware cookie checks (can't read cross-domain cookies)
 *   - Uses client-side protection via AuthContext + Protected Layout
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Detect if backend is on a different domain/subdomain
  let isCrossDomain = false;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

    if (!apiUrl || apiUrl.startsWith('/')) {
      // No API URL or relative path = same domain
      isCrossDomain = false;
    } else {
      // Extract hostnames (without port)
      const apiHostname = new URL(apiUrl).hostname;
      const currentHost = request.headers.get('host') || '';
      const currentHostname = currentHost.split(':')[0];

      // Different hostnames = cross-domain
      isCrossDomain = apiHostname !== currentHostname;
    }
  } catch (error) {
    // URL parsing failed - assume same domain (safer default)
    isCrossDomain = false;
  }

  // Cross-domain: Skip middleware checks, rely on client-side auth
  if (isCrossDomain) {
    return NextResponse.next();
  }

  // Same-domain: Use original middleware logic with cookie checks
  const token = request.cookies.get('token');

  // Public routes - always accessible
  const publicRoutes = ['/', '/about', '/features', '/contact'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Auth routes - redirect to dashboard if already logged in
  const authRoutes = ['/login', '/register'];
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes - redirect to login if not authenticated
  const protectedRoutes = ['/dashboard', '/customers', '/cheques', '/transactions'];
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
