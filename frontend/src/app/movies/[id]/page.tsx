'use client';

import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Clock, Calendar, Star, Play, Pause, Loader2, X,
  Volume2, VolumeX, Maximize, Sliders, Globe,
  Activity, Check, ChevronDown, Sparkles
} from 'lucide-react';
import ScrollableRow from '@/components/ScrollableRow';
import { Movie } from '@/lib/mockMovies';
import { getLiveMovieById, getLiveRelatedMovies } from '@/lib/movies';
import { notFound } from 'next/navigation';

interface MovieDetailPageProps {
  params: { id: string };
}

// Provider list defined outside component so it's stable (no re-creation on render)
const FREE_PROVIDERS = [
  { name: 'VidSrc Pro',  url: (id: number) => `https://vidsrc.pro/embed/movie/${id}` },
  { name: 'VidSrc.me',  url: (id: number) => `https://vidsrc.me/embed/movie?tmdb=${id}` },
  { name: 'Embed.su',   url: (id: number) => `https://embed.su/embed/movie/${id}` },
  { name: 'VidSrc.xyz', url: (id: number) => `https://vidsrc.xyz/embed/movie/${id}` },
  { name: '2Embed',     url: (id: number) => `https://www.2embed.org/embed/${id}` },
  { name: 'SuperEmbed', url: (id: number) => `https://multiembed.mov/?video_id=${id}&tmdb=1` },
];

export default function MovieDetailPage({ params }: MovieDetailPageProps) {
  const movieId = parseInt(params.id);
  const searchParams = useSearchParams();
  const shouldAutoPlay = searchParams.get('play') === 'true';

  const [movie, setMovie] = useState<Movie | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(7200);
  const [videoQuality, setVideoQuality] = useState('1080p Ultra HD');
  const [selectedSubtitles, setSelectedSubtitles] = useState('English [CC]');
  const [theaterDimmed, setTheaterDimmed] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [liveBitrate, setLiveBitrate] = useState(15.8);
  const [showQualityDropdown, setShowQualityDropdown] = useState(false);
  const [showSubtitlesDropdown, setShowSubtitlesDropdown] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Stream provider state
  const [providerIndex, setProviderIndex] = useState(0);
  const [currentStreamUrl, setCurrentStreamUrl] = useState(() => FREE_PROVIDERS[0].url(movieId));
  const [isUsingTrailerFallback, setIsUsingTrailerFallback] = useState(false);
  const [currentProviderName, setCurrentProviderName] = useState(FREE_PROVIDERS[0].name);

  const playerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const providerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Refs to hold latest values inside effects without causing re-runs
  const providerIndexRef = useRef(0);
  const isUsingTrailerFallbackRef = useRef(false);
  const trailerUrlRef = useRef<string | undefined>(undefined);

  // Load movie data
  useEffect(() => {
    setProviderIndex(0);
    providerIndexRef.current = 0;
    setCurrentStreamUrl(FREE_PROVIDERS[0].url(movieId));
    setCurrentProviderName(FREE_PROVIDERS[0].name);
    setIsUsingTrailerFallback(false);
    isUsingTrailerFallbackRef.current = false;

    async function loadMovieData() {
      try {
        const liveMovie = await getLiveMovieById(movieId);
        if (liveMovie) {
          setMovie(liveMovie);
          trailerUrlRef.current = liveMovie.trailerUrl;
          const liveRelated = await getLiveRelatedMovies(movieId);
          setRelatedMovies(liveRelated);
          if (shouldAutoPlay) {
            setIsPlaying(true);
            setIsPlayingVideo(true);
            setTimeout(() => {
              document.getElementById('cinestream-theater-player')
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

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    );
  }, []);

  // Switch provider helper — stable with useCallback
  const handleSwitchProvider = useCallback((nextIndex: number) => {
    if (nextIndex < FREE_PROVIDERS.length) {
      providerIndexRef.current = nextIndex;
      setProviderIndex(nextIndex);
      setCurrentStreamUrl(FREE_PROVIDERS[nextIndex].url(movieId));
      setCurrentProviderName(FREE_PROVIDERS[nextIndex].name);
      setIsUsingTrailerFallback(false);
      isUsingTrailerFallbackRef.current = false;
    }
  }, [movieId]);

  const handleUseTrailerFallback = useCallback(() => {
    const url = trailerUrlRef.current;
    if (url) {
      setCurrentStreamUrl(url);
      setIsUsingTrailerFallback(true);
      isUsingTrailerFallbackRef.current = true;
    }
  }, []);

  // Playback timer + auto-switch provider after 3s
  useEffect(() => {
    if (isPlayingVideo && isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) { setIsPlayingVideo(false); return 0; }
          return prev + 1;
        });
        setLiveBitrate(prev => {
          const next = prev + (Math.random() - 0.5) * 1.5;
          return Number(Math.max(12.5, Math.min(19.2, next)).toFixed(1));
        });
      }, 1000);

      // Auto-switch: if provider doesn't resolve in 3s, try next one
      providerTimeoutRef.current = setTimeout(() => {
        const nextIndex = providerIndexRef.current + 1;
        if (nextIndex < FREE_PROVIDERS.length && !isUsingTrailerFallbackRef.current) {
          console.warn(`Auto-switching to: ${FREE_PROVIDERS[nextIndex].name}`);
          handleSwitchProvider(nextIndex);
        } else if (!isUsingTrailerFallbackRef.current && trailerUrlRef.current) {
          setCurrentStreamUrl(trailerUrlRef.current);
          setIsUsingTrailerFallback(true);
          isUsingTrailerFallbackRef.current = true;
          console.warn('All providers exhausted. Falling back to trailer.');
        }
      }, 3000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (providerTimeoutRef.current) clearTimeout(providerTimeoutRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (providerTimeoutRef.current) clearTimeout(providerTimeoutRef.current);
    };
  }, [isPlayingVideo, isPlaying, duration, handleSwitchProvider]);

  // Auto-scroll to player on mobile
  useEffect(() => {
    if (isPlayingVideo && isTouchDevice) {
      setTimeout(() => {
        document.getElementById('cinestream-theater-player')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [isPlayingVideo, isTouchDevice]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return [h > 0 ? String(h).padStart(2, '0') : null, String(m).padStart(2, '0'), String(sec).padStart(2, '0')]
      .filter(Boolean).join(':');
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => setCurrentTime(Number(e.target.value));

  // --- Early returns AFTER all hooks ---
  if (isLoading) {
    return (
      <div className="bg-[#06040d] min-h-screen text-[#f1ecfa] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-neon-pink" size={48} />
        <p className="text-gray-400 font-semibold tracking-wide animate-pulse">Dimming the lights...</p>
      </div>
    );
  }

  if (!movie) notFound();

  const streamUrl = currentStreamUrl;
  const trailerUrl = movie?.trailerUrl;

  return (
    <div className={`bg-[#06040d] min-h-screen text-[#f1ecfa] relative transition-all duration-700 ${theaterDimmed ? 'bg-[#000000]/98' : ''}`}>

      {theaterDimmed && (
        <div className="fixed inset-0 bg-[#000000]/95 z-[40] pointer-events-none transition-opacity duration-700" />
      )}

      {/* Hero Section */}
      <div className={`relative w-full min-h-[75vh] md:h-[80vh] flex items-end pt-32 pb-12 md:py-0 overflow-hidden transition-opacity duration-700 ${theaterDimmed ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
        <Image src={movie!.backdropPath} alt={movie!.title} fill priority className="object-cover opacity-35 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06040d] via-[#06040d]/60 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,transparent_20%,#06040d_90%)]" />

        <div className="w-full relative z-10 md:absolute md:inset-0 md:flex md:items-end md:pb-12">
          <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 items-end">

              <div className="hidden md:block relative">
                <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/[0.1] hover:border-neon-pink/40 hover:shadow-[0_20px_50px_rgba(255,0,110,0.15)] transition-all duration-300">
                  <Image src={movie!.posterPath} alt={movie!.title} fill className="object-cover" sizes="250px" />
                </div>
              </div>

              <div className="md:col-span-3 text-left">
                <span className="text-xs md:text-sm font-black tracking-widest text-neon-pink uppercase bg-neon-pink/10 border border-neon-pink/20 px-4 py-1.5 rounded-full mb-4 inline-block shadow-sm animate-pulse">
                  🍿 Streaming Now in Ultra HD
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
                  {movie!.title}
                </h1>
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-sm font-bold shadow-md">
                    <Calendar size={18} className="text-neon-pink" />
                    <span>{new Date(movie!.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-sm font-bold shadow-md">
                    <Clock size={18} className="text-neon-teal" />
                    <span>{movie!.runtime} min</span>
                  </div>
                  <div className="flex items-center gap-2 bg-neon-yellow/10 border border-neon-yellow/20 rounded-xl px-4 py-2 text-sm font-extrabold shadow-md text-neon-yellow">
                    <Star size={18} fill="currentColor" />
                    <span>{movie!.rating.toFixed(1)}/10</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-8">
                  {movie!.genres.map(genre => (
                    <span key={genre} className="bg-white/[0.04] text-gray-300 px-3 py-1 rounded-full text-xs font-bold border border-white/[0.06]">{genre}</span>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-center">
                  <button
                    onClick={() => {
                      setIsPlaying(true);
                      setIsPlayingVideo(true);
                      setTimeout(() => {
                        document.getElementById('cinestream-theater-player')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 200);
                    }}
                    className="btn-neon-pink flex items-center justify-center gap-3 px-10 py-4 text-base shadow-[0_0_35px_rgba(255,0,110,0.45)] cursor-pointer hover:shadow-[0_0_55px_rgba(255,0,110,0.7)] group"
                  >
                    <Play size={22} fill="currentColor" className="group-hover:scale-110 transition-transform duration-200" />
                    WATCH MOVIE NOW 🍿
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">

        {isPlaying && (
          <section id="cinestream-theater-player" ref={playerRef} className="mb-16 mt-8 scroll-mt-28 relative z-[50]">
            <div className="absolute -inset-10 opacity-30 rounded-3xl blur-[100px] pointer-events-none transition-all duration-1000 hidden md:block"
              style={{ background: `radial-gradient(circle, ${isPlayingVideo ? '#D946EF' : '#FF006E'} 0%, transparent 70%)`, animation: isPlayingVideo ? 'float-blob-1 12s infinite alternate ease-in-out' : 'none' }}
            />

            <div className="max-w-5xl mx-auto">
              {/* Player Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl px-3 sm:px-5 py-2 sm:py-3 rounded-2xl">
                <h3 className="text-white font-extrabold text-xs sm:text-sm truncate flex-1">{movie!.title}</h3>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Theater lights */}
                  <button
                    onClick={() => setTheaterDimmed(!theaterDimmed)}
                    className={`flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${theaterDimmed ? 'bg-neon-teal/15 text-neon-teal border-neon-teal/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]' : 'bg-white/[0.04] text-gray-300 border-white/[0.08] hover:bg-white/[0.08]'}`}
                  >
                    <Sparkles size={12} className={theaterDimmed ? 'animate-pulse' : ''} />
                    <span className="hidden xs:inline">{theaterDimmed ? 'Lights On 💡' : 'Dim Lights 🎭'}</span>
                    <span className="inline xs:hidden">{theaterDimmed ? 'On' : 'Dim'}</span>
                  </button>
                  {/* Close */}
                  <button
                    onClick={() => { setIsPlaying(false); setIsPlayingVideo(false); setTheaterDimmed(false); }}
                    className="p-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-white cursor-pointer hover:bg-white/[0.08] flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Theater Canvas */}
              <div
                className="relative w-full rounded-3xl overflow-hidden shadow-[0_30px_70px_-15px_rgba(0,0,0,0.95)] border border-white/[0.1] bg-black"
                style={{ aspectRatio: '16/9' }}
                onTouchStart={() => isTouchDevice && setIsPlayingVideo(true)}
              >
                {isPlayingVideo && (
                  <>
                    <iframe
                      key={streamUrl}
                      src={streamUrl}
                      title={`${movie!.title} - ${isUsingTrailerFallback ? 'Trailer Preview' : 'Full Movie Stream'}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation allow-pointer-lock"
                      className="w-full h-full absolute inset-0 z-0 border-0"
                      loading="lazy"
                      onLoad={() => {
                        // iframe onLoad fires even for 'unavailable' pages — do NOT clear the auto-switch timeout
                      }}
                      onError={() => {
                        const next = providerIndexRef.current + 1;
                        if (next < FREE_PROVIDERS.length && !isUsingTrailerFallbackRef.current) {
                          handleSwitchProvider(next);
                        } else if (!isUsingTrailerFallbackRef.current && trailerUrlRef.current) {
                          handleUseTrailerFallback();
                        }
                      }}
                    />
                    {/* Auto-switching status overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none text-center p-4 z-10">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-neon-pink border-t-transparent rounded-full animate-spin" />
                        <p className="text-white text-xs font-bold">
                          {isUsingTrailerFallback ? 'Playing trailer preview...' : `Trying source ${providerIndex + 1} of ${FREE_PROVIDERS.length}...`}
                        </p>
                        <p className="text-gray-400 text-[10px]">
                          {isUsingTrailerFallback ? 'Trailer' : FREE_PROVIDERS[providerIndex]?.name}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {!isPlayingVideo && (
                  <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-10 flex flex-col items-center justify-center p-4 text-center select-none">
                    <button
                      onClick={() => setIsPlayingVideo(true)}
                      className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-neon-pink to-neon-magenta text-white flex items-center justify-center shadow-[0_0_35px_rgba(255,0,110,0.5)] hover:scale-110 hover:shadow-[0_0_50px_rgba(255,0,110,0.85)] cursor-pointer active:scale-95 transition-all duration-300 mb-3 sm:mb-6 flex-shrink-0 z-20"
                    >
                      <Play size={24} fill="currentColor" className="ml-0.5 sm:ml-2" />
                    </button>
                    <h4 className="text-white font-extrabold text-base sm:text-xl mb-1 sm:mb-2">Theater Screening Paused</h4>
                    <p className="text-gray-400 text-[11px] sm:text-sm max-w-sm">Click play to resume high-fidelity stream from server point.</p>
                  </div>
                )}

                {/* HUD Controls */}
                <div className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 sm:p-6 select-none transition-opacity duration-300 ${isTouchDevice ? 'opacity-100' : 'opacity-0 hover:opacity-100 focus-within:opacity-100'}`}>
                  {/* Scrubber */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <span className="text-[10px] sm:text-[11px] font-bold font-mono text-neon-pink bg-neon-pink/10 border border-neon-pink/20 px-1.5 sm:px-2 py-0.5 rounded flex-shrink-0">{formatTime(currentTime)}</span>
                    <input type="range" min="0" max={duration} value={currentTime} onChange={handleScrubberChange} className="flex-1 h-1 sm:h-1.5 bg-white/[0.08] hover:bg-white/[0.15] rounded-lg appearance-none cursor-pointer accent-neon-pink transition-all" />
                    <span className="text-[10px] sm:text-[11px] font-bold font-mono text-gray-400 bg-white/[0.03] px-1.5 sm:px-2 py-0.5 rounded flex-shrink-0">{formatTime(duration)}</span>
                  </div>

                  <div className="flex flex-col gap-2.5 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <button onClick={() => setIsPlayingVideo(!isPlayingVideo)} className="text-white hover:text-neon-pink cursor-pointer transition-colors p-1.5 flex-shrink-0" title={isPlayingVideo ? 'Pause' : 'Play'}>
                        {isPlayingVideo ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                      </button>
                      <div className="flex items-center gap-1 sm:gap-2 group/volume flex-shrink-0">
                        <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-neon-pink cursor-pointer transition-colors p-1 sm:p-0 flex-shrink-0" title={isMuted ? 'Unmute' : 'Mute'}>
                          {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                        <input type="range" min="0" max="100" value={isMuted ? 0 : volume} onChange={e => { setVolume(Number(e.target.value)); if (isMuted) setIsMuted(false); }} className="w-0 sm:group-hover/volume:w-20 h-1.5 bg-white/[0.12] rounded-lg appearance-none cursor-pointer accent-white transition-all duration-300 hidden sm:block" />
                      </div>
                      <button onClick={() => setShowStats(!showStats)} className={`text-xs font-bold px-3 py-1.5 rounded border transition-all cursor-pointer whitespace-nowrap hidden sm:inline-block ${showStats ? 'bg-neon-teal/10 text-neon-teal border-neon-teal/20' : 'bg-transparent text-gray-500 border-white/[0.06] hover:text-gray-300'}`}>HUD Stats</button>
                      <div className="flex-1" />
                      <button onClick={() => { const p = playerRef.current; if (p) { document.fullscreenElement ? document.exitFullscreen() : p.requestFullscreen().catch(console.error); } }} className="text-white hover:text-neon-pink cursor-pointer transition-colors p-1.5 flex-shrink-0" title="Fullscreen">
                        <Maximize size={18} />
                      </button>
                    </div>

                    {/* Mobile quality/subs row */}
                    <div className="flex items-center gap-2 sm:gap-3 sm:hidden">
                      <div className="relative flex-1">
                        <button onClick={() => { setShowSubtitlesDropdown(!showSubtitlesDropdown); setShowQualityDropdown(false); }} className="w-full flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-3 py-2 rounded-lg cursor-pointer">
                          <Globe size={13} className="flex-shrink-0" /><span className="flex-1 text-left">Subs</span><ChevronDown size={12} className="flex-shrink-0" />
                        </button>
                        {showSubtitlesDropdown && (
                          <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#0e0b1c]/95 border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-30">
                            {['English [CC]', 'Spanish', 'French', 'Off'].map(s => (
                              <button key={s} onClick={() => { setSelectedSubtitles(s); setShowSubtitlesDropdown(false); }} className="w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-neon-pink/15 text-gray-300 hover:text-white flex items-center justify-between">
                                <span>{s}</span>{selectedSubtitles === s && <Check size={14} className="text-neon-pink" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="relative flex-1">
                        <button onClick={() => { setShowQualityDropdown(!showQualityDropdown); setShowSubtitlesDropdown(false); }} className="w-full flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-3 py-2 rounded-lg cursor-pointer">
                          <Sliders size={13} className="flex-shrink-0" /><span className="flex-1 text-left">Quality</span><ChevronDown size={12} className="flex-shrink-0" />
                        </button>
                        {showQualityDropdown && (
                          <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#0e0b1c]/95 border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-30">
                            {['2160p 4K UHD', '1080p Ultra HD', '720p HD', 'Auto'].map(q => (
                              <button key={q} onClick={() => { setVideoQuality(q); setShowQualityDropdown(false); }} className="w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-neon-pink/15 text-gray-300 hover:text-white flex items-center justify-between">
                                <span>{q}</span>{videoQuality === q && <Check size={14} className="text-neon-pink" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Desktop quality/subs row */}
                    <div className="hidden sm:flex items-center gap-3 justify-end">
                      <div className="relative flex-shrink-0">
                        <button onClick={() => { setShowSubtitlesDropdown(!showSubtitlesDropdown); setShowQualityDropdown(false); }} className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-3 py-1.5 rounded-xl cursor-pointer min-w-fit">
                          <Globe size={13} /><span>Subs: {selectedSubtitles.split(' ')[0]}</span><ChevronDown size={12} />
                        </button>
                        {showSubtitlesDropdown && (
                          <div className="absolute bottom-full right-0 mb-2 w-40 bg-[#0e0b1c]/95 border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-30">
                            {['English [CC]', 'Spanish', 'French', 'Off'].map(s => (
                              <button key={s} onClick={() => { setSelectedSubtitles(s); setShowSubtitlesDropdown(false); }} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-neon-pink/15 text-gray-300 hover:text-white flex items-center justify-between">
                                <span>{s}</span>{selectedSubtitles === s && <Check size={12} className="text-neon-pink" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="relative flex-shrink-0">
                        <button onClick={() => { setShowQualityDropdown(!showQualityDropdown); setShowSubtitlesDropdown(false); }} className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-3 py-1.5 rounded-xl cursor-pointer min-w-fit">
                          <Sliders size={13} /><span>{videoQuality.split(' ')[0]}</span><ChevronDown size={12} />
                        </button>
                        {showQualityDropdown && (
                          <div className="absolute bottom-full right-0 mb-2 w-40 bg-[#0e0b1c]/95 border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-30">
                            {['2160p 4K UHD', '1080p Ultra HD', '720p HD', 'Auto'].map(q => (
                              <button key={q} onClick={() => { setVideoQuality(q); setShowQualityDropdown(false); }} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-neon-pink/15 text-gray-300 hover:text-white flex items-center justify-between">
                                <span>{q}</span>{videoQuality === q && <Check size={12} className="text-neon-pink" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Overview */}
        <section className={`mb-12 text-left transition-opacity duration-700 ${theaterDimmed ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
          <h2 className="text-xl md:text-3xl font-black text-white mb-4 tracking-tight">Overview</h2>
          <p className="text-gray-300 text-sm md:text-lg leading-relaxed max-w-3xl drop-shadow">{movie!.overview}</p>
        </section>

        {/* Cast */}
        <section className={`mb-20 transition-opacity duration-700 ${theaterDimmed ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
          <h2 className="text-xl md:text-3xl font-black text-white mb-6 tracking-tight text-left">Leading Cast</h2>
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

        {relatedMovies.length > 0 && (
          <div className={`transition-opacity duration-700 ${theaterDimmed ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
            <ScrollableRow title="🍿 More Curated Cinematic Masterpieces" movies={relatedMovies} />
          </div>
        )}
      </div>
    </div>
  );
}
