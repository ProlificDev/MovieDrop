'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Check, Loader2, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { checkSubscription, subscribe, unsubscribe, countSubscriptions } from '@/lib/subscriptions';
import { getCurrentPlan, canAddNotification, PLANS } from '@/lib/plan';
import { useAuth } from '@/components/AuthProvider';
import UpgradeModal from '@/components/UpgradeModal';

const DAY_OPTIONS = [
  { label: 'Release day', value: 0 },
  { label: '1 day before', value: 1 },
  { label: '3 days before', value: 3 },
  { label: '7 days before', value: 7 },
  { label: '14 days before', value: 14 },
];

interface Props {
  movieId: number;
  movieTitle: string;
}

export default function NotificationButton({ movieId, movieTitle }: Props) {
  const { user } = useAuth();
  const router = useRouter();

  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 7]);
  const [toast, setToast] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [upgradePlan, setUpgradePlan] = useState<'basic' | 'pro'>('basic');

  const plan = getCurrentPlan();
  const planConfig = PLANS[plan];
  const userEmail = user?.email ?? '';

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const data: any = await Promise.race([
          checkSubscription(movieId),
          new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 5000)),
        ]);
        if (cancelled) return;
        if (data.subscribed && data.subscription) {
          setSubscribed(true);
          setSelectedDays(data.subscription.notify_days_before ?? [0, 1, 7]);
        }
      } catch {
        if (!cancelled) setSubscribed(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [movieId]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function toggleDay(val: number) {
    setSelectedDays(prev =>
      prev.includes(val) ? prev.filter(d => d !== val) : [...prev, val]
    );
  }

  // One-click subscribe for logged-in users
  async function handleOneClickSubscribe() {
    if (!user) { router.push('/login'); return; }

    const count = await countSubscriptions();
    if (!canAddNotification(count)) {
      const needed = plan === 'free' ? 'basic' : 'pro';
      setUpgradeReason(`You've reached your ${planConfig.name} plan limit of ${planConfig.maxNotifications} movie${planConfig.maxNotifications === 1 ? '' : 's'}.`);
      setUpgradePlan(needed as 'basic' | 'pro');
      setUpgradeOpen(true);
      return;
    }

    setSaving(true);
    try {
      await subscribe(movieId, selectedDays, userEmail);
      setSubscribed(true);
      showToast(`You'll be notified about "${movieTitle}" 🎬`);
    } catch (e: any) {
      if (e.message?.includes('limit')) {
        setUpgradeReason(e.message);
        setUpgradePlan(plan === 'free' ? 'basic' : 'pro');
        setUpgradeOpen(true);
      } else {
        showToast(e.message ?? 'Something went wrong.');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateSubscribe() {
    if (selectedDays.length === 0) { showToast('Pick at least one notification time.'); return; }
    setSaving(true);
    try {
      await subscribe(movieId, selectedDays, userEmail);
      setSubscribed(true);
      setExpanded(false);
      showToast('Notification preferences updated.');
    } catch {
      showToast('Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  async function handleUnsubscribe() {
    setSaving(true);
    try {
      await unsubscribe(movieId);
      setSubscribed(false);
      setExpanded(false);
      showToast('Notifications turned off.');
    } catch {
      showToast('Failed to unsubscribe.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  return (
    <>
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-[#1a1030] border border-white/[0.1] text-sm text-white font-semibold shadow-xl">
          {toast}
        </div>
      )}

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} requiredPlan={upgradePlan} reason={upgradeReason} />

      <div className="w-full max-w-sm">
        {subscribed ? (
          <div className="flex gap-2">
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-neon-teal/10 border border-neon-teal/30 text-neon-teal text-sm font-bold transition-all hover:bg-neon-teal/15 cursor-pointer"
            >
              <Check size={16} strokeWidth={2.5} />
              Notified
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button
              onClick={handleUnsubscribe}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <BellOff size={15} />}
            </button>
          </div>
        ) : (
          // One-click if logged in, expand panel if not
          user ? (
            <button
              onClick={handleOneClickSubscribe}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-60"
              style={{ background: 'rgba(255,0,110,0.08)', border: '1px solid rgba(255,0,110,0.25)', color: '#FF006E' }}
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Bell size={16} />}
              {saving ? 'Saving...' : 'Notify Me'}
            </button>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
              style={{ background: 'rgba(255,0,110,0.08)', border: '1px solid rgba(255,0,110,0.25)', color: '#FF006E' }}
            >
              <Bell size={16} />
              Sign in to get notified
            </button>
          )
        )}

        {/* Expanded panel — only for logged-in users to change timing */}
        {subscribed && expanded && (
          <div className="mt-3 p-5 rounded-2xl bg-[#0e0a1a] border border-white/[0.08] space-y-5">

            {/* Email display */}
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07]">
              <Mail size={13} className="text-neon-pink flex-shrink-0" />
              <span className="text-sm text-gray-300 truncate">{userEmail}</span>
            </div>

            {/* Notify timing */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Notify me</label>
              <div className="flex flex-wrap gap-2">
                {DAY_OPTIONS.map(opt => {
                  const needsUpgrade = opt.value > 1 && plan === 'free';
                  const active = selectedDays.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        if (needsUpgrade) {
                          setUpgradeReason('Custom notification timing requires the Basic plan.');
                          setUpgradePlan('basic');
                          setUpgradeOpen(true);
                          return;
                        }
                        toggleDay(opt.value);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        active
                          ? 'bg-neon-pink/15 text-neon-pink border-neon-pink/40'
                          : needsUpgrade
                          ? 'bg-white/[0.02] text-gray-600 border-white/[0.04] opacity-50'
                          : 'bg-white/[0.04] text-gray-400 border-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      {opt.label}{needsUpgrade && ' 🔒'}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleUpdateSubscribe}
              disabled={saving}
              className="w-full py-3 rounded-xl font-extrabold text-sm text-white transition-all cursor-pointer disabled:opacity-60"
              style={{ background: 'linear-gradient(90deg,#FF006E,#D946EF)', boxShadow: '0 0 20px rgba(255,0,110,0.3)' }}
            >
              {saving ? <span className="flex items-center justify-center gap-2"><Loader2 size={15} className="animate-spin" /> Saving...</span> : 'Update Notifications'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
