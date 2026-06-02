import { getCurrentPlan } from './plan';

const ANON_KEY = 'moviepulse_anonymous_id';
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export function getAnonymousId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(ANON_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANON_KEY, id);
  }
  return id;
}

export async function checkSubscription(movieId: number) {
  const anonId = getAnonymousId();
  const res = await fetch(
    `${API_BASE}/api/v1/subscriptions/check?anonymous_id=${anonId}&movie_id=${movieId}`
  );
  if (!res.ok) return { subscribed: false, subscription: null };
  return res.json();
}

export async function subscribe(
  movieId: number,
  notifyDaysBefore: number[],
  email?: string,
) {
  const anonId = getAnonymousId();
  const plan = getCurrentPlan();
  const res = await fetch(`${API_BASE}/api/v1/subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      anonymous_id: anonId,
      movie_id: movieId,
      notify_days_before: notifyDaysBefore,
      plan,
      email: email || null,
      push_subscription: null,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? 'Subscription failed');
  }
  return res.json();
}

export async function unsubscribe(movieId: number) {
  const anonId = getAnonymousId();
  const res = await fetch(`${API_BASE}/api/v1/subscriptions`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ anonymous_id: anonId, movie_id: movieId }),
  });
  if (!res.ok) throw new Error('Unsubscribe failed');
  return res.json();
}

export async function countSubscriptions(): Promise<number> {
  const anonId = getAnonymousId();
  const res = await fetch(
    `${API_BASE}/api/v1/subscriptions/all?anonymous_id=${anonId}`
  );
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count ?? 0;
}

export async function getAllSubscriptions(): Promise<any[]> {
  const anonId = getAnonymousId();
  const res = await fetch(
    `${API_BASE}/api/v1/subscriptions/all?anonymous_id=${anonId}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.subscriptions ?? [];
}
