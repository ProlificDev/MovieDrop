'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  checkSubscription,
  subscribe,
  unsubscribe,
  countSubscriptions,
} from '@/lib/subscriptions';
import { getCurrentPlan, canAddNotification, PLANS } from '@/lib/plan';
import UpgradeModal from '@/components/UpgradeModal';

interface Props {
  movieId: number;
  movieTitle: string;
}

export default function NotificationButton({ movieId, movieTitle }: Props) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');

  const plan = getCurrentPlan();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }

    let cancelled = false;
    async function run() {
      try {
        const data: any = await Promise.race([
          checkSubscription(movieId),
          new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 5000)),
        ]);
        if (!cancelled && data.subscribed) setSubscribed(true);
      } catch {
        // keep as not subscribed
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [movieId, user, authLoading]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleClick() {
    if (!user) { router.push('/login'); return; }

    if (subscribed) {
      setSaving(true);
      try {
        await unsubscribe(movieId);
        setSubscribed(false);
        showToast('Notifications turned off.');
      } catch {
        showToast('Failed to unsubscribe.');
      } finally {
        setSaving(false);
      }
      return;
    }

    // Check free plan limit
    const count = await countSubscriptions();
    if (!canAddNotification(count)) {
      setUpgradeReason(`You've reached the free plan limit of 5 movies. Upgrade to track unlimited movies.`);
      setUpgradeOpen(true);
      return;
    }

    setSaving(true);
    try {
      let days = [0];
      if (plan === 'basic') days = [0, 1, 3];
      if (plan === 'pro') days = [0, 1, 3, 7, 14];

      await subscribe(movieId, days, user.email!);
      setSubscribed(true);
      showToast(`You'll be notified about "${movieTitle}" 🎬`);
    } catch (e: any) {
      showToast(e.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) return null;

  return (
    <>
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-[#1a1030] border border-white/[0.1] text-sm text-white font-semibold shadow-xl">
          {toast}
        </div>
      )}

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        requiredPlan="basic"
        reason={upgradeReason}
      />

      {subscribed ? (
        <button
          onClick={handleClick}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-neon-teal/10 border border-neon-teal/30 text-neon-teal text-sm font-bold transition-all hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 cursor-pointer disabled:opacity-50 group"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : (
            <>
              <Check size={16} strokeWidth={2.5} className="group-hover:hidden" />
              <BellOff size={15} className="hidden group-hover:block" />
            </>
          )}
          <span className="group-hover:hidden">Notified</span>
          <span className="hidden group-hover:inline">Turn Off</span>
        </button>
      ) : (
        <button
          onClick={handleClick}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-60"
          style={{
            background: 'rgba(255,0,110,0.08)',
            border: '1px solid rgba(255,0,110,0.25)',
            color: '#FF006E',
          }}
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Bell size={16} />}
          {saving ? 'Saving...' : user ? 'Notify Me' : 'Sign in to get notified'}
        </button>
      )}
    </>
  );
}
