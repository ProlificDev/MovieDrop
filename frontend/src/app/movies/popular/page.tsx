import CategoryPage from '@/components/CategoryPage';
import { getLiveMoviesByCategory } from '@/lib/movies';

export const revalidate = 3600;

export const metadata = {
  title: 'Popular Movies | MovieDrop',
  description: 'Browse the most popular movies.',
};

export default async function PopularPage() {
  const popularMovies = await getLiveMoviesByCategory('popular');

  return <CategoryPage title="Popular" movies={popularMovies} />;
}
