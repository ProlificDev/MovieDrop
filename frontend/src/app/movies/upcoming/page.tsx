import CategoryPage from '@/components/CategoryPage';
import { getLiveMoviesByCategory } from '@/lib/movies';

export const metadata = {
  title: 'Upcoming Movies | MovieDrop',
  description: 'Browse all upcoming movie releases.',
};

export default async function UpcomingPage() {
  const upcomingMovies = await getLiveMoviesByCategory('upcoming');

  return <CategoryPage title="Coming Soon" movies={upcomingMovies} trailerOnly />;
}
