-- Phase 4: RLS policies for guest_subscriptions
-- Required so the frontend can write directly to Supabase (bypassing Render backend)
-- anonymous_id is stored as text but compared to auth.uid() (uuid) so cast is needed

drop policy if exists "Users can read own subscriptions" on public.guest_subscriptions;
drop policy if exists "Users can insert own subscriptions" on public.guest_subscriptions;
drop policy if exists "Users can update own subscriptions" on public.guest_subscriptions;
drop policy if exists "Users can delete own subscriptions" on public.guest_subscriptions;

create policy "Users can read own subscriptions"
on public.guest_subscriptions for select to authenticated
using (anonymous_id::uuid = auth.uid());

create policy "Users can insert own subscriptions"
on public.guest_subscriptions for insert to authenticated
with check (anonymous_id::uuid = auth.uid());

create policy "Users can update own subscriptions"
on public.guest_subscriptions for update to authenticated
using (anonymous_id::uuid = auth.uid())
with check (anonymous_id::uuid = auth.uid());

create policy "Users can delete own subscriptions"
on public.guest_subscriptions for delete to authenticated
using (anonymous_id::uuid = auth.uid());
