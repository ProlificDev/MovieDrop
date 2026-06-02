'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MovieCard from '@/components/MovieCard';
import ScrollableRow from '@/components/ScrollableRow';
import { Movie } from '@/lib/mockMovies';
import { getLiveMoviesByCategory } from '@/lib/movies';
import { Loader2, Bell, Mail, Film, Zap, Clock } from 'lucide-react';

const GENRES = [
  'Action', 'Comedy', 'Drama', 'Horror',
  'Sci-Fi', 'Thriller', 'Animation', 'Romance', 'Crime', 'Adventure',
];

const STATS = [
  { value: '10', label: 'Free notifications' },
  { value: '∞', label: 'Paid plan movies' },
  { value: 'Email', label: 'Notifications' },
  { value: 'Free', label: 'To get started' },
];

const HOW_IT_WORKS = [
  {
    icon: <Film size={24} className="text-neon-pink" />,
    title: 'Browse',
    desc: 'Explore movies in theatres now and everything coming soon — all in one place.',
  },
  {
    icon: <Bell size={24} className="text-neon-teal" />,
    title: 'Subscribe',
    desc: 'Sign in and click "Notify Me" on any upcoming movie — one tap is all it takes.',
  },
  {
    icon: <Zap size={24} className="text-neon-yellow" />,
    title: 'Get Notified',
    desc: 'Receive an email automatically before your movie hits theatres. Never miss a release.',
  },
];

function CountdownTimer({ releaseDate }: { releaseDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calc() {
      const diff = new Date(releaseDate).getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [releaseDate]);

  return (
    <div className="flex gap-3">
      {[
        { v: timeLeft.days, l: 'Days' },
        { v: timeLeft.hours, l: 'Hrs' },
        { v: timeLeft.minutes, l: 'Min' },
        { v: timeLeft.seconds, l: 'Sec' },
      ].map(({ v, l }) => (
        <div key={l} className="flex flex-col items-center bg-white/[0.06] border border-white/[0.1] rounded-xl px-3 py-2 min-w-[52px]">
          <span className="text-xl font-extrabold text-white tabular-nums">{String(v).padStart(2, '0')}</span>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{l}</span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAllMovies() {
      try {
        const [nowPlaying, upcoming] = await Promise.all([
          getLiveMoviesByCategory('now-playing'),
          getLiveMoviesByCategory('upcoming'),
        ]);
        setNowPlayingMovies(nowPlaying);
        setUpcomingMovies(upcoming);
      } catch (err) {
        console.error('Error loading home page movies:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAllMovies();
  }, []);

  const featuredMovie = nowPlayingMovies[0] || upcomingMovies[0];
  // Next big release = soonest upcoming movie
  const nextRelease = upcomingMovies[0] ?? null;

  if (isLoading) {
    return (
      <div className="bg-[#06040d] min-h-screen text-[#f1ecfa] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-neon-pink" size={48} />
        <p className="text-gray-400 font-semibold tracking-wide animate-pulse">Dimming the lights...</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Featured Hero ─────────────────────────────────── */}
      {featuredMovie && <MovieCard movie={featuredMovie} variant="featured" />}

      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16 space-y-16">

          {/* ── Stats Bar ─────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map(s => (
              <div
                key={s.label}
                className="flex flex-col items-center justify-center py-5 rounded-2xl border border-white/[0.07] bg-white/[0.02]"
              >
                <span
                  className="text-2xl font-extrabold bg-clip-text text-transparent mb-1"
                  style={{ backgroundImage: 'linear-gradient(90deg,#FF006E,#D946EF,#06B6D4)' }}
                >
                  {s.value}
                </span>
                <span className="text-xs text-gray-500 font-semibold">{s.label}</span>
              </div>
            ))}
          </div>

          {/* ── Now Playing Row ───────────────────────────── */}
          <ScrollableRow
            title="🎬 Now Playing"
            movies={nowPlayingMovies}
            link="/movies/now-playing"
          />

          {/* ── Coming Soon This Month ────────────────────── */}
          {nextRelease && new Date(nextRelease.releaseDate) > new Date() && (
            <section>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-6">
                🚀 Next Big Release
              </h2>
              <div className="relative rounded-2xl border border-neon-pink/20 bg-gradient-to-r from-neon-pink/[0.06] to-neon-teal/[0.03] overflow-hidden p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                {/* Poster */}
                <div className="relative w-24 h-36 rounded-xl overflow-hidden flex-shrink-0 border border-white/[0.1] shadow-lg">
                  <img
                    src={nextRelease.posterPath}
                    alt={nextRelease.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-neon-pink uppercase tracking-widest mb-2">Coming Soon</p>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2 line-clamp-1">{nextRelease.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{nextRelease.overview}</p>

                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={13} className="text-gray-500" />
                    <span className="text-xs text-gray-500">
                      Releases {new Date(nextRelease.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>

                  <CountdownTimer releaseDate={nextRelease.releaseDate} />
                </div>

                {/* CTA */}
                <Link
                  href={`/movies/${nextRelease.id}`}
                  className="flex-shrink-0 px-6 py-3 rounded-xl font-extrabold text-sm text-white transition-all"
                  style={{ background: 'linear-gradient(90deg,#FF006E,#D946EF)', boxShadow: '0 0 25px rgba(255,0,110,0.3)' }}
                >
                  View Movie
                </Link>
              </div>
            </section>
          )}

          {/* ── Coming Soon Row ───────────────────────────── */}
          <ScrollableRow
            title="📅 Coming Soon"
            movies={upcomingMovies}
            link="/movies/upcoming"
            trailerOnly
          />

          {/* ── Genre Quick-Links ─────────────────────────── */}
          <section>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-6">
              🎭 Browse by Genre
            </h2>
            <div className="flex flex-wrap gap-3">
              {GENRES.map(genre => (
                <Link
                  key={genre}
                  href={`/movies/genre/${genre.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold border border-white/[0.08] bg-white/[0.03] text-gray-300 hover:text-white hover:border-neon-pink/40 hover:bg-neon-pink/[0.08] transition-all duration-200"
                >
                  {genre}
                </Link>
              ))}
            </div>
          </section>

          {/* ── How It Works ──────────────────────────────── */}
          <section>
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-pink/10 border border-neon-pink/20 text-neon-pink text-xs font-bold tracking-widest uppercase mb-4">
                How it works
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Never miss a release again
              </h2>
              <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
                MovieDrop tracks every upcoming release and alerts you exactly when you want — no account needed.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {HOW_IT_WORKS.map((step, i) => (
                <div
                  key={step.title}
                  className="relative p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] text-center"
                >
                  <div className="absolute -top-3 left-6 w-6 h-6 rounded-full bg-neon-pink flex items-center justify-center text-[11px] font-black text-white">
                    {i + 1}
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] mx-auto mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-white font-extrabold text-base mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            {/* Notification channels */}
            <div className="mt-8 p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-white font-extrabold text-base mb-1">Stay in the loop via email</p>
                <p className="text-gray-400 text-sm">Get notified by email before your movie releases. Sign in with Google to get started.</p>
              </div>
              <div className="flex gap-4 flex-shrink-0">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neon-pink/10 border border-neon-pink/20 text-neon-pink text-sm font-bold">
                  <Mail size={15} /> Email
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
