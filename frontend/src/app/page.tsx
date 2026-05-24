'use client';

import MovieCard from '@/components/MovieCard';
import ScrollableRow from '@/components/ScrollableRow';
import {
  mockMovies,
  getMoviesByCategory,
} from '@/lib/mockMovies';

export default function Home() {
  // Featured movie (first upcoming movie)
  const featuredMovie = getMoviesByCategory('upcoming')[0];
  const upcomingMovies = getMoviesByCategory('upcoming');
  const nowPlayingMovies = getMoviesByCategory('now-playing');
  const popularMovies = getMoviesByCategory('popular');
  const topRatedMovies = getMoviesByCategory('top-rated');

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
