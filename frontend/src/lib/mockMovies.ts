export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface Movie {
  id: number;
  title: string;
  posterPath: string;
  backdropPath: string;
  releaseDate: string;
  overview: string;
  rating: number;
  genres: string[];
  runtime: number;
  cast: Array<{
    id: number;
    name: string;
    character: string;
    profilePath: string;
  }>;
  category: 'upcoming' | 'now-playing' | 'popular' | 'top-rated';
  trailerUrl?: string;
  watchProviders?: {
    link?: string;
    flatrate?: WatchProvider[];
    rent?: WatchProvider[];
    buy?: WatchProvider[];
  };
}

export const mockMovies: Movie[] = [];

export const GENRES = [
  'Action', 'Comedy', 'Drama', 'Horror',
  'Romance', 'Sci-Fi', 'Thriller', 'Animation',
];

export const getMoviesByCategory = (category: string): Movie[] =>
  mockMovies.filter(m => m.category === category);

export const getMoviesByGenre = (genre: string): Movie[] =>
  mockMovies.filter(m => m.genres.includes(genre));

export const getMovieById = (id: number): Movie | undefined =>
  mockMovies.find(m => m.id === id);

export const getRelatedMovies = (movieId: number, limit = 6): Movie[] => {
  const movie = getMovieById(movieId);
  if (!movie) return [];
  return mockMovies
    .filter(m => m.id !== movieId && m.genres.some(g => movie.genres.includes(g)))
    .slice(0, limit);
};
