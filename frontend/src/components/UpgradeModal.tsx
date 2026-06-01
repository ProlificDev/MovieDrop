'use client';

import { X, Zap } from 'lucide-react';
import Link from 'next/link';
import { Plan, PLANS } from '@/lib/plan';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  requiredPlan?: Plan;
  reason?: string;
}

export default function UpgradeModal({
  open,
  onClose,
  requiredPlan = 'basic',
  reason,
}: UpgradeModalProps) {
  if (!open) return null;

  const plan = PLANS[requiredPlan];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0e0a1a] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-neon-pink/10 border border-neon-pink/20 mb-6 mx-auto">
          <Zap size={28} className="text-neon-pink" fill="currentColor" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-extrabold text-white text-center mb-2">
          Upgrade to {plan.name}
        </h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          {reason ?? `This feature requires the ${plan.name} plan or higher.`}
        </p>

        {/* Key perks */}
        <ul className="space-y-2 mb-8">
          {requiredPlan === 'basic' && (
            <>
              <PerkRow text="Up to 10 movie notifications" />
              <PerkRow text="Choose notify timing (1 day, 7 days before)" />
              <PerkRow text="Early access to upcoming release alerts" />
              <PerkRow text="No ads" />
            </>
          )}
          {requiredPlan === 'pro' && (
            <>
              <PerkRow text="Up to 50 movie notifications" />
              <PerkRow text="Weekly 'What's New' digest" />
              <PerkRow text="Exclusive Hidden Gems picks" />
              <PerkRow text="Priority notification delivery" />
            </>
          )}
        </ul>

        {/* Price */}
        <p className="text-center text-gray-500 text-xs mb-4">
          Starting at{' '}
          <span className="text-white font-bold">
            ₦{plan.price.toLocaleString()}/month
          </span>
        </p>

        {/* CTA */}
        <Link
          href="/pricing"
          onClick={onClose}
          className="block w-full text-center py-3.5 rounded-xl font-extrabold text-white text-sm transition-all duration-200"
          style={{
            background: 'linear-gradient(90deg,#FF006E,#D946EF)',
            boxShadow: '0 0 30px rgba(255,0,110,0.35)',
          }}
        >
          See All Plans
        </Link>

        <button
          onClick={onClose}
          className="block w-full text-center mt-3 text-xs text-gray-600 hover:text-gray-400 transition-colors cursor-pointer"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

function PerkRow({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-sm text-gray-300">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-neon-pink/15 border border-neon-pink/30 flex items-center justify-center">
        <span className="text-neon-pink text-[10px] font-black">✓</span>
      </span>
      {text}
    </li>
  );
}
