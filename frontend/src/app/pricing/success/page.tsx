'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Suspense } from 'react';

function SuccessContent() {
  const params = useSearchParams();
  const plan = params.get('plan') ?? 'basic';
  const ref = params.get('ref') ?? '';

  const planName = plan === 'pro' ? 'Pro' : 'Basic';

  return (
    <div className="bg-[#06040d] min-h-screen text-[#f1ecfa] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-neon-teal/10 border border-neon-teal/20 mx-auto mb-6">
          <CheckCircle size={40} className="text-neon-teal" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-3">You&apos;re all set.</h1>
        <p className="text-gray-400 mb-2">
          Welcome to MoviePulse <span className="text-white font-bold">{planName}</span>.
          Your subscription is now active.
        </p>
        {ref && (
          <p className="text-xs text-gray-600 mb-8">Reference: {ref}</p>
        )}
        <Link
          href="/"
          className="inline-block px-8 py-3.5 rounded-xl font-extrabold text-white text-sm transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(90deg,#FF006E,#D946EF)', boxShadow: '0 0 30px rgba(255,0,110,0.35)' }}
        >
          Start Exploring Movies
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
