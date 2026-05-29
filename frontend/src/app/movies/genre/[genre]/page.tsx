'use client';

import MovieCard from '@/components/MovieCard';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getLiveMoviesByGenre } from '@/lib/movies';
import { Movie } from '@/lib/mockMovies';
import { ChevronRight } from 'lucide-react';

interface GenrePageProps {
  params: { genre: string };
}

export default function GenrePage({
  params,
}: GenrePageProps) {
  const genreName = decodeURIComponent(
    params.genre.replace(/-/g, ' ')
  );

  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMoviesByGenre() {
      try {
        const genreMovies = await getLiveMoviesByGenre(genreName);
        setMovies(genreMovies);
      } catch (err) {
        console.error(`Error loading movies for genre ${genreName}:`, err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMoviesByGenre();
  }, [genreName]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#06040d] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-neon-pink border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading {genreName} movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#06040d] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">{genreName}</h1>
          <p className="text-gray-400 text-lg">
            {movies.length} {movies.length === 1 ? 'movie' : 'movies'} in this category
          </p>
          <Link href="/" className="text-neon-pink hover:text-neon-magenta inline-flex items-center gap-2 mt-6 transition-colors">
            Back to Home <ChevronRight size={18} />
          </Link>
        </div>

        {/* Movies Grid */}
        {movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
            {movies.map((movie) => (
              <div key={movie.id} className="flex justify-center">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-28 bg-white/[0.01] border border-white/[0.04] rounded-3xl backdrop-blur-md">
            <div className="text-center">
              <p className="text-2xl font-black text-white mb-2">
                No {genreName} movies found
              </p>
              <p className="text-gray-400 text-sm">
                Check back soon for more releases.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
