import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Browsing is public — no server-side auth gating needed.
// Auth is handled client-side by components that require it.
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
