import { getCurrentPlan } from './plan';
import { supabase } from './supabase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function getUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user?.id) return session.user.id;
  throw new Error('Not authenticated');
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${session.access_token}` };
}

export async function checkSubscription(movieId: number) {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `${API_BASE}/api/v1/subscriptions/check?movie_id=${movieId}`,
    { headers },
  );
  if (!res.ok) return { subscribed: false, subscription: null };
  return res.json();
}

export async function subscribe(
  movieId: number,
  notifyDaysBefore: number[],
  email?: string,
) {
  const headers = await getAuthHeaders();
  const plan = getCurrentPlan();
  const res = await fetch(`${API_BASE}/api/v1/subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({
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
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/v1/subscriptions`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ movie_id: movieId }),
  });
  if (!res.ok) throw new Error('Unsubscribe failed');
  return res.json();
}

export async function countSubscriptions(): Promise<number> {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `${API_BASE}/api/v1/subscriptions/all`,
    { headers },
  );
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count ?? 0;
}

export async function getAllSubscriptions(): Promise<any[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `${API_BASE}/api/v1/subscriptions/all`,
    { headers },
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.subscriptions ?? [];
}
