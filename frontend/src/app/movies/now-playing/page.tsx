import CategoryPage from '@/components/CategoryPage';
import { getMoviesByCategory } from '@/lib/mockMovies';

export const metadata = {
  title: 'Now Playing Movies | MovieDrop',
  description: 'Browse all movies currently playing in theaters.',
};

export default function NowPlayingPage() {
  const nowPlayingMovies = getMoviesByCategory('now-playing');

  return (
    <CategoryPage title="Now Playing" movies={nowPlayingMovies} />
  );
}
