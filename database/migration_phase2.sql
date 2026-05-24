-- Alter movies table to support trailers, cast listings, and popularity
alter table public.movies 
    add column if not exists trailer_url text,
    add column if not exists "cast" jsonb default '[]'::jsonb not null,
    add column if not exists popularity numeric(10, 2) default 0.00 not null;

-- Add index on popularity for trending queries
create index if not exists idx_movies_popularity on public.movies (popularity desc);
