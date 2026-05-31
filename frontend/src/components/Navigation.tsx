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
  Sun,
  Moon,
  type LucideIcon,
} from 'lucide-react';

import { getCurrentPlan, Plan } from '@/lib/plan';

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
  const [plan, setPlan] = useState<Plan>('free');
  const [isAmoled, setIsAmoled] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Check if amoled was stored previously
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('moviepulse_amoled') === 'true';
      setIsAmoled(stored);
      if (stored) {
        document.documentElement.style.setProperty('--bg', '#000000');
      }
    }
  }, []);

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

  useEffect(() => {
    setPlan(getCurrentPlan());
  }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const closeMenu = () => {
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePreference = () => {
    const nextVal = !isAmoled;
    setIsAmoled(nextVal);
    if (typeof window !== 'undefined') {
      localStorage.setItem('moviepulse_amoled', String(nextVal));
      if (nextVal) {
        document.documentElement.style.setProperty('--bg', '#000000');
      } else {
        document.documentElement.style.setProperty('--bg', '#06040d');
      }
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            aria-hidden="true"
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Floating Header & Dropdown Container */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center w-full px-4 pt-3 sm:pt-4 pointer-events-none">
        {/* Header Capsule */}
        <motion.nav
          initial={{ opacity: 0, y: -14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto rounded-full w-[min(calc(100vw-2rem),760px)] md:w-auto"
          style={{
            height: `${NAV_HEIGHT}px`,
            background: scrolled ? 'rgba(7,5,17,0.92)' : 'rgba(12,9,24,0.76)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: scrolled ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(255,255,255,0.08)',
            boxShadow: scrolled ? '0 14px 42px rgba(0,0,0,0.5)' : '0 8px 26px rgba(0,0,0,0.3)',
            transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
          }}
        >
          <div className="w-full h-full px-4 sm:px-5 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 flex-shrink-0 group pr-1"
              aria-label="MoviePulse Home"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neon-pink to-neon-purple flex items-center justify-center p-0.5 shadow-[0_0_12px_rgba(255,0,110,0.3)] transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/logo.png"
                  alt="MoviePulse Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="text-[15px] font-extrabold text-white tracking-tight transition-colors duration-200">
                MoviePulse
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1 rounded-full bg-white/[0.035] border border-white/[0.06] p-1">
              {navLinks.map(link => {
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-white/60 transition-colors duration-200 hover:text-white"
                    aria-current={active ? 'page' : undefined}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-full bg-white/[0.09] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative whitespace-nowrap">{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Desktop Action CTA */}
            <div className="hidden md:flex items-center pl-1">
              <Link
                href="/pricing"
                className="px-4 py-1.5 rounded-full text-xs font-black tracking-wider text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                style={{
                  background: 'linear-gradient(90deg, #FF006E 0%, #D946EF 100%)',
                  boxShadow: '0 4px 15px rgba(255, 0, 110, 0.3)',
                }}
              >
                {plan === 'free' ? 'GET PREMIUM' : 'MY PLAN'}
              </Link>
            </div>

            {/* Mobile Toggle Button */}
            <button
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(value => !value)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-full text-white transition-all duration-200 cursor-pointer"
              style={{
                background: isMenuOpen ? 'rgba(255,0,110,0.14)' : 'rgba(255,255,255,0.08)',
                border: isMenuOpen ? '1px solid rgba(255,0,110,0.25)' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <motion.span
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="flex"
              >
                {isMenuOpen ? <X size={16} /> : <Menu size={16} />}
              </motion.span>
            </button>
          </div>
        </motion.nav>

        {/* Mobile Dropdown Overlay Card */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden pointer-events-auto w-[min(calc(100vw-2rem),760px)] mt-2 bg-[#09080e]/95 backdrop-blur-2xl border border-white/[0.08] rounded-[2rem] p-5 shadow-[0_24px_50px_rgba(0,0,0,0.8),0_0_24px_rgba(255,0,110,0.05)] flex flex-col gap-3.5"
            >
              {/* Menu Links */}
              <nav className="flex flex-col gap-1">
                {navLinks.map(link => {
                  const active = isActive(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenu}
                      className="flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200"
                      style={{
                        color: active ? '#ffffff' : 'rgba(255,255,255,0.64)',
                        background: active
                          ? 'linear-gradient(90deg, rgba(255,0,110,0.15) 0%, rgba(124,58,237,0.06) 100%)'
                          : 'transparent',
                        boxShadow: active ? 'inset 3px 0 0 #FF006E' : 'none',
                      }}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Separator */}
              <div className="border-t border-white/[0.06] my-0.5" />

              {/* Preference Row */}
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-[14px] font-semibold text-white/60">Preference</span>
                <button
                  onClick={togglePreference}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-200 cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isAmoled ? '0 0 12px rgba(124,58,237,0.2)' : '0 0 12px rgba(255,0,110,0.15)',
                  }}
                  aria-label="Toggle amoled black theme preference"
                >
                  {isAmoled ? (
                    <Moon size={14} className="text-neon-purple animate-pulse" />
                  ) : (
                    <Sun size={14} className="text-neon-pink" />
                  )}
                </button>
              </div>

              {/* CTA Button */}
              <div className="px-2 pt-1 pb-2">
                <Link
                  href="/pricing"
                  onClick={closeMenu}
                  className="block w-full py-3.5 rounded-full text-center text-sm font-black tracking-wider text-white transition-all duration-300 active:scale-95 shadow-xl hover:brightness-110"
                  style={{
                    background: 'linear-gradient(90deg, #FF006E 0%, #D946EF 100%)',
                    boxShadow: '0 6px 20px rgba(255, 0, 110, 0.35)',
                  }}
                >
                  {plan === 'free' ? 'UPGRADE PLAN' : 'MANAGE SUBSCRIPTION'}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
