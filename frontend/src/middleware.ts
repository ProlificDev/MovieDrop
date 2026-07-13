import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only gate the landing page; allow login page + assets.
  if (pathname === '/') {
    // Supabase auth in this app uses the Supabase access token (Bearer) via client.
    // We can only reliably detect auth server-side if a cookie exists.
    // If no cookie is present, redirect to login.
    const hasSessionCookie =
      req.cookies.get('sb-access-token') ||
      req.cookies.get('supabase-auth-token') ||
      req.cookies.get('access_token');

    if (!hasSessionCookie) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};

