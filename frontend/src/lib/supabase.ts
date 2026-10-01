import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Live database calls will fail.');
}

/**
 * Browser-side Supabase client.
 *
 * Uses @supabase/ssr's createBrowserClient so that auth tokens are stored in
 * cookies (in addition to localStorage). This lets the session survive SSR
 * page loads without a flash of unauthenticated content.
 *
 * flowType: 'pkce' matches the Supabase project's Auth > Flow type setting.
 * If your project uses Implicit flow, change this to 'implicit'.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
  },
});
