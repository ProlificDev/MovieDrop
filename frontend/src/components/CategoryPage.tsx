'use client';

import MovieCard from '@/components/MovieCard';
import { Movie } from '@/lib/mockMovies';

interface CategoryPageProps {
  title: string;
  movies: Movie[];
}

export default function CategoryPage({
  title,
  movies,
}: CategoryPageProps) {
  return (
    <div className="bg-[#06040d] min-h-screen text-[#f1ecfa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-16 relative z-10">
        
        {/* Category Header */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-3 tracking-tight">
          {title}
        </h1>
        
        <p className="text-gray-400 text-sm md:text-base mb-12 font-semibold">
          ✨ {movies.length} {movies.length === 1 ? 'masterpiece' : 'masterpieces'} curated for you
        </p>

        {/* Movies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
          {movies.map((movie) => (
            <div key={movie.id} className="flex justify-center">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {movies.length === 0 && (
          <div className="flex items-center justify-center py-28 bg-white/[0.01] border border-white/[0.04] rounded-3xl mt-12 backdrop-blur-md">
            <div className="text-center">
              <p className="text-2xl font-black text-white mb-2">
                No releases listed yet
              </p>
              <p className="text-gray-400 text-sm">
                Our projectionists are preparing new listings. Check back shortly.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
