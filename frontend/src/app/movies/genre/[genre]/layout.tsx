import type { Metadata } from 'next';

export function generateMetadata({ params }: { params: { genre: string } }): Metadata {
  const genre = decodeURIComponent(params.genre).replace(/-/g, ' ');
  const title = genre.replace(/\b\w/g, (letter) => letter.toUpperCase());

  return {
    title: `${title} Movies | MovieDrop`,
    description: `Browse ${title.toLowerCase()} movies and upcoming releases on MovieDrop.`,
    alternates: { canonical: `/movies/genre/${params.genre}` },
  };
}

export default function GenreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
