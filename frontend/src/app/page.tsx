'use client';

import { useEffect, useState } from 'react';
import MovieCard from '@/components/MovieCard';
import ScrollableRow from '@/components/ScrollableRow';
import { Movie } from '@/lib/mockMovies';
import { getLiveMoviesByCategory } from '@/lib/movies';
import { Loader2 } from 'lucide-react';

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
      {featuredMovie && <MovieCard movie={featuredMovie} variant="featured" />}

      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">

          <ScrollableRow
            title="🎬 Now Playing"
            movies={nowPlayingMovies}
            link="/movies/now-playing"
          />

          <ScrollableRow
            title="📅 Coming Soon"
            movies={upcomingMovies}
            link="/movies/upcoming"
            trailerOnly
          />
        </div>
      </div>
    </>
  );
}

  return (
    <>
      {featuredMovie && <MovieCard movie={featuredMovie} variant="featured" />}

      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">

          <ScrollableRow
            title="🎬 Now Playing"
            movies={nowPlayingMovies}
            link="/movies/now-playing"
          />

          <ScrollableRow
            title="📅 Coming Soon"
            movies={upcomingMovies}
            link="/movies/upcoming"
            trailerOnly
          />
        </div>
      </div>
    </>
  );
}
