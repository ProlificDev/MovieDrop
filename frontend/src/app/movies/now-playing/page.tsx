import CategoryPage from '@/components/CategoryPage';
import { getLiveMoviesByCategory } from '@/lib/movies';

export const metadata = {
  title: 'Now Playing Movies | MovieDrop',
  description: 'Browse all movies currently playing in theaters.',
};

export default async function NowPlayingPage() {
  const nowPlayingMovies = await getLiveMoviesByCategory('now-playing');

  return (
    <CategoryPage title="Now Playing" movies={nowPlayingMovies} />
  );
}
