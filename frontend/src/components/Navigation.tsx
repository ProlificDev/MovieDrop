'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Upcoming', href: '/movies/upcoming' },
  { name: 'Now Playing', href: '/movies/now-playing' },
  { name: 'Popular', href: '/movies/popular' },
  { name: 'Top Rated', href: '/movies/top-rated' },
];

const NAV_HEIGHT = 64; // px — single source of truth

export { NAV_HEIGHT };

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Close drawer on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  // Scroll-aware background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* ── Floating Rounded Navbar ───────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-4 sm:px-6 pt-4 sm:pt-6 pointer-events-none transition-all duration-300">
        <nav
          className="pointer-events-auto rounded-2xl w-full max-w-6xl"
          style={{
            height: `${NAV_HEIGHT}px`,
            background: scrolled ? 'rgba(6,4,13,0.92)' : 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: scrolled
              ? '1px solid rgba(255,255,255,0.12)'
              : '1px solid rgba(255,255,255,0.06)',
            boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.5)' : '0 4px 24px rgba(0,0,0,0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div
            className="w-full h-full px-4 sm:px-6 flex items-center justify-between"
            style={{ height: '100%' }}
          >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0 group"
            aria-label="MovieDrop Home"
          >
            <img
              src="/logo.png"
              alt="MovieDrop Logo"
              className="w-8 h-8 rounded-lg transition-transform duration-300 group-hover:scale-110"
            />
            <span
              className="text-lg font-extrabold bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg,#FF006E,#D946EF,#06B6D4)' }}
            >
              MovieDrop
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors duration-200"
                  style={{
                    color: active ? '#fff' : 'rgba(200,190,220,0.7)',
                    background: active ? 'rgba(255,0,110,0.13)' : 'transparent',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = '#fff';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = 'rgba(200,190,220,0.7)';
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }
                  }}
                >
                  {link.name}
                  {active && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-1/2 rounded-full"
                      style={{ background: 'linear-gradient(90deg,#FF006E,#06B6D4)' }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-200"
                style={{ background: 'rgba(128,128,128,0.1)', color: 'var(--text)' }}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}

            {/* Hamburger — mobile only */}
          <button
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(v => !v)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-white transition-colors duration-200"
            style={{ background: isMenuOpen ? 'rgba(255,0,110,0.18)' : 'rgba(255,255,255,0.05)' }}
          >
            {/* Crisp icon swap — no layout thrashing */}
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  </div>

      {/* ── Mobile Full-Screen Drawer ─────────────────────── */}
      {/* Backdrop — tap outside to close */}
      <div
        aria-hidden="true"
        onClick={() => setIsMenuOpen(false)}
        className="md:hidden fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          opacity: isMenuOpen ? 1 : 0,
          pointerEvents: isMenuOpen ? 'auto' : 'none',
        }}
      />

      {/* Drawer panel — slides in from the right */}
      <aside
        className="md:hidden fixed top-0 right-0 bottom-0 z-50 flex flex-col"
        style={{
          width: 'min(80vw, 300px)',
          background: 'rgba(8,4,18,0.98)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          willChange: 'transform',
        }}
        aria-label="Mobile navigation"
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-5"
          style={{
            height: `${NAV_HEIGHT}px`,
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
          }}
        >
          <span
            className="text-base font-extrabold bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(90deg,#FF006E,#D946EF,#06B6D4)' }}
          >
            Navigation
          </span>
          <button
            aria-label="Close menu"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-white"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer links */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  color: active ? '#fff' : 'rgba(200,190,220,0.75)',
                  background: active
                    ? 'linear-gradient(90deg,rgba(255,0,110,0.18),rgba(6,182,212,0.07))'
                    : 'transparent',
                  borderLeft: `3px solid ${active ? '#FF006E' : 'transparent'}`,
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom accent */}
        <div
          className="px-5 py-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs text-gray-600 font-medium">
            © 2025 MovieDrop
          </p>
        </div>
      </aside>
    </>
  );
}
