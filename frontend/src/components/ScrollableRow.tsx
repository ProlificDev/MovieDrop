'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { Movie } from '@/lib/mockMovies';

interface ScrollableRowProps {
  title: string;
  movies: Movie[];
  link?: string;
}

export default function ScrollableRow({
  title,
  movies,
  link,
}: ScrollableRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft <
          container.scrollWidth - container.clientWidth
      );
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 400;
      if (direction === 'left') {
        container.scrollBy({
          left: -scrollAmount,
          behavior: 'smooth',
        });
      } else {
        container.scrollBy({
          left: scrollAmount,
          behavior: 'smooth',
        });
      }
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <section className="py-10">
      <div className="flex items-center justify-between mb-6 px-6 lg:px-0">
        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
          {title}
        </h2>
        {link && (
          <a
            href={link}
            className="text-sm md:text-base font-extrabold text-neon-pink hover:text-neon-magenta hover:shadow-[0_0_10px_rgba(255,0,110,0.2)] px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] transition-smooth"
          >
            View All →
          </a>
        )}
      </div>

      <div className="relative group">
        {/* Left Arrow - Translucent Glass Trigger */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-[#06040d]/70 backdrop-blur-xl border border-white/[0.1] hover:border-neon-pink/40 hover:bg-neon-pink/15 hover:shadow-[0_0_20px_rgba(255,0,110,0.35)] text-white p-3.5 rounded-full transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.5)] lg:opacity-0 lg:group-hover:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-5 overflow-x-auto scrollbar-hide px-6 lg:px-0 scroll-smooth py-2"
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        {/* Right Arrow - Translucent Glass Trigger */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-[#06040d]/70 backdrop-blur-xl border border-white/[0.1] hover:border-neon-pink/40 hover:bg-neon-pink/15 hover:shadow-[0_0_20px_rgba(255,0,110,0.35)] text-white p-3.5 rounded-full transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.5)] lg:opacity-0 lg:group-hover:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </section>
  );
}
