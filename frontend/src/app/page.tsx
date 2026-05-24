'use client';

import { useEffect, useState } from 'react';
import MovieCard from '@/components/MovieCard';
import ScrollableRow from '@/components/ScrollableRow';
import { Movie } from '@/lib/mockMovies';
import { getLiveMoviesByCategory } from '@/lib/movies';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAllMovies() {
      try {
        const [upcoming, nowPlaying, popular, topRated] = await Promise.all([
          getLiveMoviesByCategory('upcoming'),
          getLiveMoviesByCategory('now-playing'),
          getLiveMoviesByCategory('popular'),
          getLiveMoviesByCategory('top-rated'),
        ]);

        setUpcomingMovies(upcoming);
        setNowPlayingMovies(nowPlaying);
        setPopularMovies(popular);
        setTopRatedMovies(topRated);
      } catch (err) {
        console.error('Error loading home page movies:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAllMovies();
  }, []);

  const featuredMovie = upcomingMovies[0] || nowPlayingMovies[0] || popularMovies[0];

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
      {/* Featured Hero */}
      {featuredMovie && <MovieCard movie={featuredMovie} variant="featured" />}

      {/* Main Content */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Upcoming */}
          <ScrollableRow
            title="🎬 Upcoming Releases"
            movies={upcomingMovies}
            link="/movies/upcoming"
          />

          {/* Now Playing */}
          <ScrollableRow
            title="🍿 Now Playing"
            movies={nowPlayingMovies}
            link="/movies/now-playing"
          />

          {/* Popular */}
          <ScrollableRow
            title="⭐ Popular Releases"
            movies={popularMovies}
            link="/movies/popular"
          />

          {/* Top Rated */}
          <ScrollableRow
            title="🏆 Top Rated Movies"
            movies={topRatedMovies}
            link="/movies/top-rated"
          />

          {/* Premium Call to Action Section - "No More Boring Watchlists" */}
          <section className="mt-24 px-8 py-20 bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-3xl text-center relative overflow-hidden group shadow-2xl">
            {/* Ambient Background Glow inside the CTA */}
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-neon-pink/15 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-neon-teal/15 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-700" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <span className="text-xs font-black tracking-widest text-neon-pink uppercase bg-neon-pink/10 border border-neon-pink/20 px-3.5 py-1.5 rounded-full mb-6 inline-block">
                🔔 Instant Movie Alerts
              </span>
              
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
                No more <span className="text-neon-gradient">boring watchlists</span>.
              </h2>
              
              <p className="text-gray-400 text-base md:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                Receive instant browser push and email notifications for your favorite movies the second they hit theaters. Curate your custom watchlist and stay ahead of the cinematic curve.
              </p>
              
              <button className="btn-neon-pink px-10 py-4.5 text-base shadow-lg">
                Enable Notifications Now
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
