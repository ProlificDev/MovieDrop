import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Live database calls will fail.');
}

/**
 * Browser-side Supabase client using implicit flow.
 *
 * Implicit flow returns the session token directly in the URL hash after the
 * OAuth redirect — no code_verifier storage required. This avoids the
 * "PKCE code verifier not found in storage" error that occurs in SSR/edge
 * environments where cookie storage isn't reliably available during the
 * OAuth round-trip.
 *
 * The Supabase project's Auth > Flow type must also be set to "Implicit"
 * in the dashboard for this to work end-to-end.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'implicit',
  },
});
