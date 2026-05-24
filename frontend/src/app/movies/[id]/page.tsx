'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Heart, Clock, Calendar, Star, Bell, Play, Loader2 } from 'lucide-react';
import ScrollableRow from '@/components/ScrollableRow';
import { Movie } from '@/lib/mockMovies';
import { getLiveMovieById, getLiveRelatedMovies } from '@/lib/movies';
import { notFound } from 'next/navigation';

interface MovieDetailPageProps {
  params: { id: string };
}

export default function MovieDetailPage({
  params,
}: MovieDetailPageProps) {
  const movieId = parseInt(params.id);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isNotified, setIsNotified] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  useEffect(() => {
    async function loadMovieData() {
      try {
        const liveMovie = await getLiveMovieById(movieId);
        if (liveMovie) {
          setMovie(liveMovie);
          const liveRelated = await getLiveRelatedMovies(movieId);
          setRelatedMovies(liveRelated);
        }
      } catch (err) {
        console.error('Error loading movie details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMovieData();
  }, [movieId]);

  if (isLoading) {
    return (
      <div className="bg-[#06040d] min-h-screen text-[#f1ecfa] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-neon-pink" size={48} />
        <p className="text-gray-400 font-semibold tracking-wide animate-pulse">Dimming the lights...</p>
      </div>
    );
  }

  if (!movie) {
    notFound();
  }

  return (
    <div className="bg-[#06040d] min-h-screen text-[#f1ecfa] relative">
      
      {/* Hero Section with Backdrop */}
      <div className="relative w-full min-h-[75vh] md:h-[80vh] flex items-end pt-32 pb-12 md:py-0 overflow-hidden">
        <Image
          src={movie.backdropPath}
          alt={movie.title}
          fill
          priority
          className="object-cover opacity-40 scale-105"
        />

        {/* Ambient Radial & Linear Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06040d] via-[#06040d]/60 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,transparent_20%,#06040d_90%)]" />

        {/* Content Overlay */}
        <div className="w-full relative z-10 md:absolute md:inset-0 md:flex md:items-end md:pb-12">
          <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 items-end">
              
              {/* Floating Glass Poster Frame */}
              <div className="hidden md:block relative">
                <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/[0.1] hover:border-neon-pink/40 hover:shadow-[0_20px_50px_rgba(255,0,110,0.15)] transition-all duration-300">
                  <Image
                    src={movie.posterPath}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    sizes="250px"
                  />
                </div>
              </div>

              {/* Title and Info Block */}
              <div className="md:col-span-3">
                <span className="text-xs md:text-sm font-black tracking-widest text-neon-pink uppercase bg-neon-pink/10 border border-neon-pink/20 px-3 py-1.5 rounded-full mb-4 inline-block shadow-sm">
                  🎭 {movie.genres[0]} • Release Preview
                </span>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
                  {movie.title}
                </h1>

                {/* Metadata Badges */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-sm font-bold shadow-md">
                    <Calendar size={18} className="text-neon-pink" />
                    <span>
                      {new Date(movie.releaseDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-sm font-bold shadow-md">
                    <Clock size={18} className="text-neon-teal" />
                    <span>{movie.runtime} min</span>
                  </div>

                  <div className="flex items-center gap-2 bg-neon-yellow/10 border border-neon-yellow/20 rounded-xl px-4 py-2 text-sm font-extrabold shadow-md text-neon-yellow">
                    <Star size={18} fill="currentColor" />
                    <span>{movie.rating.toFixed(1)}/10</span>
                  </div>
                </div>

                {/* Genres Inline */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="bg-white/[0.04] text-gray-300 px-3 py-1 rounded-full text-xs font-bold border border-white/[0.06]"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                {/* Main Action Buttons */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-center">
                  <button
                    onClick={() => movie.trailerUrl && setIsTrailerOpen(true)}
                    className={`btn-neon-pink flex items-center justify-center gap-2 ${!movie.trailerUrl ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <Play size={18} fill="currentColor" />
                    {movie.trailerUrl ? 'Watch Trailer' : 'No Trailer Available'}
                  </button>
                  
                  <button
                    onClick={() => setIsWatchlisted(!isWatchlisted)}
                    className="btn-neon-outline flex items-center justify-center gap-2 py-3!"
                  >
                    <Heart
                      size={18}
                      fill={isWatchlisted ? '#FF006E' : 'none'}
                      className={isWatchlisted ? 'text-neon-pink' : ''}
                    />
                    {isWatchlisted ? 'Saved to Watchlist' : 'Add to Watchlist'}
                  </button>
                  
                  <button 
                    onClick={() => setIsNotified(!isNotified)}
                    className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-extrabold text-sm transition-smooth border hover:scale-105 active:scale-95 shadow-md ${
                      isNotified 
                        ? 'bg-neon-teal/15 text-neon-teal border-neon-teal/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                        : 'bg-neon-yellow/15 text-neon-yellow border-neon-yellow/30 hover:shadow-[0_0_15px_rgba(255,214,10,0.3)]'
                    }`}
                  >
                    <Bell size={18} fill={isNotified ? 'currentColor' : 'none'} />
                    {isNotified ? 'Notified!' : 'Notify Me'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        {/* Overview Row */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-5 tracking-tight flex items-center gap-2">
            Overview
          </h2>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-3xl drop-shadow">
            {movie.overview}
          </p>
        </section>

        {/* Trailer Modal */}
        {isTrailerOpen && movie.trailerUrl && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setIsTrailerOpen(false)}
          >
            <div
              className="relative w-full max-w-5xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsTrailerOpen(false)}
                className="absolute -top-12 right-0 text-white/70 hover:text-white text-sm font-bold flex items-center gap-2 transition-colors"
              >
                <span className="text-2xl leading-none">&times;</span> Close
              </button>
              {/* YouTube Embed */}
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(255,0,110,0.2)] border border-white/10">
                <iframe
                  src={`${movie.trailerUrl}&autoplay=1`}
                  title={`${movie.title} Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Glass Cast Cards Grid */}
        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-6 tracking-tight">
            Leading Cast
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {movie.cast.map((actor) => (
              <div 
                key={actor.id} 
                className="bg-white/[0.02] border border-white/[0.06] hover:border-white/15 p-2.5 rounded-2xl transition-all duration-300 shadow-md group/cast text-center"
              >
                <div className="relative h-44 mb-3.5 rounded-xl overflow-hidden bg-white/[0.02]">
                  <Image
                    src={actor.profilePath}
                    alt={actor.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover/cast:scale-105"
                    sizes="200px"
                  />
                </div>
                <h3 className="text-white font-extrabold text-sm line-clamp-1 mb-1 px-1">
                  {actor.name}
                </h3>
                <p className="text-gray-400 text-xs px-1 line-clamp-1">as {actor.character}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Similar Movies ScrollRow */}
        {relatedMovies.length > 0 && (
          <ScrollableRow
            title="🎬 Similar Releases For You"
            movies={relatedMovies}
          />
        )}
      </div>
    </div>
  );
}
