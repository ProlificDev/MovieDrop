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

  const featuredMovie = nowPlayingMovies[0] || popularMovies[0] || upcomingMovies[0];

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
          {/* Now Playing */}
          <ScrollableRow
            title="🍿 Now Playing & Streaming"
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

          {/* Upcoming */}
          <ScrollableRow
            title="📅 Coming Soon (Previews)"
            movies={upcomingMovies}
            link="/movies/upcoming"
          />

          {/* Premium CineStream Feature Showcase Section */}
          <section className="mt-16 sm:mt-24 px-6 sm:px-10 py-12 sm:py-20 bg-white/[0.01] border border-white/[0.05] backdrop-blur-2xl rounded-3xl text-center relative overflow-hidden group shadow-2xl">
            {/* Ambient Background glows */}
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-neon-pink/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-neon-teal/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />

            <div className="relative z-10 max-w-5xl mx-auto">
              <span className="text-xs font-black tracking-widest text-neon-pink uppercase bg-neon-pink/10 border border-neon-pink/20 px-4 py-1.5 rounded-full mb-6 inline-block shadow-sm">
                🍿 CineStream Premium Experience
              </span>
              
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
                Your living room. <span className="text-neon-gradient">Our theater.</span>
              </h2>
              
              <p className="text-gray-400 text-base md:text-lg mb-14 max-w-2xl mx-auto leading-relaxed">
                Stream the absolute latest releases and award-winning cinematic masterpieces immediately. Fully optimized for responsive playback on any device, with no subscription required.
              </p>

              {/* Grid of features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-12">
                <div className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-2xl relative overflow-hidden hover:border-neon-pink/30 hover:bg-white/[0.03] transition-all duration-300 group/card">
                  <div className="absolute top-0 left-0 w-1 h-full bg-neon-pink" />
                  <div className="text-2xl mb-4">🎬</div>
                  <h3 className="text-white font-extrabold text-lg mb-2">Ultra HD Streaming</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Watch in crystal-clear 4K resolution with responsive scaling and high-bitrate visual clarity tailored for large screens.
                  </p>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-2xl relative overflow-hidden hover:border-neon-magenta/30 hover:bg-white/[0.03] transition-all duration-300 group/card">
                  <div className="absolute top-0 left-0 w-1 h-full bg-neon-magenta" />
                  <div className="text-2xl mb-4">⚡</div>
                  <h3 className="text-white font-extrabold text-lg mb-2">High-Speed Servers</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Zero latency, instant buffering. Toggle between multiple dedicated streaming streams dynamically for continuous playback.
                  </p>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-2xl relative overflow-hidden hover:border-neon-teal/30 hover:bg-white/[0.03] transition-all duration-300 group/card">
                  <div className="absolute top-0 left-0 w-1 h-full bg-neon-teal" />
                  <div className="text-2xl mb-4">🎭</div>
                  <h3 className="text-white font-extrabold text-lg mb-2">Pure Theater Mode</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Immerse yourself completely. Toggle dark ambient glows that dynamically flow and pulse matching the color of your movie.
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="btn-neon-pink px-10 py-4 text-base shadow-lg cursor-pointer"
              >
                Browse Now Playing Movies
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
