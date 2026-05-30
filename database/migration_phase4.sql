-- Guest notification subscriptions (no auth required)
-- anonymous_id is generated client-side and stored in localStorage

create table if not exists public.guest_subscriptions (
    id uuid default gen_random_uuid() primary key,
    anonymous_id uuid not null,
    movie_id bigint references public.movies(id) on delete cascade not null,
    email text,
    push_subscription jsonb,
    notify_days_before integer[] default '{0,1,7}'::integer[] not null,
    plan text not null default 'free' check (plan in ('free','basic','pro')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_guest_movie unique (anonymous_id, movie_id)
);

create index if not exists idx_guest_subs_anonymous_id on public.guest_subscriptions (anonymous_id);
create index if not exists idx_guest_subs_movie_id on public.guest_subscriptions (movie_id);

-- Notifications sent log for guests
create table if not exists public.guest_notifications_log (
    id uuid default gen_random_uuid() primary key,
    anonymous_id uuid not null,
    movie_id bigint references public.movies(id) on delete cascade not null,
    channel text not null check (channel in ('email','push')),
    days_before integer not null,
    sent_at timestamp with time zone default timezone('utc'::text, now()) not null,
    status text not null check (status in ('sent','failed')),
    error_message text
);

create index if not exists idx_guest_notif_log_anon on public.guest_notifications_log (anonymous_id);

-- RLS: backend uses service role key so it bypasses RLS
-- Frontend never touches these tables directly
alter table public.guest_subscriptions enable row level security;
alter table public.guest_notifications_log enable row level security;
