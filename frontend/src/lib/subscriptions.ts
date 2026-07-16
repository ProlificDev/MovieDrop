/**
 * Subscription operations — queries Supabase directly from the client.
 * Bypasses the Render backend to avoid cold-start delays.
 * RLS on guest_subscriptions ensures users only see/modify their own rows.
 */
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

// ── Read operations — direct Supabase (no cold start) ─────────────────────

export async function getAllSubscriptions(): Promise<any[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return [];

  const { data, error } = await supabase
    .from('guest_subscriptions')
    .select('*, movies(id, title, release_date, poster_path)')
    .eq('anonymous_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) { console.error('getAllSubscriptions:', error); return []; }
  return data ?? [];
}

export async function checkSubscription(movieId: number) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return { subscribed: false, subscription: null };

  const { data } = await supabase
    .from('guest_subscriptions')
    .select('*')
    .eq('anonymous_id', session.user.id)
    .eq('movie_id', movieId)
    .maybeSingle();

  return { subscribed: !!data, subscription: data ?? null };
}

export async function countSubscriptions(): Promise<number> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return 0;

  const { count } = await supabase
    .from('guest_subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('anonymous_id', session.user.id);

  return count ?? 0;
}

// ── Write operations — still go through backend (validation + email send) ─

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
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('Not authenticated');

  // Direct delete — backend just proxied this anyway
  const { error } = await supabase
    .from('guest_subscriptions')
    .delete()
    .eq('anonymous_id', session.user.id)
    .eq('movie_id', movieId);

  if (error) throw new Error('Unsubscribe failed');
  return { status: 'success' };
}

export function getAnonymousId(): string {
  // ponytail: returns the Supabase user ID if available, else a local anon ID
  const stored = localStorage.getItem('moviepulse_anonymous_id');
  if (stored) return stored;
  const id = crypto.randomUUID();
  localStorage.setItem('moviepulse_anonymous_id', id);
  return id;
}
