import CategoryPage from '@/components/CategoryPage';
import { getMoviesByCategory } from '@/lib/mockMovies';

export const metadata = {
  title: 'Upcoming Movies | MovieDrop',
  description: 'Browse all upcoming movie releases.',
};

export default function UpcomingPage() {
  const upcomingMovies = getMoviesByCategory('upcoming');

  return <CategoryPage title="Upcoming Releases" movies={upcomingMovies} />;
}
