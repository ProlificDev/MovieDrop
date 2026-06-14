'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { X, Bell, Zap } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function SignInReminder() {
  const { user, loading } = useAuth();
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (user) return; // Don't show if user is signed in
    if (pathname === '/login' || pathname === '/signup') return; // Don't show on auth pages

    // Check if we've shown it recently
    const lastShown = localStorage.getItem('signin_reminder_last_shown');
    if (lastShown) {
      const timeSince = Date.now() - parseInt(lastShown, 10);
      // Wait at least 24 hours before showing again
      if (timeSince < 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Delay before showing the popup
    const timer = setTimeout(() => {
      setShow(true);
      localStorage.setItem('signin_reminder_last_shown', Date.now().toString());
    }, 5000); // 5 seconds delay

    return () => clearTimeout(timer);
  }, [user, loading, pathname]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500 max-w-sm w-[calc(100vw-3rem)]">
      <div className="relative rounded-2xl border border-neon-pink/30 bg-[#0a0715]/95 backdrop-blur-xl p-6 shadow-[0_0_40px_rgba(255,0,110,0.15)]">
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
        
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-neon-pink/10 border border-neon-pink/20 text-neon-pink">
            <Bell size={20} />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-lg leading-tight">Never Miss a Movie</h3>
          </div>
        </div>
        
        <p className="text-gray-400 text-sm mb-5 leading-relaxed">
          Sign in to track upcoming releases and get free email notifications before they hit theatres!
        </p>
        
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            onClick={() => setShow(false)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-sm text-white transition-all shadow-lg"
            style={{ background: 'linear-gradient(90deg,#FF006E,#D946EF)', boxShadow: '0 0 20px rgba(255,0,110,0.2)' }}
          >
            <Zap size={16} /> Sign In Now
          </Link>
          <button
            onClick={() => setShow(false)}
            className="px-4 py-2.5 rounded-xl font-bold text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
