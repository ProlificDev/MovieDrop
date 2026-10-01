import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Browsing is public — no server-side auth gating needed.
// Auth is handled client-side. Implicit OAuth flow is used (no PKCE),
// so no cookie forwarding middleware is required.
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
