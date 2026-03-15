import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verify JWT token
  const token = request.cookies.get('accessToken')?.value;
  
  const isPublicRoute = (pathname: string) => {
    return ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/api/auth/login', '/api/auth/signup', '/api/auth/logout', '/api/submissions/submit'].some(route => pathname.startsWith(route));
  };

  if (!token && !isPublicRoute(request.nextUrl.pathname) && !request.nextUrl.pathname.startsWith('/_next') && request.nextUrl.pathname !== '/favicon.ico') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)',
  ],
};
