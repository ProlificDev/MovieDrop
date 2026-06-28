import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import SignInReminder from '@/components/SignInReminder';

// ponytail: next/font inlines font CSS at build time — eliminates render-blocking
// request and FOUT that caused CLS 0.295
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'MovieDrop - Never Miss a Release',
  description: 'Browse now-playing movies, track upcoming releases, and get notified before they hit theatres. No account needed.',
  keywords: 'movies, upcoming movies, movie notifications, cinema, movie tracker',
  authors: [{ name: 'MovieDrop Team' }],
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

import { ThemeProvider } from '@/components/providers';
import { AuthProvider } from '@/components/AuthProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={plusJakarta.variable}>
      <body className="antialiased min-h-screen relative overflow-x-hidden text-center transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
          <AuthProvider>
          {/* Organic Glowing Blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-neon-pink/10 rounded-full blur-[150px] pointer-events-none animate-blob-slow-1 z-0" />
          <div className="absolute bottom-[20%] right-[-10%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] bg-neon-teal/10 rounded-full blur-[150px] pointer-events-none animate-blob-slow-2 z-0" />
          <div className="absolute top-[40%] left-[60%] w-[35vw] h-[35vw] max-w-[400px] max-h-[400px] bg-neon-purple/10 rounded-full blur-[130px] pointer-events-none animate-blob-slow-1 z-0" />

          <div className="relative z-10">
            <Navigation />
            <ScrollToTop />
            <main className="pt-20 sm:pt-24">{children}</main>
            <Footer />
            <SignInReminder />
          </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
