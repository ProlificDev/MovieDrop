'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export type PlanKey = 'basic' | 'pro';

export async function createPaystackCheckout(args: {
  anonymousId: string;
  plan: PlanKey;
  amount: number; // NGN (not kobo)
}): Promise<string> {
  const res = await fetch(`${API_BASE}/api/v1/paystack/create-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      anonymous_id: args.anonymousId,
      plan: args.plan,
      amount: args.amount,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? 'Failed to create Paystack checkout');
  }

  const data = await res.json();
  const url = data?.url as string | undefined;
  if (!url) throw new Error('Paystack checkout URL missing');
  return url;
}

