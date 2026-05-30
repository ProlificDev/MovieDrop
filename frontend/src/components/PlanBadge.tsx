'use client';

import { useEffect, useState } from 'react';
import { getCurrentPlan, Plan } from '@/lib/plan';

const styles: Record<Plan, { label: string; className: string }> = {
  free: {
    label: 'FREE',
    className: 'bg-white/[0.06] text-gray-400 border-white/[0.1]',
  },
  basic: {
    label: 'BASIC',
    className: 'bg-neon-teal/10 text-neon-teal border-neon-teal/30',
  },
  pro: {
    label: 'PRO',
    className: 'bg-neon-pink/10 text-neon-pink border-neon-pink/30',
  },
};

export default function PlanBadge() {
  const [plan, setPlan] = useState<Plan>('free');

  useEffect(() => {
    setPlan(getCurrentPlan());
  }, []);

  const { label, className } = styles[plan];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black tracking-widest border ${className}`}
    >
      {label}
    </span>
  );
}
