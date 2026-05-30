'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Clock, Calendar, Star, Play, X, ExternalLink, Tv, ShoppingCart, MonitorPlay
} from 'lucide-react';
import ScrollableRow from '@/components/ScrollableRow';
import NotificationButton from '@/components/NotificationButton';
import { Movie } from '@/lib/mockMovies';
import { getLiveMovieById, getLiveRelatedMovies } from '@/lib/movies';
import { notFound } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface MovieDetailPageProps {
  params: { id: string };
}

const PROVIDER_LOGO_BASE = 'https://image.tmdb.org/t/p/original';

export default function MovieDetailPage({ params }: MovieDetailPageProps) {
  const movieId = parseInt(params.id);
  const searchParams = useSearchParams();
  const shouldAutoPlay = searchParams.get('play') === 'true';

  const [movie, setMovie] = useState<Movie | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);

  // All hooks before any early returns
  useEffect(() => {
    async function loadMovieData() {
      try {
        const liveMovie = await getLiveMovieById(movieId);
        if (liveMovie) {
          setMovie(liveMovie);
          const liveRelated = await getLiveRelatedMovies(movieId);
          setRelatedMovies(liveRelated);
          if (shouldAutoPlay) {
            setShowTrailer(true);
            setTimeout(() => {
              document.getElementById('trailer-player')
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
          }
        }
      } catch (err) {
        console.error('Error loading movie details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMovieData();
  }, [movieId, shouldAutoPlay]);

  if (isLoading) {
    return (
      <div className="bg-[#06040d] min-h-screen text-[#f1ecfa] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-neon-pink" size={48} />
        <p className="text-gray-400 font-semibold tracking-wide animate-pulse">Dimming the lights...</p>
      </div>
    );
  }

  if (!movie) notFound();

  const trailerUrl = movie!.trailerUrl;
  const providers = movie!.watchProviders;
  const streamingProviders = providers?.flatrate || [];
  const rentProviders = providers?.rent || [];
  const buyProviders = providers?.buy || [];
  const hasProviders = streamingProviders.length > 0 || rentProviders.length > 0 || buyProviders.length > 0;

  return (
    <div className="bg-[#06040d] min-h-screen text-[#f1ecfa]">

      {/* Hero Section */}
      <div className="relative w-full min-h-[75vh] md:h-[80vh] flex items-end pt-32 pb-12 md:py-0 overflow-hidden">
        <Image src={movie!.backdropPath} alt={movie!.title} fill priority className="object-cover opacity-35 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06040d] via-[#06040d]/60 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,transparent_20%,#06040d_90%)]" />

        <div className="w-full relative z-10 md:absolute md:inset-0 md:flex md:items-end md:pb-12">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 items-end">

              {/* Poster */}
              <div className="hidden md:block relative">
                <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/[0.1]">
                  <Image src={movie!.posterPath} alt={movie!.title} fill className="object-cover" sizes="250px" />
                </div>
              </div>

              {/* Info */}
              <div className="md:col-span-3 text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
                  {movie!.title}
                </h1>

                {/* Metadata */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-sm font-bold">
                    <Calendar size={16} className="text-neon-pink" />
                    <span>{new Date(movie!.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  {movie!.runtime > 0 && (
                    <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-sm font-bold">
                      <Clock size={16} className="text-neon-teal" />
                      <span>{movie!.runtime} min</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-neon-yellow/10 border border-neon-yellow/20 rounded-xl px-4 py-2 text-sm font-extrabold text-neon-yellow">
                    <Star size={16} fill="currentColor" />
                    <span>{movie!.rating.toFixed(1)}/10</span>
                  </div>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {movie!.genres.map(genre => (
                    <span key={genre} className="bg-white/[0.04] text-gray-300 px-3 py-1 rounded-full text-xs font-bold border border-white/[0.06]">{genre}</span>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-center">
                  <NotificationButton movieId={movie!.id} movieTitle={movie!.title} />

                  {trailerUrl ? (
                    <button
                      onClick={() => {
                        setShowTrailer(true);
                        setTimeout(() => {
                          document.getElementById('trailer-player')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                      }}
                      className="btn-neon-pink flex items-center justify-center gap-3 px-10 py-4 text-base shadow-[0_0_35px_rgba(255,0,110,0.45)] cursor-pointer hover:shadow-[0_0_55px_rgba(255,0,110,0.7)] group"
                    >
                      <Play size={22} fill="currentColor" className="group-hover:scale-110 transition-transform duration-200" />
                      Watch Trailer
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500 text-sm bg-white/[0.03] border border-white/[0.06] rounded-xl px-6 py-4">
                      <Play size={18} />
                      <span>No trailer available</span>
                    </div>
                  )}

                  {providers?.link && (
                    <a
                      href={providers.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold bg-white/[0.06] border border-white/[0.12] rounded-xl hover:bg-white/[0.1] transition-all cursor-pointer"
                    >
                      <ExternalLink size={16} />
                      All Streaming Options
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Trailer Player */}
        {showTrailer && trailerUrl && (
          <section id="trailer-player" className="mb-16 scroll-mt-28">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold text-white">Official Trailer</h2>
                <button
                  onClick={() => setShowTrailer(false)}
                  className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-white cursor-pointer hover:bg-white/[0.08] transition-all"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="relative w-full rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/[0.08]" style={{ aspectRatio: '16/9' }}>
                <iframe
                  src={`${trailerUrl}&autoplay=1`}
                  title={`${movie!.title} - Official Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="w-full h-full absolute inset-0 border-0"
                />
              </div>
            </div>
          </section>
        )}

        {/* Where to Watch */}
        {hasProviders && (
          <section className="mb-16">
            <h2 className="text-xl md:text-3xl font-black text-white mb-6 tracking-tight">Where to Watch</h2>

            <div className="flex flex-col gap-6">
              {/* Streaming (Flatrate) */}
              {streamingProviders.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tv size={16} className="text-neon-teal" />
                    <span className="text-sm font-bold text-neon-teal uppercase tracking-widest">Stream</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {streamingProviders.map(p => (
                      <a
                        key={p.provider_id}
                        href={providers?.link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-neon-teal/30 rounded-xl px-4 py-3 transition-all cursor-pointer group"
                        title={`Watch on ${p.provider_name}`}
                      >
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={`${PROVIDER_LOGO_BASE}${p.logo_path}`} alt={p.provider_name} fill className="object-cover" sizes="32px" />
                        </div>
                        <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{p.provider_name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Rent */}
              {rentProviders.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MonitorPlay size={16} className="text-neon-pink" />
                    <span className="text-sm font-bold text-neon-pink uppercase tracking-widest">Rent</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {rentProviders.map(p => (
                      <a
                        key={p.provider_id}
                        href={providers?.link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-neon-pink/30 rounded-xl px-4 py-3 transition-all cursor-pointer group"
                        title={`Rent on ${p.provider_name}`}
                      >
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={`${PROVIDER_LOGO_BASE}${p.logo_path}`} alt={p.provider_name} fill className="object-cover" sizes="32px" />
                        </div>
                        <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{p.provider_name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Buy */}
              {buyProviders.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingCart size={16} className="text-neon-yellow" />
                    <span className="text-sm font-bold text-neon-yellow uppercase tracking-widest">Buy</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {buyProviders.map(p => (
                      <a
                        key={p.provider_id}
                        href={providers?.link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-neon-yellow/30 rounded-xl px-4 py-3 transition-all cursor-pointer group"
                        title={`Buy on ${p.provider_name}`}
                      >
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={`${PROVIDER_LOGO_BASE}${p.logo_path}`} alt={p.provider_name} fill className="object-cover" sizes="32px" />
                        </div>
                        <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{p.provider_name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <p className="mt-4 text-xs text-gray-600">
              Streaming data provided by{' '}
              <a href="https://www.justwatch.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-400 underline">JustWatch</a>
              {' '}via TMDB. Availability may vary by region.
            </p>
          </section>
        )}

        {/* No providers fallback */}
        {!hasProviders && (
          <section className="mb-16">
            <h2 className="text-xl md:text-3xl font-black text-white mb-4 tracking-tight">Where to Watch</h2>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 text-center">
              <Tv size={32} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-semibold mb-1">No streaming data available yet</p>
              <p className="text-gray-600 text-sm">This movie may not be available for streaming in your region, or data hasn&apos;t been synced yet.</p>
            </div>
          </section>
        )}

        {/* Overview */}
        <section className="mb-12 text-left">
          <h2 className="text-xl md:text-3xl font-black text-white mb-4 tracking-tight">Overview</h2>
          <p className="text-gray-300 text-sm md:text-lg leading-relaxed max-w-3xl">{movie!.overview}</p>
        </section>

        {/* Cast */}
        {movie!.cast.length > 0 && (
          <section className="mb-20">
            <h2 className="text-xl md:text-3xl font-black text-white mb-6 tracking-tight">Leading Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {movie!.cast.map(actor => (
                <div key={actor.id} className="bg-white/[0.02] border border-white/[0.06] hover:border-white/15 p-2.5 rounded-2xl transition-all duration-300 shadow-md group/cast text-center">
                  <div className="relative h-44 mb-3.5 rounded-xl overflow-hidden bg-white/[0.02]">
                    <Image src={actor.profilePath} alt={actor.name} fill className="object-cover transition-transform duration-500 group-hover/cast:scale-105" sizes="200px" />
                  </div>
                  <h3 className="text-white font-extrabold text-sm line-clamp-1 mb-1 px-1">{actor.name}</h3>
                  <p className="text-gray-400 text-xs px-1 line-clamp-1">as {actor.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Movies */}
        {relatedMovies.length > 0 && (
          <ScrollableRow title="🍿 More Like This" movies={relatedMovies} />
        )}
      </div>
    </div>
  );
}
