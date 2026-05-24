'use client';

import MovieCard from '@/components/MovieCard';
import Link from 'next/link';
import {
  getMoviesByGenre,
  GENRES,
} from '@/lib/mockMovies';
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
  const normalizedGenre = GENRES.find(
    (g) => g.toLowerCase() === genreName.toLowerCase()
  );

  if (!normalizedGenre) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Genre Not Found
          </h1>
          <p className="text-gray-400 mb-6">
            The genre you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/" className="text-red-500 hover:text-red-400">
            Back to Home →
          </Link>
        </div>
      </div>
    );
  }

  const movies = getMoviesByGenre(normalizedGenre);

  return (
    <div className="bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            {normalizedGenre}
          </h1>
          <p className="text-gray-400 text-lg">
            {movies.length} {movies.length === 1 ? 'movie' : 'movies'}
          </p>
        </div>

        {/* Genre Filter Tabs */}
        <div className="mb-12 overflow-x-auto pb-4">
          <div className="flex gap-3">
            {GENRES.map((genre) => (
              <Link
                key={genre}
                href={`/movies/genre/${genre.toLowerCase().replace(/ /g, '-')}`}
                className={`whitespace-nowrap px-6 py-3 rounded-full font-semibold transition-colors ${
                  genre === normalizedGenre
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {genre}
              </Link>
            ))}
          </div>
        </div>

        {/* Movies Grid */}
        {movies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <div key={movie.id} className="flex justify-center">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-400 mb-2">
                No movies in this genre yet
              </p>
              <p className="text-gray-500 mb-6">
                Check back later for new releases
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 font-semibold"
              >
                Back to Home
                <ChevronRight size={20} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
