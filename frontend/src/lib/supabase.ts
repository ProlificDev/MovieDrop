import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Live database calls will fail.');
}

/**
 * Browser-side Supabase client.
 * Uses @supabase/ssr's createBrowserClient so that auth tokens are stored in
 * cookies (not just localStorage). This allows the session to be read by
 * server components and avoids a flash of unauthenticated UI on page load.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
