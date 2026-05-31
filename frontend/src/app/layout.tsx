import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'MoviePulse CineStream - Stream Premium Movies',
  description: 'Immerse yourself in premium cinematic storytelling. Stream the latest now playing and popular movies in stunning Ultra HD, absolutely free.',
  keywords: 'movies, stream, cinestream, streaming, watch movies, cinema, ultra hd',
  authors: [{ name: 'MoviePulse Team' }],
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

import { ThemeProvider } from '@/components/providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen relative overflow-x-hidden text-center transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
          {/* Organic Glowing Blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-neon-pink/10 rounded-full blur-[150px] pointer-events-none animate-blob-slow-1 z-0" />
          <div className="absolute bottom-[20%] right-[-10%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] bg-neon-teal/10 rounded-full blur-[150px] pointer-events-none animate-blob-slow-2 z-0" />
          <div className="absolute top-[40%] left-[60%] w-[35vw] h-[35vw] max-w-[400px] max-h-[400px] bg-neon-purple/10 rounded-full blur-[130px] pointer-events-none animate-blob-slow-1 z-0" />

          <div className="relative z-10">
            <Navigation />
            <ScrollToTop />
            <main className="pt-24 sm:pt-28">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
