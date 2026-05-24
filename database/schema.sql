-- Enable necessary PostgreSQL extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =========================================================================
-- 1. TABLES
-- =========================================================================

-- Public Users Table (mirrored from auth.users)
create table public.users (
    id uuid references auth.users on delete cascade primary key,
    email text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Movies Cache Table (Staging movie records pulled from TMDB API)
create table public.movies (
    id bigint primary key, -- Explicitly using TMDB movie ID
    title text not null,
    overview text,
    release_date date not null,
    poster_path text,
    backdrop_path text,
    vote_average numeric(3, 1),
    genres jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Watchlist Table (Many-to-Many connecting Users and Movies)
create table public.watchlists (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    movie_id bigint references public.movies(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_user_movie unique (user_id, movie_id)
);

-- Notification Preferences (One-to-One with User)
create table public.notification_preferences (
    user_id uuid references public.users(id) on delete cascade primary key,
    email_enabled boolean default true not null,
    push_enabled boolean default false not null,
    notify_days_before integer[] default '{0, 1, 7}'::integer[] not null, -- Array of offsets (e.g., release day, 1 day prior, 7 days prior)
    push_subscription jsonb, -- Stores Browser VAPID subscription object
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notifications Sent Log (Audit log of notifications processed)
create table public.notifications_log (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    movie_id bigint references public.movies(id) on delete cascade not null,
    channel text not null check (channel in ('email', 'push')),
    recipient text not null, -- Email address or Push endpoint
    sent_at timestamp with time zone default timezone('utc'::text, now()) not null,
    status text not null check (status in ('sent', 'failed')),
    error_message text
);

-- =========================================================================
-- 2. AUTOMATIC UPDATED_AT TRIGGERS
-- =========================================================================

-- Trigger function for tracking modifications
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger set_users_updated_at
    before update on public.users
    for each row execute function public.handle_updated_at();

create trigger set_movies_updated_at
    before update on public.movies
    for each row execute function public.handle_updated_at();

create trigger set_preferences_updated_at
    before update on public.notification_preferences
    for each row execute function public.handle_updated_at();

-- =========================================================================
-- 3. SUPABASE AUTH USER MIRROR TRIGGER
-- =========================================================================
-- Automatically inserts records into public.users and public.notification_preferences
-- when a new user registers via Supabase Authentication.

create or replace function public.handle_new_user()
returns trigger as $$
begin
    -- 1. Populate the public.users record
    insert into public.users (id, email)
    values (new.id, new.email);

    -- 2. Populate default notification settings
    insert into public.notification_preferences (user_id, email_enabled, push_enabled, notify_days_before)
    values (new.id, true, false, '{0, 1, 7}');

    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- =========================================================================
-- 4. INDEXES (Optimization for joins & queries)
-- =========================================================================

create index idx_movies_release_date on public.movies (release_date);
create index idx_watchlists_user_id on public.watchlists (user_id);
create index idx_watchlists_movie_id on public.watchlists (movie_id);
create index idx_notifications_log_sent on public.notifications_log (sent_at);

-- =========================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.movies enable row level security;
alter table public.watchlists enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notifications_log enable row level security;

-- Policies for public.users
create policy "Allow profile reading for everyone" on public.users 
    for select using (true);
create policy "Allow users to update own profile" on public.users 
    for update using (auth.uid() = id);

-- Policies for public.movies
create policy "Allow read-only access to movies for all users" on public.movies 
    for select using (true);
-- Write access to movies is restricted entirely to our Backend (via Supabase Service Role Key bypassing RLS)

-- Policies for public.watchlists
create policy "Allow users to view own watchlist" on public.watchlists 
    for select using (auth.uid() = user_id);
create policy "Allow users to insert items to own watchlist" on public.watchlists 
    for insert with check (auth.uid() = user_id);
create policy "Allow users to delete items from own watchlist" on public.watchlists 
    for delete using (auth.uid() = user_id);

-- Policies for public.notification_preferences
create policy "Allow users to view own preferences" on public.notification_preferences 
    for select using (auth.uid() = user_id);
create policy "Allow users to update own preferences" on public.notification_preferences 
    for update using (auth.uid() = user_id);

-- Policies for public.notifications_log
create policy "Allow users to view own notification logs" on public.notifications_log 
    for select using (auth.uid() = user_id);
