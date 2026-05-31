'use client';

import Link from 'next/link';

const links = {
  Browse: [
    { name: 'Now Playing', href: '/movies/now-playing' },
    { name: 'Coming Soon', href: '/movies/upcoming' },
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

        {/* Link columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-12 text-center">
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

        {/* Bottom bar */}
        <div className="border-t border-white/[0.05] pt-8 flex flex-col items-center gap-3 text-center">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} MoviePulse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
