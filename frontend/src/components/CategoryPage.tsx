'use client';

import MovieCard from '@/components/MovieCard';
import { Movie } from '@/lib/mockMovies';
import { useState } from 'react';

interface CategoryPageProps {
  title: string;
  movies: Movie[];
  trailerOnly?: boolean;
}

export default function CategoryPage({ title, movies, trailerOnly = false }: CategoryPageProps) {
  // Extract unique genres from all movies
  const allGenres = Array.from(
    new Set(movies.flatMap(movie => movie.genres))
  ).sort();

  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  // Filter movies by selected genre
  const filteredMovies = selectedGenre
    ? movies.filter(movie => movie.genres.includes(selectedGenre))
    : movies;

  return (
    <div className="bg-[#06040d] min-h-screen text-[#f1ecfa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-16 relative z-10">
        
        {/* Category Header */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-3 tracking-tight">
          {title}
        </h1>
        
        <p className="text-gray-400 text-sm md:text-base mb-8 font-semibold">
          ✨ {filteredMovies.length} of {movies.length} {movies.length === 1 ? 'masterpiece' : 'masterpieces'} curated for you
        </p>

        {/* Genre Filter Tags */}
        {allGenres.length > 0 && (
          <div className="mb-12 flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedGenre(null)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 border ${
                selectedGenre === null
                  ? 'bg-neon-pink/20 text-neon-pink border-neon-pink/50 shadow-[0_0_15px_rgba(255,0,110,0.3)]'
                  : 'bg-white/[0.04] text-gray-300 border-white/[0.08] hover:bg-white/[0.08]'
              }`}
            >
              All Categories
            </button>
            {allGenres.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 border ${
                  selectedGenre === genre
                    ? 'bg-neon-pink/20 text-neon-pink border-neon-pink/50 shadow-[0_0_15px_rgba(255,0,110,0.3)]'
                    : 'bg-white/[0.04] text-gray-300 border-white/[0.08] hover:bg-white/[0.08]'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        )}

        {/* Movies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
          {filteredMovies.map((movie) => (
            <div key={movie.id} className="flex justify-center">
              <MovieCard movie={movie} trailerOnly={trailerOnly} />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMovies.length === 0 && (
          <div className="flex items-center justify-center py-28 bg-white/[0.01] border border-white/[0.04] rounded-3xl mt-12 backdrop-blur-md">
            <div className="text-center">
              <p className="text-2xl font-black text-white mb-2">
                {selectedGenre ? `No ${selectedGenre} movies found` : 'No releases listed yet'}
              </p>
              <p className="text-gray-400 text-sm">
                {selectedGenre 
                  ? 'Try selecting a different category or genre.'
                  : 'Our projectionists are preparing new listings. Check back shortly.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
