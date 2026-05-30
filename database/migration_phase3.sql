-- Add watch_providers column to store TMDB streaming availability data
-- Structure: { "link": "...", "flatrate": [...], "rent": [...], "buy": [...] }
-- Each provider entry: { "provider_id": 8, "provider_name": "Netflix", "logo_path": "/..." }

alter table public.movies
    add column if not exists watch_providers jsonb default '{}'::jsonb not null;

-- Add runtime column (was hardcoded to 120 on the frontend)
alter table public.movies
    add column if not exists runtime integer default 0 not null;

comment on column public.movies.watch_providers is
    'TMDB watch/providers response for US region. Contains flatrate, rent, buy arrays.';
