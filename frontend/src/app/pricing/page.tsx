'use client';

import React, { useEffect } from 'react';
import { Check, X, Zap, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        metadata?: Record<string, unknown>;
        onClose: () => void;
        callback: (response: { reference: string }) => void;
      }) => { openIframe: () => void };
    };
  }
}

interface Feature {
  text: string;
  free: boolean | string;
  basic: boolean | string;
  pro: boolean | string;
}

const features: Feature[] = [
  { text: 'Browse all movies',              free: true,        basic: true,         pro: true },
  { text: 'Trailers & where to watch',      free: true,        basic: true,         pro: true },
  { text: 'Full movie details & cast',      free: true,        basic: true,         pro: true },
  { text: 'Email release notifications',    free: '1 movie',   basic: '10 movies',  pro: '50 movies' },
  { text: 'Push notifications',             free: false,       basic: false,        pro: true },
  { text: 'Custom notify timing',           free: false,       basic: true,         pro: true },
  { text: 'Early release alerts (2 weeks)', free: false,       basic: true,         pro: true },
  { text: 'Weekly new releases digest',     free: false,       basic: false,        pro: true },
  { text: 'Hidden Gems curated picks',      free: false,       basic: false,        pro: true },
  { text: 'Priority notification delivery', free: false,       basic: false,        pro: true },
  { text: 'Ad-free experience',             free: false,       basic: true,         pro: true },
];

const plans = [
  {
    key: 'free',
    name: 'Free',
    price: 0,
    amountKobo: 0,
    description: 'For casual movie fans',
    icon: <Star size={20} className="text-gray-400" />,
    highlight: false,
    badge: null,
    accentColor: 'text-gray-400',
    borderClass: 'border-white/[0.08]',
    bgClass: 'bg-gradient-to-b from-white/[0.04] to-white/[0.02]',
    btnClass: 'bg-white/[0.06] border border-white/[0.1] text-gray-500 cursor-default',
    btnLabel: 'Current Plan',
  },
  {
    key: 'basic',
    name: 'Basic',
    price: 1500,
    amountKobo: 150000,
    description: 'For regular movie watchers',
    icon: <Zap size={20} className="text-neon-teal" />,
    highlight: false,
    badge: null,
    accentColor: 'text-neon-teal',
    borderClass: 'border-neon-teal/20',
    bgClass: 'bg-gradient-to-b from-neon-teal/[0.07] to-transparent',
    btnClass: 'text-white font-extrabold cursor-pointer hover:opacity-90 transition-opacity',
    btnLabel: 'Get Started',
    btnStyle: {
      background: 'linear-gradient(90deg,#06B6D4,#0891b2)',
      boxShadow: '0 0 24px rgba(6,182,212,0.3)',
    },
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 4500,
    amountKobo: 450000,
    description: 'For true cinema enthusiasts',
    icon: <Sparkles size={20} className="text-neon-pink" />,
    highlight: true,
    badge: 'Most Popular',
    accentColor: 'text-neon-pink',
    borderClass: 'border-neon-pink/30',
    bgClass: 'bg-gradient-to-b from-neon-pink/[0.09] to-neon-magenta/[0.03]',
    btnClass: 'text-white font-extrabold cursor-pointer hover:opacity-90 transition-opacity',
    btnLabel: 'Get Started',
    btnStyle: {
      background: 'linear-gradient(90deg,#FF006E,#D946EF)',
      boxShadow: '0 0 30px rgba(255,0,110,0.4)',
    },
  },
];

function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true)
    return <Check size={16} className="text-neon-teal mx-auto" strokeWidth={2.5} />;
  if (value === false)
    return <X size={15} className="text-gray-700 mx-auto" strokeWidth={2} />;
  return <span className="text-xs font-semibold text-gray-300">{value}</span>;
}

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState('');
  const [showEmailInput, setShowEmailInput] = React.useState<string | null>(null);

  // Load Paystack inline script
  useEffect(() => {
    if (document.getElementById('paystack-script')) return;
    const script = document.createElement('script');
    script.id = 'paystack-script';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  function generateRef() {
    return `movpulse_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  function handlePaystack(planKey: string, amountKobo: number, planName: string) {
    if (!email.trim() || !email.includes('@')) {
      alert('Please enter a valid email address to continue.');
      return;
    }

    const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!key) {
      alert('Payment configuration error. Please contact support.');
      return;
    }

    setLoadingPlan(planKey);

    const handler = window.PaystackPop.setup({
      key,
      email: email.trim(),
      amount: amountKobo,
      currency: 'NGN',
      ref: generateRef(),
      metadata: { plan: planKey, source: 'moviepulse' },
      onClose: () => {
        setLoadingPlan(null);
      },
      callback: (response) => {
        setLoadingPlan(null);
        // Redirect to success page with reference
        window.location.href = `/pricing/success?ref=${response.reference}&plan=${planKey}`;
      },
    });

    handler.openIframe();
  }

  return (
    <div className="bg-[#06040d] min-h-screen text-[#f1ecfa]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-32 pb-24">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-pink/10 border border-neon-pink/20 text-neon-pink text-xs font-bold tracking-widest uppercase mb-6">
            <Sparkles size={12} />
            Membership Plans
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
            Stay ahead of every{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg,#FF006E,#D946EF,#06B6D4)' }}
            >
              release.
            </span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            Get notified the moment your most anticipated films hit theaters or streaming.
            Pick the plan that fits how you watch.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
          {plans.map(plan => (
            <div
              key={plan.key}
              className={`relative rounded-2xl border ${plan.bgClass} ${plan.borderClass} p-7 flex flex-col ${plan.highlight ? 'ring-1 ring-neon-pink/25 shadow-[0_0_50px_rgba(255,0,110,0.1)]' : ''}`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span
                    className="px-4 py-1 rounded-full text-[11px] font-black tracking-widest text-white"
                    style={{ background: 'linear-gradient(90deg,#FF006E,#D946EF)' }}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                  {plan.icon}
                </div>
                <div>
                  <h2 className={`text-base font-extrabold ${plan.accentColor}`}>{plan.name}</h2>
                  <p className="text-xs text-gray-500">{plan.description}</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-7">
                {plan.price === 0 ? (
                  <span className="text-4xl font-extrabold text-white">Free</span>
                ) : (
                  <div className="flex items-end gap-1">
                    <span className="text-xl font-bold text-gray-400 mb-0.5">₦</span>
                    <span className="text-4xl font-extrabold text-white">{plan.price.toLocaleString()}</span>
                    <span className="text-gray-500 text-sm mb-0.5">/mo</span>
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2.5 flex-1 mb-7">
                {features.map(f => {
                  const val = f[plan.key as keyof Feature] as boolean | string;
                  if (val === false) return null;
                  return (
                    <li key={f.text} className="flex items-start gap-2.5 text-sm">
                      <Check size={14} className="text-neon-teal flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span className="text-gray-300">
                        {typeof val === 'string' ? (
                          <>{f.text.replace(/\(.*\)/, '').trim()} <span className="text-white font-semibold">({val})</span></>
                        ) : f.text}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {/* CTA */}
              {plan.price === 0 ? (
                <button className={`w-full py-3 rounded-xl text-sm font-bold ${plan.btnClass}`}>
                  {plan.btnLabel}
                </button>
              ) : showEmailInput === plan.key ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handlePaystack(plan.key, plan.amountKobo, plan.name)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-neon-pink/50"
                    autoFocus
                  />
                  <button
                    onClick={() => handlePaystack(plan.key, plan.amountKobo, plan.name)}
                    disabled={loadingPlan === plan.key}
                    className={`w-full py-3 rounded-xl text-sm font-extrabold text-white transition-opacity ${loadingPlan === plan.key ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}`}
                    style={(plan as any).btnStyle}
                  >
                    {loadingPlan === plan.key ? 'Opening checkout...' : 'Pay Now →'}
                  </button>
                  <button onClick={() => setShowEmailInput(null)} className="text-xs text-gray-600 hover:text-gray-400 transition-colors cursor-pointer">
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowEmailInput(plan.key)}
                  className={`w-full py-3 rounded-xl text-sm ${plan.btnClass}`}
                  style={(plan as any).btnStyle}
                >
                  {plan.btnLabel}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="hidden md:block mb-16">
          <h2 className="text-xl font-extrabold text-white mb-6 text-center">Full Feature Comparison</h2>
          <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
            <div className="grid grid-cols-4 bg-white/[0.03] border-b border-white/[0.06]">
              <div className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Feature</div>
              {plans.map(p => (
                <div key={p.key} className="px-6 py-4 text-center">
                  <span className={`text-sm font-extrabold ${p.accentColor}`}>{p.name}</span>
                </div>
              ))}
            </div>
            {features.map((f, i) => (
              <div key={f.text} className={`grid grid-cols-4 border-b border-white/[0.04] ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                <div className="px-6 py-3.5 text-sm text-gray-400">{f.text}</div>
                <div className="px-6 py-3.5 text-center"><FeatureCell value={f.free} /></div>
                <div className="px-6 py-3.5 text-center"><FeatureCell value={f.basic} /></div>
                <div className="px-6 py-3.5 text-center"><FeatureCell value={f.pro} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-6 mb-10 text-xs text-gray-600">
          <span className="flex items-center gap-1.5"><Check size={12} className="text-neon-teal" /> Secure payment via Paystack</span>
          <span className="flex items-center gap-1.5"><Check size={12} className="text-neon-teal" /> Cancel anytime</span>
          <span className="flex items-center gap-1.5"><Check size={12} className="text-neon-teal" /> Billed monthly in NGN</span>
          <span className="flex items-center gap-1.5"><Check size={12} className="text-neon-teal" /> No hidden fees</span>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-400 transition-colors">
            ← Back to MoviePulse
          </Link>
        </div>
      </div>
    </div>
  );
}
