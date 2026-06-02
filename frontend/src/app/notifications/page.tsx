'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, BellOff, Calendar, Clock, Loader2, Mail } from 'lucide-react';
import { getAllSubscriptions, unsubscribe } from '@/lib/subscriptions';
import { getCurrentPlan, PLANS } from '@/lib/plan';
import { useAuth } from '@/components/AuthProvider';

const DAY_LABELS: Record<number, string> = {
  0: 'Release day',
  1: '1 day before',
  3: '3 days before',
  7: '7 days before',
  14: '14 days before',
};

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const plan = getCurrentPlan();
  const planConfig = PLANS[plan];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      getAllSubscriptions().then(data => {
        setSubs(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [user]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleRemove(movieId: number, title: string) {
    setRemoving(movieId);
    try {
      await unsubscribe(movieId);
      setSubs(prev => prev.filter(s => s.movie_id !== movieId));
      showToast(`Removed "${title}"`);
    } catch {
      showToast('Failed to remove. Try again.');
    } finally {
      setRemoving(null);
    }
  }

  const getPosterUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `https://image.tmdb.org/t/p/w300${path}`;
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="bg-[#06040d] min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-neon-pink" />
      </div>
    );
  }

  return (
    <div className="bg-[#06040d] min-h-screen text-[#f1ecfa]">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-[#1a1030] border border-white/[0.1] text-sm text-white font-semibold shadow-xl">
          {toast}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-24">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">
              My Notifications
            </h1>
            <p className="text-gray-400 text-sm">
              Movies you're tracking ·{' '}
              <span className="text-white font-bold">{subs.length}</span>
              {' '}on {planConfig.name} plan
            </p>
          </div>
          <Link
            href="/pricing"
            className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black border transition-all"
            style={{ background: 'rgba(255,0,110,0.08)', border: '1px solid rgba(255,0,110,0.2)', color: '#FF006E' }}
          >
            {plan === 'free' ? '⚡ Upgrade' : `✦ ${planConfig.name}`}
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-32 gap-3 text-gray-500">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-sm font-semibold">Loading your notifications...</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && subs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-5">
              <Bell size={28} className="text-gray-600" />
            </div>
            <h2 className="text-xl font-extrabold text-white mb-2">No notifications yet</h2>
            <p className="text-gray-500 text-sm max-w-xs mb-8">
              Visit any movie page and hit "Notify Me" to get alerts before it releases.
            </p>
            <Link
              href="/"
              className="px-6 py-3 rounded-xl text-sm font-extrabold text-white"
              style={{ background: 'linear-gradient(90deg,#FF006E,#D946EF)' }}
            >
              Browse Movies
            </Link>
          </div>
        )}

        {/* Subscription list */}
        {!loading && subs.length > 0 && (
          <div className="space-y-4">
            {subs.map(sub => {
              const movie = sub.movies ?? {};
              const posterUrl = getPosterUrl(movie.poster_path);
              const releaseDate = movie.release_date
                ? new Date(movie.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                : 'TBA';
              const isReleased = movie.release_date ? new Date(movie.release_date) < new Date() : false;

              return (
                <div key={sub.movie_id} className="flex gap-4 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                  <Link href={`/movies/${sub.movie_id}`} className="flex-shrink-0">
                    <div className="relative w-16 h-24 rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.06]">
                      {posterUrl ? (
                        <Image src={posterUrl} alt={movie.title ?? 'Movie'} fill className="object-cover" sizes="64px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Bell size={20} className="text-gray-600" />
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={`/movies/${sub.movie_id}`}>
                      <h3 className="text-white font-extrabold text-sm sm:text-base leading-tight mb-1 hover:text-neon-pink transition-colors line-clamp-2">
                        {movie.title ?? 'Unknown Movie'}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1.5 mb-3">
                      <Calendar size={12} className={isReleased ? 'text-neon-teal' : 'text-neon-pink'} />
                      <span className="text-xs text-gray-400">
                        {isReleased ? 'Released ' : 'Releases '}{releaseDate}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {sub.email && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-gray-400">
                          <Mail size={10} className="text-neon-pink" />{sub.email}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(sub.notify_days_before ?? []).sort((a: number, b: number) => b - a).map((d: number) => (
                        <span key={d} className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neon-pink/[0.08] border border-neon-pink/20 text-[11px] font-bold text-neon-pink">
                          <Clock size={9} />{DAY_LABELS[d] ?? `${d}d before`}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(sub.movie_id, movie.title ?? 'this movie')}
                    disabled={removing === sub.movie_id}
                    className="flex-shrink-0 self-start flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.07] text-gray-500 hover:text-white hover:border-red-500/30 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-40"
                  >
                    {removing === sub.movie_id ? <Loader2 size={14} className="animate-spin" /> : <BellOff size={14} />}
                  </button>
                </div>
              );
            })}
          </div>
        )}


      </div>
    </div>
  );
}
