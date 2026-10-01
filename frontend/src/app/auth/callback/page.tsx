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
    const errorParam = params.get('error');
    const errorDescription = params.get('error_description');
    const redirect = params.get('redirect') ?? '/';

    // OAuth provider returned an explicit error
    if (errorParam) {
      setError(errorDescription ?? 'Sign-in was denied or an error occurred.');
      return;
    }

    // Implicit flow: Supabase returns the session in the URL hash fragment
    // (#access_token=...). createClient detects and stores this automatically
    // via onAuthStateChange. We just wait for SIGNED_IN and then navigate.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe();
        router.replace(redirect);
        router.refresh();
      }
      // If the hash was absent or invalid, Supabase fires no event.
      // Fall through to the timeout below.
    });

    // Safety timeout — if no SIGNED_IN fires within 8 seconds, show an error.
    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      setError('We could not complete sign-in. Please try again.');
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
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
