import CategoryPage from '@/components/CategoryPage';
import { getLiveMoviesByCategory } from '@/lib/movies';

export const revalidate = 3600;

export const metadata = {
  title: 'Top Rated Movies | MovieDrop',
  description: 'Browse the highest rated movies.',
};

export default async function TopRatedPage() {
  const topRatedMovies = await getLiveMoviesByCategory('top-rated');

  return <CategoryPage title="Top Rated" movies={topRatedMovies} />;
}
