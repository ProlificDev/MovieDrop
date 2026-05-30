'use client';

import { Check, X, Zap, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Feature {
  text: string;
  free: boolean | string;
  basic: boolean | string;
  pro: boolean | string;
}

const features: Feature[] = [
  { text: 'Browse all movies',             free: true,   basic: true,   pro: true },
  { text: 'Trailers & where to watch',     free: true,   basic: true,   pro: true },
  { text: 'Movie details & cast',          free: true,   basic: true,   pro: true },
  { text: 'Email notifications',           free: '1 movie', basic: '10 movies', pro: '50 movies' },
  { text: 'Push notifications',            free: false,  basic: false,  pro: true },
  { text: 'Custom notify timing',          free: false,  basic: true,   pro: true },
  { text: 'Early release alerts (2 wks)',  free: false,  basic: true,   pro: true },
  { text: 'Weekly digest email',           free: false,  basic: false,  pro: true },
  { text: 'Hidden Gems picks',             free: false,  basic: false,  pro: true },
  { text: 'Priority notification delivery',free: false,  basic: false,  pro: true },
  { text: 'No ads',                        free: false,  basic: true,   pro: true },
];

const plans = [
  {
    key: 'free',
    name: 'Free',
    price: 0,
    description: 'For casual movie fans',
    icon: <Star size={22} className="text-gray-400" />,
    highlight: false,
    badge: null,
    gradient: 'from-white/[0.04] to-white/[0.02]',
    border: 'border-white/[0.08]',
    btnStyle: {
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#9ca3af',
    },
    btnHover: {},
  },
  {
    key: 'basic',
    name: 'Basic',
    price: 1500,
    description: 'For regular movie watchers',
    icon: <Zap size={22} className="text-neon-teal" />,
    highlight: false,
    badge: null,
    gradient: 'from-neon-teal/[0.08] to-neon-teal/[0.02]',
    border: 'border-neon-teal/20',
    btnStyle: {
      background: 'linear-gradient(90deg,#06B6D4,#0891b2)',
      boxShadow: '0 0 25px rgba(6,182,212,0.3)',
      color: '#fff',
    },
    btnHover: {},
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 4500,
    description: 'For true cinema enthusiasts',
    icon: <Sparkles size={22} className="text-neon-pink" />,
    highlight: true,
    badge: 'Most Popular',
    gradient: 'from-neon-pink/[0.1] to-neon-magenta/[0.04]',
    border: 'border-neon-pink/30',
    btnStyle: {
      background: 'linear-gradient(90deg,#FF006E,#D946EF)',
      boxShadow: '0 0 30px rgba(255,0,110,0.4)',
      color: '#fff',
    },
    btnHover: {},
  },
];

function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true)
    return <Check size={18} className="text-neon-teal mx-auto" strokeWidth={2.5} />;
  if (value === false)
    return <X size={16} className="text-gray-700 mx-auto" strokeWidth={2} />;
  return <span className="text-xs font-bold text-gray-300">{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="bg-[#06040d] min-h-screen text-[#f1ecfa]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-24">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-pink/10 border border-neon-pink/20 text-neon-pink text-xs font-bold tracking-widest uppercase mb-6">
            <Sparkles size={12} />
            Simple Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
            Never Miss a{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg,#FF006E,#D946EF,#06B6D4)' }}
            >
              Release
            </span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto">
            Choose the plan that fits how you watch. Cancel anytime.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {plans.map(plan => (
            <div
              key={plan.key}
              className={`relative rounded-2xl border bg-gradient-to-b ${plan.gradient} ${plan.border} p-8 flex flex-col ${plan.highlight ? 'ring-1 ring-neon-pink/30 shadow-[0_0_40px_rgba(255,0,110,0.12)]' : ''}`}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span
                    className="px-4 py-1 rounded-full text-[11px] font-black tracking-widest text-white"
                    style={{ background: 'linear-gradient(90deg,#FF006E,#D946EF)' }}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                  {plan.icon}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white">{plan.name}</h2>
                  <p className="text-xs text-gray-500">{plan.description}</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-8">
                {plan.price === 0 ? (
                  <span className="text-4xl font-extrabold text-white">Free</span>
                ) : (
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold text-gray-400 mb-1">₦</span>
                    <span className="text-4xl font-extrabold text-white">
                      {plan.price.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-sm mb-1">/month</span>
                  </div>
                )}
              </div>

              {/* Features list */}
              <ul className="space-y-3 flex-1 mb-8">
                {features.map(f => {
                  const val = f[plan.key as keyof Feature] as boolean | string;
                  if (val === false) return null;
                  return (
                    <li key={f.text} className="flex items-start gap-3 text-sm">
                      <Check size={16} className="text-neon-teal flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span className="text-gray-300">
                        {typeof val === 'string' ? (
                          <>
                            {f.text.replace(/\(.*\)/, '').trim()}{' '}
                            <span className="text-white font-bold">({val})</span>
                          </>
                        ) : f.text}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {/* CTA */}
              <div className="relative group">
                <button
                  disabled
                  className="w-full py-3.5 rounded-xl font-extrabold text-sm cursor-not-allowed opacity-80 transition-all"
                  style={plan.btnStyle}
                >
                  {plan.price === 0 ? 'Current Plan' : 'Coming Soon'}
                </button>
                {plan.price > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="text-xs text-white/60 font-semibold">Payments launching soon</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table — desktop */}
        <div className="hidden md:block">
          <h2 className="text-2xl font-extrabold text-white mb-8 text-center">Full Comparison</h2>
          <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-4 bg-white/[0.03] border-b border-white/[0.06]">
              <div className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-widest">Feature</div>
              {plans.map(p => (
                <div key={p.key} className="px-6 py-4 text-center">
                  <span className={`text-sm font-extrabold ${p.highlight ? 'text-neon-pink' : p.key === 'basic' ? 'text-neon-teal' : 'text-gray-400'}`}>
                    {p.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Rows */}
            {features.map((f, i) => (
              <div
                key={f.text}
                className={`grid grid-cols-4 border-b border-white/[0.04] ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}
              >
                <div className="px-6 py-4 text-sm text-gray-400">{f.text}</div>
                <div className="px-6 py-4 text-center"><FeatureCell value={f.free} /></div>
                <div className="px-6 py-4 text-center"><FeatureCell value={f.basic} /></div>
                <div className="px-6 py-4 text-center"><FeatureCell value={f.pro} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-gray-600 text-xs mt-12">
          Payments powered by Paystack · Billed monthly in Nigerian Naira (₦) · Cancel anytime
        </p>

        {/* Back link */}
        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← Back to MoviePulse
          </Link>
        </div>
      </div>
    </div>
  );
}
