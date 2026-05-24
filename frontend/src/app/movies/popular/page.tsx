import CategoryPage from '@/components/CategoryPage';
import { getMoviesByCategory } from '@/lib/mockMovies';

export const metadata = {
  title: 'Popular Movies | Cinepulse',
  description: 'Browse the most popular movies.',
};

export default function PopularPage() {
  const popularMovies = getMoviesByCategory('popular');

  return <CategoryPage title="Popular" movies={popularMovies} />;
}
