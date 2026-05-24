import CategoryPage from '@/components/CategoryPage';
import { getMoviesByCategory } from '@/lib/mockMovies';

export const metadata = {
  title: 'Top Rated Movies | MovieDrop',
  description: 'Browse the highest rated movies.',
};

export default function TopRatedPage() {
  const topRatedMovies = getMoviesByCategory('top-rated');

  return <CategoryPage title="Top Rated" movies={topRatedMovies} />;
}
