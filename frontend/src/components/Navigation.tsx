'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  CalendarDays,
  CreditCard,
  Film,
  Home,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';
import PlanBadge from '@/components/PlanBadge';

type NavLink = {
  name: string;
  href: string;
  icon: LucideIcon;
};

const navLinks: NavLink[] = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Now Playing', href: '/movies/now-playing', icon: Film },
  { name: 'Upcoming', href: '/movies/upcoming', icon: CalendarDays },
  { name: 'Alerts', href: '/notifications', icon: Bell },
  { name: 'Pricing', href: '/pricing', icon: CreditCard },
];

const NAV_HEIGHT = 56;
export { NAV_HEIGHT };

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const closeMenu = () => {
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-4 pt-3 sm:pt-4 pointer-events-none">
        <motion.nav
          initial={{ opacity: 0, y: -14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto rounded-2xl w-[min(calc(100vw-2rem),760px)] md:w-auto"
          style={{
            height: `${NAV_HEIGHT}px`,
            background: scrolled ? 'rgba(7,5,17,0.9)' : 'rgba(12,9,24,0.72)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: scrolled ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(255,255,255,0.08)',
            boxShadow: scrolled ? '0 14px 42px rgba(0,0,0,0.45)' : '0 8px 26px rgba(0,0,0,0.24)',
            transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
          }}
        >
          <div className="w-full h-full px-3 sm:px-4 flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group pr-1" aria-label="MoviePulse Home">
              <img
                src="/logo.png"
                alt="MoviePulse Logo"
                className="w-7 h-7 rounded-lg shadow-[0_0_18px_rgba(255,0,110,0.24)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
              />
              <span
                className="text-sm font-extrabold bg-clip-text text-transparent sm:text-[15px]"
                style={{ backgroundImage: 'linear-gradient(90deg,#FF006E,#D946EF,#06B6D4)' }}
              >
                MoviePulse
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1 rounded-xl bg-white/[0.035] border border-white/[0.06] p-1">
              {navLinks.map(link => {
                const active = isActive(link.href);
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white/60 transition-colors duration-200 hover:text-white"
                    aria-current={active ? 'page' : undefined}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-lg bg-white/[0.09] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <Icon className="relative h-3.5 w-3.5" />
                    <span className="relative whitespace-nowrap">{link.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="hidden md:flex items-center pl-1">
              <PlanBadge />
            </div>

            <button
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(value => !value)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-white transition-colors duration-200 cursor-pointer"
              style={{ background: isMenuOpen ? 'rgba(255,0,110,0.18)' : 'rgba(255,255,255,0.07)' }}
            >
              <motion.span
                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.22 }}
                className="flex"
              >
                {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </motion.span>
            </button>
          </div>
        </motion.nav>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              aria-hidden="true"
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{
                background: 'rgba(0,0,0,0.58)',
                backdropFilter: 'blur(5px)',
              }}
            />

            <motion.aside
              className="fixed top-0 right-0 bottom-0 z-50 flex flex-col md:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 34 }}
              style={{
                width: 'min(84vw, 320px)',
                background: 'rgba(8,4,18,0.98)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderLeft: '1px solid rgba(255,255,255,0.09)',
                boxShadow: '-24px 0 60px rgba(0,0,0,0.4)',
              }}
              aria-label="Navigation menu"
            >
              <div
                className="flex items-center justify-between px-5"
                style={{ height: `${NAV_HEIGHT + 12}px`, borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}
              >
                <span
                  className="text-base font-extrabold bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(90deg,#FF006E,#D946EF,#06B6D4)' }}
                >
                  MoviePulse
                </span>
                <button
                  aria-label="Close menu"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center w-10 h-10 rounded-xl text-white cursor-pointer transition-colors hover:bg-white/[0.1]"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <X size={20} />
                </button>
              </div>

              <motion.nav
                className="flex flex-col gap-1.5 px-3 py-4 flex-1 overflow-y-auto"
                initial="closed"
                animate="open"
                variants={{
                  open: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
                  closed: {},
                }}
              >
                {navLinks.map(link => {
                  const active = isActive(link.href);
                  const Icon = link.icon;

                  return (
                    <motion.div
                      key={link.href}
                      variants={{
                        open: { opacity: 1, x: 0 },
                        closed: { opacity: 0, x: 18 },
                      }}
                      transition={{ duration: 0.22 }}
                    >
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200"
                        style={{
                          color: active ? '#fff' : 'rgba(215,207,232,0.76)',
                          background: active
                            ? 'linear-gradient(90deg,rgba(255,0,110,0.2),rgba(6,182,212,0.08))'
                            : 'transparent',
                          boxShadow: active ? 'inset 3px 0 0 #FF006E' : 'none',
                        }}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon size={17} />
                        <span>{link.name}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.nav>

              <div
                className="px-5 py-5 flex items-center justify-between"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <PlanBadge />
                <p className="text-xs text-gray-500 font-medium">2026</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
