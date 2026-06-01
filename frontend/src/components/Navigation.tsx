'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { signOut } from '@/lib/auth';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Now Playing', href: '/movies/now-playing' },
  { name: 'Upcoming', href: '/movies/upcoming' },
  { name: 'Alerts', href: '/notifications' },
  { name: 'Pricing', href: '/pricing' },
];

const NAV_HEIGHT = 56;
export { NAV_HEIGHT };

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setIsMenuOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  return (
    <>
      {/* ── Navbar ─────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-4 sm:px-6 pt-3 pointer-events-none">
        <nav
          className="pointer-events-auto rounded-2xl w-full max-w-6xl"
          style={{
            height: `${NAV_HEIGHT}px`,
            background: scrolled ? 'rgba(6,4,13,0.95)' : 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: scrolled ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.06)',
            boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.5)' : '0 4px 24px rgba(0,0,0,0.2)',
            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <div className="w-full h-full px-4 sm:px-5 flex items-center justify-between gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <img src="/logo.png" alt="MovieDrop" className="w-6 h-6 rounded-md transition-transform duration-300 group-hover:scale-110" />
              <span
                className="text-sm font-extrabold bg-clip-text text-transparent hidden sm:block"
                style={{ backgroundImage: 'linear-gradient(90deg,#FF006E,#D946EF,#06B6D4)' }}
              >
                MovieDrop
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {navLinks.map(link => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                    style={{
                      color: active ? '#fff' : 'rgba(200,190,220,0.7)',
                      background: active ? 'rgba(255,0,110,0.13)' : 'transparent',
                    }}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {user ? (
                <>
                  {/* Avatar */}
                  <div className="relative group">
                    <button className="flex items-center gap-2 cursor-pointer">
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt={user.user_metadata?.full_name ?? 'User'}
                          className="w-7 h-7 rounded-full border border-white/20"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-neon-pink/20 border border-neon-pink/30 flex items-center justify-center text-xs font-bold text-neon-pink">
                          {(user.user_metadata?.full_name ?? user.email ?? 'U')[0].toUpperCase()}
                        </div>
                      )}
                    </button>
                  </div>

                  {/* GET PREMIUM */}
                  <Link
                    href="/pricing"
                    className="hidden sm:flex items-center px-3 py-1.5 rounded-xl text-xs font-black text-white transition-all"
                    style={{ background: 'linear-gradient(90deg,#FF006E,#D946EF)', boxShadow: '0 0 15px rgba(255,0,110,0.3)' }}
                  >
                    GET PREMIUM
                  </Link>

                  {/* Sign out */}
                  <button
                    onClick={handleSignOut}
                    className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-white bg-white/[0.04] border border-white/[0.08] transition-all cursor-pointer"
                    title="Sign out"
                  >
                    <LogOut size={13} />
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-xl text-xs font-black text-white transition-all"
                  style={{ background: 'linear-gradient(90deg,#FF006E,#D946EF)', boxShadow: '0 0 15px rgba(255,0,110,0.3)' }}
                >
                  Sign In
                </Link>
              )}

              {/* Hamburger — mobile only */}
              <button
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setIsMenuOpen(v => !v)}
                className="md:hidden flex items-center justify-center w-7 h-7 rounded-md text-white transition-colors cursor-pointer"
                style={{ background: isMenuOpen ? 'rgba(255,0,110,0.18)' : 'rgba(255,255,255,0.05)' }}
              >
                {isMenuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* ── Backdrop ───────────────────────────────────────── */}
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

      {/* ── Mobile Drawer ──────────────────────────────────── */}
      <aside
        className="md:hidden fixed top-0 right-0 bottom-0 z-50 flex flex-col"
        style={{
          width: 'min(75vw, 260px)',
          background: 'rgba(8,4,18,0.98)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <span className="text-sm font-extrabold text-white">Menu</span>
          <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          {navLinks.map(link => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  color: active ? '#fff' : 'rgba(200,190,220,0.75)',
                  background: active ? 'rgba(255,0,110,0.12)' : 'transparent',
                  borderLeft: `3px solid ${active ? '#FF006E' : 'transparent'}`,
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/[0.06] space-y-2">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-2 py-2">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="avatar" className="w-7 h-7 rounded-full" />
                ) : null}
                <span className="text-xs text-gray-400 truncate">{user.user_metadata?.full_name ?? user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white bg-white/[0.04] border border-white/[0.07] transition-all cursor-pointer"
              >
                <LogOut size={14} /> Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-center py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(90deg,#FF006E,#D946EF)' }}
            >
              Sign In
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
