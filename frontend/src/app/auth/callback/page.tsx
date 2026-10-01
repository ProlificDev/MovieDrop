'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const errorParam = params.get('error');
    const errorDescription = params.get('error_description');

    // OAuth provider returned an explicit error
    if (errorParam) {
      setError(errorDescription ?? 'Sign-in was denied or an error occurred.');
      return;
    }

    const redirect = params.get('redirect') ?? '/';

    // ── PKCE flow: ?code= is present ──────────────────────────────────────
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
        if (exchangeError) {
          console.error('exchangeCodeForSession error:', exchangeError.message);
          setError('We could not complete sign-in. Please try again.');
          return;
        }
        router.replace(redirect);
        router.refresh();
      });
      return;
    }

    // ── Implicit flow: session arrives in the URL hash fragment ───────────
    // Supabase's onAuthStateChange fires automatically when the hash contains
    // access_token, so we just need to wait for the session to be set.
    if (window.location.hash.includes('access_token')) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          subscription.unsubscribe();
          router.replace(redirect);
          router.refresh();
        }
      });
      return;
    }

    // No code and no hash — nothing to exchange
    setError('The sign-in link is missing its authorization code. Please try signing in again.');
  }, [router]);

  return (
    <main className="min-h-screen bg-[#06040d] flex items-center justify-center px-4 text-center text-[#f1ecfa]">
      {error ? (
        <div>
          <p className="text-sm text-red-300">{error}</p>
          <button
            type="button"
            onClick={() => router.replace('/login')}
            className="mt-4 text-sm font-semibold text-neon-pink hover:text-white"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <Loader2 aria-label="Completing sign-in" size={32} className="animate-spin text-neon-pink" />
      )}
    </main>
  );
}
