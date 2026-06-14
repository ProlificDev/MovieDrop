'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, X } from 'lucide-react';

const REMINDER_KEY = 'signin_reminder_last_shown';
const COOLDOWN_MS = 48 * 60 * 60 * 1000; // 48 hours
const APPEAR_DELAY_MS = 8000;             // wait 8s before appearing
const AUTO_DISMISS_MS = 10000;            // auto-dismiss 10s after appearing

export default function SignInReminder() {
  const { user, loading } = useAuth();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const pathname = usePathname();
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Only show on movie-related pages so it's contextually useful
  const isMoviePage =
    pathname === '/' ||
    pathname.startsWith('/movies') ||
    pathname === '/notifications';

  useEffect(() => {
    if (loading || user || !isMoviePage) return;
    if (pathname === '/login' || pathname === '/signup') return;

    const lastShown = localStorage.getItem(REMINDER_KEY);
    if (lastShown && Date.now() - parseInt(lastShown, 10) < COOLDOWN_MS) return;

    const showTimer = setTimeout(() => {
      setVisible(true);
      localStorage.setItem(REMINDER_KEY, Date.now().toString());

      // Auto-dismiss
      dismissTimer.current = setTimeout(() => dismiss(), AUTO_DISMISS_MS);
    }, APPEAR_DELAY_MS);

    return () => {
      clearTimeout(showTimer);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [user, loading, pathname, isMoviePage]);

  function dismiss() {
    setExiting(true);
    setTimeout(() => setVisible(false), 400);
  }

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes slideDown {
          from { opacity: 1; transform: translateY(0)    scale(1);    }
          to   { opacity: 0; transform: translateY(24px) scale(0.97); }
        }
        .reminder-enter { animation: slideUp   0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .reminder-exit  { animation: slideDown 0.4s  cubic-bezier(0.4,  0, 1, 1)   forwards; }
      `}</style>

      <div
        className={`fixed bottom-5 right-5 z-50 max-w-xs w-[calc(100vw-2.5rem)] ${exiting ? 'reminder-exit' : 'reminder-enter'}`}
      >
        <div
          className="relative rounded-2xl p-5 shadow-2xl"
          style={{
            background: 'rgba(10, 7, 21, 0.96)',
            border: '1px solid rgba(255, 0, 110, 0.25)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 30px rgba(255,0,110,0.08)',
          }}
        >
          {/* Close */}
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="absolute top-3 right-3 text-gray-600 hover:text-gray-300 transition-colors"
          >
            <X size={16} />
          </button>

          {/* Icon + heading */}
          <div className="flex items-center gap-3 mb-2.5">
            <span
              className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
              style={{ background: 'rgba(255, 0, 110, 0.12)', color: '#FF006E' }}
            >
              <Bell size={18} />
            </span>
            <p className="text-white font-bold text-sm leading-snug">
              Get notified before it hits theatres
            </p>
          </div>

          {/* Body */}
          <p className="text-gray-400 text-xs leading-relaxed mb-4">
            Sign in to track releases &amp; receive free email alerts — no spam, ever.
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              onClick={dismiss}
              className="flex-1 text-center text-xs font-bold text-white py-2 rounded-lg transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(90deg, #FF006E, #D946EF)' }}
            >
              Sign In Free
            </Link>
            <button
              onClick={dismiss}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-3 py-2"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
