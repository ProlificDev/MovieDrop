'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Search } from 'lucide-react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Upcoming', href: '/movies/upcoming' },
    { name: 'Now Playing', href: '/movies/now-playing' },
    { name: 'Popular', href: '/movies/popular' },
    { name: 'Top Rated', href: '/movies/top-rated' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#06040d]/75 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-neon-pink via-neon-magenta to-neon-teal bg-clip-text text-transparent hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Cinepulse
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-gray-300 hover:text-white font-semibold transition-colors duration-300 py-1 group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-neon-pink to-neon-teal transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Search Icon */}
            <button className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 p-2 rounded-full hover:bg-white/5 hidden md:block">
              <Search size={20} />
            </button>

            {/* Hamburger Menu (Mobile) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white hover:scale-110 active:scale-95 p-2 rounded-full hover:bg-white/5 transition-all duration-300"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/[0.06] pt-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-gray-300 hover:text-white font-semibold transition-all duration-300 py-2 px-3 rounded-lg hover:bg-white/5"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
