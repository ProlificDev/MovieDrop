'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Clock, Calendar, Star, Play, Pause, Loader2, X, 
  Volume2, VolumeX, Maximize, Tv, Sliders, Globe, 
  Activity, Check, ChevronDown, Sparkles
} from 'lucide-react';
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
  const searchParams = useSearchParams();
  const shouldAutoPlay = searchParams.get('play') === 'true';

  const [movie, setMovie] = useState<Movie | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // CineStream Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(7200); // 2 hours in seconds
  const [streamServer, setStreamServer] = useState('Server Alpha [Primary 4K]');
  const [videoQuality, setVideoQuality] = useState('1080p Ultra HD');
  const [selectedSubtitles, setSelectedSubtitles] = useState('English [CC]');
  const [theaterDimmed, setTheaterDimmed] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [liveBitrate, setLiveBitrate] = useState(15.8);

  // Dropdown states
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  const [showQualityDropdown, setShowQualityDropdown] = useState(false);
  const [showSubtitlesDropdown, setShowSubtitlesDropdown] = useState(false);

  const playerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadMovieData() {
      try {
        const liveMovie = await getLiveMovieById(movieId);
        if (liveMovie) {
          setMovie(liveMovie);
          const liveRelated = await getLiveRelatedMovies(movieId);
          setRelatedMovies(liveRelated);
          
          if (shouldAutoPlay) {
            setIsPlaying(true);
            setIsPlayingVideo(true);
            setTimeout(() => {
              const playerElement = document.getElementById('cinestream-theater-player');
              if (playerElement) {
                playerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
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

  // Simulate video playback timer
  useEffect(() => {
    if (isPlayingVideo && isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prevTime) => {
          if (prevTime >= duration) {
            setIsPlayingVideo(false);
            return 0;
          }
          return prevTime + 1;
        });
        // Jitter live bitrate for realistic monitoring stats
        setLiveBitrate((prev) => {
          const delta = (Math.random() - 0.5) * 1.5;
          const next = prev + delta;
          return Number(Math.max(12.5, Math.min(19.2, next)).toFixed(1));
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlayingVideo, isPlaying, duration]);

  // Format time (seconds -> hh:mm:ss)
  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return [
      hours > 0 ? String(hours).padStart(2, '0') : null,
      String(minutes).padStart(2, '0'),
      String(seconds).padStart(2, '0')
    ].filter(Boolean).join(':');
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  };

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

  const defaultEmbed = movie.trailerUrl || `https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&showinfo=0`;

  return (
    <div className={`bg-[#06040d] min-h-screen text-[#f1ecfa] relative transition-all duration-700 ${theaterDimmed ? 'bg-[#000000]/98' : ''}`}>
      
      {/* Dimmer Overlay for Theater mode */}
      {theaterDimmed && (
        <div className="fixed inset-0 bg-[#000000]/95 z-[40] pointer-events-none transition-opacity duration-700" />
      )}

      {/* Hero Section with Backdrop */}
      <div className={`relative w-full min-h-[75vh] md:h-[80vh] flex items-end pt-32 pb-12 md:py-0 overflow-hidden transition-opacity duration-700 ${theaterDimmed ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
        <Image
          src={movie.backdropPath}
          alt={movie.title}
          fill
          priority
          className="object-cover opacity-35 scale-105"
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
              <div className="md:col-span-3 text-left">
                <span className="text-xs md:text-sm font-black tracking-widest text-neon-pink uppercase bg-neon-pink/10 border border-neon-pink/20 px-4 py-1.5 rounded-full mb-4 inline-block shadow-sm animate-pulse">
                  🍿 Streaming Now in Ultra HD
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
                    onClick={() => {
                      setIsPlaying(true);
                      setIsPlayingVideo(true);
                      setTimeout(() => {
                        const playerElement = document.getElementById('cinestream-theater-player');
                        if (playerElement) {
                          playerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }, 200);
                    }}
                    className="btn-neon-pink flex items-center justify-center gap-3 px-10 py-4.5 text-base shadow-[0_0_35px_rgba(255,0,110,0.45)] cursor-pointer hover:shadow-[0_0_55px_rgba(255,0,110,0.7)] group"
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

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        {/* Immersive Theater Video Player Section */}
        {isPlaying && (
          <section 
            id="cinestream-theater-player"
            ref={playerRef} 
            className="mb-16 mt-8 scroll-mt-28 relative z-[50]"
          >
            {/* Ambient Pulse Light Glow reflecting the backdrop */}
            <div 
              className="absolute -inset-10 opacity-30 rounded-3xl blur-[100px] pointer-events-none transition-all duration-1000 hidden md:block" 
              style={{
                background: `radial-gradient(circle, ${isPlayingVideo ? '#D946EF' : '#FF006E'} 0%, transparent 70%)`,
                animation: isPlayingVideo ? 'float-blob-1 12s infinite alternate ease-in-out' : 'none'
              }}
            />

            <div className="max-w-5xl mx-auto">
              {/* Player Header */}
              <div className="flex items-center justify-between mb-4 bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl px-5 py-3 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-neon-pink animate-ping" />
                  <span className="text-xs font-black tracking-widest text-neon-pink uppercase">LIVE SCREENING</span>
                  <h3 className="text-white font-extrabold text-sm hidden sm:inline">| {movie.title}</h3>
                </div>
                <div className="flex items-center gap-3">
                  {/* Theater lights controller */}
                  <button 
                    onClick={() => setTheaterDimmed(!theaterDimmed)}
                    className={`flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      theaterDimmed 
                        ? 'bg-neon-teal/15 text-neon-teal border-neon-teal/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                        : 'bg-white/[0.04] text-gray-300 border-white/[0.08] hover:bg-white/[0.08]'
                    }`}
                  >
                    <Sparkles size={14} className={theaterDimmed ? 'animate-pulse' : ''} />
                    {theaterDimmed ? 'Lights On 💡' : 'Dim Lights 🎭'}
                  </button>
                  {/* Close Player */}
                  <button 
                    onClick={() => {
                      setIsPlaying(false);
                      setIsPlayingVideo(false);
                      setTheaterDimmed(false);
                    }}
                    className="p-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-white cursor-pointer hover:bg-white/[0.08]"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Theater Canvas Container */}
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-[0_30px_70px_-15px_rgba(0,0,0,0.95)] border border-white/[0.1] bg-black">
                {/* Real Stream embed */}
                <iframe
                  src={`${defaultEmbed}${defaultEmbed.includes('?') ? '&' : '?'}&autoplay=${isPlayingVideo ? 1 : 0}&enablejsapi=1`}
                  title={`${movie.title} Stream`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="w-full h-full absolute inset-0 z-0 border-0"
                />

                {/* Custom Cinematic overlay covering player when paused */}
                {!isPlayingVideo && (
                  <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6 text-center select-none">
                    <button 
                      onClick={() => setIsPlayingVideo(true)}
                      className="w-20 h-20 rounded-full bg-gradient-to-r from-neon-pink to-neon-magenta text-white flex items-center justify-center shadow-[0_0_35px_rgba(255,0,110,0.5)] hover:scale-110 hover:shadow-[0_0_50px_rgba(255,0,110,0.85)] cursor-pointer active:scale-95 transition-all duration-300 mb-6"
                    >
                      <Play size={36} fill="currentColor" className="ml-2" />
                    </button>
                    <h4 className="text-white font-extrabold text-xl mb-2">Theater Screening Paused</h4>
                    <p className="text-gray-400 text-sm max-w-sm">Click play to resume high-fidelity stream from server point.</p>
                  </div>
                )}

                {/* Premium Control HUD overlay (Glassmorphic) */}
                <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-6 select-none opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
                  {/* Scrubber Bar */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[11px] font-bold font-mono text-neon-pink bg-neon-pink/10 border border-neon-pink/20 px-2 py-0.5 rounded">
                      {formatTime(currentTime)}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      value={currentTime}
                      onChange={handleScrubberChange}
                      className="w-full h-1.5 bg-white/[0.08] hover:bg-white/[0.15] rounded-lg appearance-none cursor-pointer accent-neon-pink transition-all"
                    />
                    <span className="text-[11px] font-bold font-mono text-gray-400 bg-white/[0.03] px-2 py-0.5 rounded">
                      {formatTime(duration)}
                    </span>
                  </div>

                  {/* HUD Control Row */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Play/Pause */}
                      <button 
                        onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                        className="text-white hover:text-neon-pink cursor-pointer transition-colors"
                      >
                        {isPlayingVideo ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                      </button>

                      {/* Volume */}
                      <div className="flex items-center gap-2 group/volume">
                        <button 
                          onClick={() => setIsMuted(!isMuted)}
                          className="text-white hover:text-neon-pink cursor-pointer transition-colors"
                        >
                          {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => {
                            setVolume(Number(e.target.value));
                            if (isMuted) setIsMuted(false);
                          }}
                          className="w-0 group-hover/volume:w-16 h-1 bg-white/[0.12] rounded-lg appearance-none cursor-pointer accent-white transition-all duration-300"
                        />
                      </div>

                      {/* Stream Live Stats Display Toggle */}
                      <button 
                        onClick={() => setShowStats(!showStats)}
                        className={`text-xs font-bold px-2 py-1 rounded border transition-all cursor-pointer ${
                          showStats 
                            ? 'bg-neon-teal/10 text-neon-teal border-neon-teal/20' 
                            : 'bg-transparent text-gray-500 border-white/[0.06] hover:text-gray-300'
                        }`}
                      >
                        HUD Stats
                      </button>
                    </div>

                    {/* Quality, Subtitle & Server Selector Panels */}
                    <div className="flex items-center gap-3">
                      {/* Subtitles dropdown */}
                      <div className="relative">
                        <button 
                          onClick={() => {
                            setShowSubtitlesDropdown(!showSubtitlesDropdown);
                            setShowQualityDropdown(false);
                            setShowServerDropdown(false);
                          }}
                          className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-3 py-1.5 rounded-xl cursor-pointer"
                        >
                          <Globe size={13} />
                          <span>Subs: {selectedSubtitles.split(' ')[0]}</span>
                          <ChevronDown size={12} />
                        </button>
                        {showSubtitlesDropdown && (
                          <div className="absolute bottom-full right-0 mb-2 w-40 bg-[#0e0b1c]/95 border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-30">
                            {['English [CC]', 'Spanish', 'French', 'Off'].map((subs) => (
                              <button
                                key={subs}
                                onClick={() => {
                                  setSelectedSubtitles(subs);
                                  setShowSubtitlesDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-neon-pink/15 text-gray-300 hover:text-white flex items-center justify-between"
                              >
                                <span>{subs}</span>
                                {selectedSubtitles === subs && <Check size={12} className="text-neon-pink" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Resolution dropdown */}
                      <div className="relative">
                        <button 
                          onClick={() => {
                            setShowQualityDropdown(!showQualityDropdown);
                            setShowSubtitlesDropdown(false);
                            setShowServerDropdown(false);
                          }}
                          className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-3 py-1.5 rounded-xl cursor-pointer"
                        >
                          <Sliders size={13} />
                          <span>{videoQuality.split(' ')[0]}</span>
                          <ChevronDown size={12} />
                        </button>
                        {showQualityDropdown && (
                          <div className="absolute bottom-full right-0 mb-2 w-40 bg-[#0e0b1c]/95 border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-30">
                            {['2160p 4K UHD', '1080p Ultra HD', '720p HD', 'Auto'].map((qual) => (
                              <button
                                key={qual}
                                onClick={() => {
                                  setVideoQuality(qual);
                                  setShowQualityDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-neon-pink/15 text-gray-300 hover:text-white flex items-center justify-between"
                              >
                                <span>{qual}</span>
                                {videoQuality === qual && <Check size={12} className="text-neon-pink" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Fullscreen */}
                      <button 
                        onClick={() => {
                          const player = playerRef.current;
                          if (player) {
                            if (document.fullscreenElement) {
                              document.exitFullscreen();
                            } else {
                              player.requestFullscreen().catch((err) => console.error(err));
                            }
                          }
                        }}
                        className="text-white hover:text-neon-pink cursor-pointer transition-colors p-1"
                        aria-label="Fullscreen"
                      >
                        <Maximize size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Streaming server & live HUD metrics panel */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch select-none">
                {/* Server selection buttons */}
                <div className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl md:col-span-7 flex flex-col justify-center">
                  <h5 className="text-[10px] font-black tracking-widest text-gray-500 uppercase mb-2">Streaming Channel Server</h5>
                  <div className="flex flex-wrap gap-2">
                    {['Server Alpha [Primary 4K]', 'Server Beta [Ultra Speed]', 'Backup Source'].map((srv) => (
                      <button
                        key={srv}
                        onClick={() => setStreamServer(srv)}
                        className={`text-xs font-bold py-2 px-3.5 rounded-xl border transition-all cursor-pointer ${
                          streamServer === srv 
                            ? 'bg-neon-pink/15 text-neon-pink border-neon-pink/30 shadow-[0_0_12px_rgba(255,0,110,0.15)]'
                            : 'bg-white/[0.02] text-gray-400 border-white/[0.04] hover:bg-white/[0.06] hover:text-white'
                        }`}
                      >
                        {srv.split(' ')[1] === 'Alpha' ? '🚀 Server Alpha (4K)' : srv.split(' ')[1] === 'Beta' ? '⚡ Server Beta (1080p)' : '📡 Backup Stream'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* HUD Bitrate and latency details */}
                {showStats && (
                  <div className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl md:col-span-5 flex items-center justify-between">
                    <div>
                      <h5 className="text-[10px] font-black tracking-widest text-neon-teal uppercase mb-2.5 flex items-center gap-1">
                        <Activity size={10} className="animate-pulse" /> Live Stream Telemetry
                      </h5>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono text-gray-400">
                        <div>Bitrate: <span className="text-white font-bold">{liveBitrate} Mbps</span></div>
                        <div>Latency: <span className="text-white font-bold">14 ms</span></div>
                        <div>Format: <span className="text-white font-bold">HEVC H.265</span></div>
                        <div>Audio: <span className="text-white font-bold">Atmos 5.1</span></div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-[9px] font-black text-neon-teal bg-neon-teal/10 px-2 py-0.5 rounded border border-neon-teal/20 uppercase tracking-widest mb-1.5">EXCELLENT</div>
                      <span className="w-5 h-5 rounded-full bg-neon-teal/20 border border-neon-teal flex items-center justify-center">
                        <Check size={10} className="text-neon-teal font-extrabold" />
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Overview Row */}
        <section className={`mb-12 text-left transition-opacity duration-700 ${theaterDimmed ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
          <h2 className="text-xl md:text-3xl font-black text-white mb-4 tracking-tight flex items-center gap-2">
            Overview
          </h2>
          <p className="text-gray-300 text-sm md:text-lg leading-relaxed max-w-3xl drop-shadow">
            {movie.overview}
          </p>
        </section>

        {/* Glass Cast Cards Grid */}
        <section className={`mb-20 transition-opacity duration-700 ${theaterDimmed ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
          <h2 className="text-xl md:text-3xl font-black text-white mb-6 tracking-tight text-left">
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
          <div className={`transition-opacity duration-700 ${theaterDimmed ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
            <ScrollableRow
              title="🍿 More Curated Cinematic Masterpieces"
              movies={relatedMovies}
            />
          </div>
        )}
      </div>
    </div>
  );
}

