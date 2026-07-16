import { supabase } from './supabase';

export async function signInWithGoogle(redirectAfter = '/') {
  const callbackUrl = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectAfter)}`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: callbackUrl },
  });
  if (error) throw error;
}

export async function signOut() {
  localStorage.removeItem('moviepulse_anonymous_id');
  localStorage.removeItem('moviepulse_plan');
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
