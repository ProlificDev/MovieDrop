'use client';

import Link from 'next/link';
import { Mail, Github, Twitter } from 'lucide-react';

const links = {
  Browse: [
    { name: 'Now Playing', href: '/movies/now-playing' },
    { name: 'Coming Soon', href: '/movies/upcoming' },
    { name: 'Popular', href: '/movies/popular' },
    { name: 'Top Rated', href: '/movies/top-rated' },
  ],
  Account: [
    { name: 'My Notifications', href: '/notifications' },
    { name: 'Pricing', href: '/pricing' },
  ],
  Genres: [
    { name: 'Action', href: '/movies/genre/action' },
    { name: 'Comedy', href: '/movies/genre/comedy' },
    { name: 'Horror', href: '/movies/genre/horror' },
    { name: 'Sci-Fi', href: '/movies/genre/sci-fi' },
    { name: 'Thriller', href: '/movies/genre/thriller' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#06040d] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">

        {/* Top row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="MoviePulse" className="w-8 h-8 rounded-lg" />
              <span
                className="text-lg font-extrabold bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg,#FF006E,#D946EF,#06B6D4)' }}
              >
                MoviePulse
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Your cinema companion. Browse now-playing movies, track upcoming releases, and get notified before they hit theatres — no account needed.
            </p>

            {/* Social */}
            <div className="flex gap-3 mt-6">
              {[
                { icon: <Twitter size={16} />, href: '#', label: 'Twitter' },
                { icon: <Github size={16} />, href: '#', label: 'GitHub' },
                { icon: <Mail size={16} />, href: 'mailto:hello@moviepulse.app', label: 'Email' },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:border-neon-pink/30 hover:bg-neon-pink/[0.08] transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.05] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} MoviePulse. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Movie data provided by{' '}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300 transition-colors underline"
            >
              TMDB
            </a>
            . Streaming data by{' '}
            <a
              href="https://www.justwatch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300 transition-colors underline"
            >
              JustWatch
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
