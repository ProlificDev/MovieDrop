'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/lib/mockMovies';
import { useState } from 'react';
import { Heart, Play, Calendar, Clock } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  variant?: 'grid' | 'featured' | 'scroll';
  trailerOnly?: boolean;
}

export default function MovieCard({
  movie,
  variant = 'grid',
  trailerOnly = false,
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isScroll = variant === 'scroll';

  if (variant === 'featured') {
    return (
      <div className="relative min-h-[85vh] md:min-h-screen w-full overflow-hidden bg-[#06040d] flex items-center">
        {/* Backdrop Image with Custom Gradient Blending */}
        <div className="absolute inset-0 z-0">
          <Image
            src={movie.backdropPath}
            alt={movie.title}
            fill
            priority
            className="object-cover opacity-35 filter blur-[2px] md:blur-0 scale-105 transition-all duration-1000"
            sizes="100vw"
          />
          {/* Complex Overlays for Visual Depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06040d] via-[#06040d]/65 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06040d] via-[#06040d]/30 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#06040d_80%)]" />
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 py-10 sm:py-14">
          
          {/* Left Block - Asymmetrical Typography Showcase */}
          <div className="lg:col-span-7 flex flex-col items-center text-center">
            <span className="text-xs md:text-sm font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-neon-pink via-neon-magenta to-neon-teal uppercase mb-4 px-3 py-1.5 rounded-full bg-black/20 border border-white/[0.06] shadow-sm">
              ✨ Featured Masterpiece
            </span>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 md:mb-6 leading-tight tracking-tight drop-shadow-xl">
              {movie.title}
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-400 md:text-gray-300 mb-6 md:mb-8 max-w-xl leading-relaxed drop-shadow line-clamp-4 md:line-clamp-none">
              {movie.overview}
            </p>
            
            {/* Metadata Capsules */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6 md:mb-8">
              <span className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-white px-3 py-1.5 md:px-4.5 md:py-2 rounded-xl font-bold text-xs md:text-sm shadow-md">
                <Calendar size={14} className="text-neon-pink" />
                {new Date(movie.releaseDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                })}
              </span>
              <span className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-white px-3 py-1.5 md:px-4.5 md:py-2 rounded-xl font-bold text-xs md:text-sm shadow-md">
                <Clock size={14} className="text-neon-teal" />
                {movie.runtime} min
              </span>
            </div>

            {/* Glowing Call to Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full justify-center">
              {movie.category === 'upcoming' ? (
                <Link href={`/movies/${movie.id}?play=true`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-full sm:w-auto">
                  <button className="btn-neon-pink flex items-center justify-center gap-2.5 w-full cursor-pointer">
                    <Play size={20} fill="currentColor" />
                    Watch Trailer 🎬
                  </button>
                </Link>
              ) : (
                <Link href={`/movies/${movie.id}?play=true`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-full sm:w-auto">
                  <button className="btn-neon-pink flex items-center justify-center gap-2.5 w-full cursor-pointer">
                    <Play size={20} fill="currentColor" />
                    Watch Trailer 🍿
                  </button>
                </Link>
              )}
              <Link href={`/movies/${movie.id}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-full sm:w-auto">
                <button className="btn-neon-outline flex items-center justify-center gap-2.5 w-full cursor-pointer">
                  View Details
                </button>
              </Link>
            </div>
          </div>

          {/* Right Block - 3D Angle-Floating Glass Poster Frame */}
          <div className="lg:col-span-5 hidden lg:flex justify-center items-center relative">
            {/* Background Glow */}
            <div className="absolute w-72 h-96 bg-neon-pink/25 rounded-full blur-[100px] pointer-events-none -rotate-12" />
            
            <Link href={`/movies/${movie.id}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="group/poster block relative">
              <div className="relative w-80 h-[480px] rounded-2xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] border border-white/[0.12] transition-all duration-500 group-hover/poster:scale-[1.03] group-hover/poster:-rotate-2 group-hover/poster:shadow-[0_30px_70px_-10px_rgba(255,0,110,0.25)]">
          <Image
            src={movie.posterPath}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-700 group-hover/poster:scale-105"
            sizes="320px"
            // ponytail: poster is hidden on mobile (lg:flex), fixed 320px width on desktop
          />
                
                {/* Micro-glow frame shine overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 group-hover/poster:opacity-100 transition-opacity duration-500" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/movies/${movie.id}${trailerOnly ? '?play=true' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={isScroll ? 'flex-shrink-0' : 'w-full'}>
      <div
        className={`relative group cursor-pointer transition-all duration-300 hover:scale-[1.03] ${isScroll ? 'w-48' : 'w-full'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Poster */}
        <div className="relative aspect-[2/3] w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden group-hover:border-neon-pink/40 group-hover:shadow-[0_8px_30px_rgba(255,0,110,0.15)] transition-all duration-300">
          <Image
            src={movie.posterPath}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="192px"
          />

          {/* Hover overlay */}
          <div className={`absolute inset-0 bg-[#080616]/92 backdrop-blur-sm flex flex-col items-center justify-center p-4 space-y-4 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-center">
              <p className="text-gray-300 text-xs line-clamp-3 leading-relaxed">{movie.overview}</p>
            </div>
            <div className="w-full">
              {trailerOnly ? (
                <span className="flex items-center gap-2 bg-gradient-to-r from-neon-teal to-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-smooth w-full justify-center">
                  <Play size={12} fill="currentColor" />
                  WATCH TRAILER 🎬
                </span>
              ) : (
                <span className="flex items-center gap-2 bg-gradient-to-r from-neon-pink to-neon-magenta hover:shadow-[0_0_15px_rgba(255,0,110,0.4)] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-smooth w-full justify-center">
                  <Play size={12} fill="currentColor" />
                  STREAM NOW 🍿
                </span>
              )}
            </div>
          </div>

          {/* Year badge */}
          <div className="absolute top-3 right-3 bg-gradient-to-r from-neon-pink to-neon-magenta text-white text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full shadow-lg border border-white/[0.08] backdrop-blur-md">
            {new Date(movie.releaseDate).getFullYear()}
          </div>

          {/* Trailer-only badge */}
          {trailerOnly && (
            <div className="absolute top-3 left-3 bg-neon-teal/20 border border-neon-teal/40 text-neon-teal text-[9px] font-black tracking-wider px-2 py-1 rounded-full backdrop-blur-md">
              COMING SOON
            </div>
          )}
        </div>

        {/* Title */}
        <div className="mt-3.5 px-1.5">
          <h3 className="text-white font-bold text-sm line-clamp-1 group-hover:text-neon-pink transition-colors duration-300">
            {movie.title}
          </h3>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {movie.genres.slice(0, 2).map((genre: string) => (
              <span key={genre} className="bg-white/[0.04] text-gray-400 text-[10px] px-2 py-0.5 rounded-full border border-white/[0.04]">
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
