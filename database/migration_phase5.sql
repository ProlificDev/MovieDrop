-- Phase 5: Lifetime subscription quota tracking
-- Prevents free users from gaming the limit by deleting and re-adding movies.
-- The counter only ever increments — never decrements on delete.

-- 1. Quota table: one row per user, tracks lifetime total subscriptions ever created
create table if not exists public.subscription_quota (
    user_id text primary key,  -- matches anonymous_id in guest_subscriptions
    lifetime_count integer not null default 0,
    updated_at timestamp with time zone default timezone('utc', now()) not null
);

-- 2. RLS: users can only read/update their own quota row
alter table public.subscription_quota enable row level security;

create policy "Users can read own quota"
on public.subscription_quota for select to authenticated
using (user_id::uuid = auth.uid());

-- No insert/update policy needed from client — managed by trigger only

-- 3. Trigger function: increment lifetime_count on every new subscription insert
create or replace function public.increment_subscription_quota()
returns trigger as $$
begin
    insert into public.subscription_quota (user_id, lifetime_count, updated_at)
    values (NEW.anonymous_id, 1, now())
    on conflict (user_id)
    do update set
        lifetime_count = subscription_quota.lifetime_count + 1,
        updated_at = now();
    return NEW;
end;
$$ language plpgsql security definer;

-- 4. Attach trigger to guest_subscriptions — fires on every INSERT
drop trigger if exists trg_increment_subscription_quota on public.guest_subscriptions;
create trigger trg_increment_subscription_quota
    after insert on public.guest_subscriptions
    for each row execute function public.increment_subscription_quota();

-- 5. Backfill existing users (counts their current subs as lifetime total)
insert into public.subscription_quota (user_id, lifetime_count)
select anonymous_id, count(*)::integer
from public.guest_subscriptions
group by anonymous_id
on conflict (user_id)
do update set lifetime_count = excluded.lifetime_count;
