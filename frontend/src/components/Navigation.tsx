'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Search, Film } from 'lucide-react';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Upcoming', href: '/movies/upcoming' },
  { name: 'Now Playing', href: '/movies/now-playing' },
  { name: 'Popular', href: '/movies/popular' },
  { name: 'Top Rated', href: '/movies/top-rated' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuHeight, setMenuHeight] = useState(0);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Scroll detection for nav background enhancement
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animate mobile menu height for smooth open/close
  useEffect(() => {
    if (mobileMenuRef.current) {
      setMenuHeight(isMenuOpen ? mobileMenuRef.current.scrollHeight : 0);
    }
  }, [isMenuOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? 'rgba(6, 4, 13, 0.92)'
          : 'rgba(6, 4, 13, 0.70)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: scrolled
          ? '1px solid rgba(255,255,255,0.10)'
          : '1px solid rgba(255,255,255,0.04)',
        boxShadow: scrolled
          ? '0 8px 40px rgba(0,0,0,0.55)'
          : 'none',
      }}
    >
      {/* Main bar — fixed height to prevent layout shift */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8" style={{ height: '68px', display: 'flex', alignItems: 'center' }}>
        <div className="flex items-center justify-between w-full">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group flex-shrink-0"
            aria-label="MovieDrop Home"
          >
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
              style={{ background: 'linear-gradient(135deg, #FF006E, #D946EF)' }}
            >
              <Film size={16} className="text-white" />
            </span>
            <span
              className="text-xl font-extrabold bg-clip-text text-transparent transition-opacity duration-300 group-hover:opacity-80"
              style={{ backgroundImage: 'linear-gradient(90deg, #FF006E, #D946EF, #06B6D4)' }}
            >
              MovieDrop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-250"
                  style={{
                    color: active ? '#ffffff' : 'rgba(200,190,220,0.75)',
                    background: active ? 'rgba(255,0,110,0.12)' : 'transparent',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = '#ffffff';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = 'rgba(200,190,220,0.75)';
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }
                  }}
                >
                  {link.name}
                  {/* Active indicator pill */}
                  {active && (
                    <span
                      className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
                      style={{
                        width: '60%',
                        background: 'linear-gradient(90deg, #FF006E, #06B6D4)',
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <button
              aria-label="Search"
              className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-250"
              style={{ color: 'rgba(200,190,220,0.7)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = '#ffffff';
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'rgba(200,190,220,0.7)';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <Search size={18} />
            </button>

            {/* Hamburger — Mobile only */}
            <button
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setIsMenuOpen(prev => !prev)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-white transition-all duration-250"
              style={{ background: isMenuOpen ? 'rgba(255,0,110,0.15)' : 'transparent' }}
            >
              <span
                className="transition-all duration-300"
                style={{ opacity: isMenuOpen ? 0 : 1, position: isMenuOpen ? 'absolute' : 'relative' }}
              >
                <Menu size={22} />
              </span>
              <span
                className="transition-all duration-300"
                style={{ opacity: isMenuOpen ? 1 : 0, position: isMenuOpen ? 'relative' : 'absolute' }}
              >
                <X size={22} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown — smooth height animation, no layout shift */}
      <div
        style={{
          height: `${menuHeight}px`,
          overflow: 'hidden',
          transition: 'height 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div
          ref={mobileMenuRef}
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          className="px-4 py-3 space-y-1"
        >
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  color: active ? '#ffffff' : 'rgba(200,190,220,0.75)',
                  background: active
                    ? 'linear-gradient(90deg, rgba(255,0,110,0.15), rgba(6,182,212,0.08))'
                    : 'transparent',
                  borderLeft: active ? '2px solid #FF006E' : '2px solid transparent',
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
