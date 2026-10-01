import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Supabase SSR middleware.
 *
 * Required for PKCE OAuth to work in Next.js. During the Google sign-in flow,
 * Supabase stores the PKCE code_verifier in a cookie before redirecting to
 * Google. When Google redirects back to /auth/callback, this middleware reads
 * and forwards that cookie so exchangeCodeForSession can find the verifier.
 *
 * Without this, the verifier is written to a cookie by the browser client but
 * not attached to the server request on the return trip — causing the
 * "PKCE code verifier not found in storage" error.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        // Write cookies onto both the forwarded request and the response
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images.
     * This ensures auth cookies are forwarded on every navigation,
     * including the /auth/callback return trip.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
