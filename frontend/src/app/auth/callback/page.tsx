'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');

    if (!code) {
      setError('The sign-in link is missing its authorization code.');
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
      if (exchangeError) {
        setError('We could not complete sign-in. Please try again.');
        return;
      }

      router.replace('/notifications');
      router.refresh();
    });
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
