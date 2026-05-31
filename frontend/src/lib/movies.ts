import { supabase } from './supabase';
import { Movie } from './mockMovies';

export function mapDbMovieToFrontendMovie(dbMovie: any): Movie {
  const getPosterUrl = (path: string | null) => {
    if (!path) return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500';
    if (path.startsWith('http')) return path;
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  const getBackdropUrl = (path: string | null) => {
    if (!path) return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200';
    if (path.startsWith('http')) return path;
    return `https://image.tmdb.org/t/p/original${path}`;
  };

  const cast = Array.isArray(dbMovie.cast)
    ? dbMovie.cast.map((c: any) => ({
        id: Number(c.id),
        name: c.name || 'Unknown Actor',
        character: c.character || 'Unknown Character',
        profilePath: c.profile_path
          ? (c.profile_path.startsWith('http') ? c.profile_path : `https://image.tmdb.org/t/p/w185${c.profile_path}`)
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=185',
      }))
    : [];

  const genres = Array.isArray(dbMovie.genres)
    ? dbMovie.genres.map((g: any) => typeof g === 'string' ? g : g.name)
    : [];

  // Convert YouTube watch URL -> embed URL for iframe compatibility
  const rawTrailer: string | undefined = dbMovie.trailer_url || undefined;
  let trailerUrl: string | undefined;
  if (rawTrailer) {
    const watchMatch = rawTrailer.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    trailerUrl = watchMatch
      ? `https://www.youtube.com/embed/${watchMatch[1]}?rel=0&showinfo=0`
      : rawTrailer;
  }

  return {
    id: Number(dbMovie.id),
    title: dbMovie.title || 'Untitled',
    posterPath: getPosterUrl(dbMovie.poster_path),
    backdropPath: getBackdropUrl(dbMovie.backdrop_path),
    releaseDate: dbMovie.release_date || new Date().toISOString().split('T')[0],
    overview: dbMovie.overview || '',
    rating: dbMovie.vote_average ? Number(dbMovie.vote_average) : 0,
    genres: genres.length > 0 ? genres : ['Drama'],
    runtime: dbMovie.runtime || 120,
    cast,
    category: dbMovie.category || 'upcoming',
    trailerUrl,
    watchProviders: dbMovie.watch_providers || undefined,
  };
}

export async function getLiveMoviesByCategory(category: string): Promise<Movie[]> {
  try {
    let query = supabase.from('movies').select('*');

    // Filter by the category column which is populated by the sync pipeline
    if (category === 'upcoming') {
      const today = new Date().toISOString().split('T')[0];
      query = query.eq('category', 'upcoming').gt('release_date', today).order('release_date', { ascending: true });
    } else if (category === 'now-playing') {
      const today = new Date().toISOString().split('T')[0];
      query = query.eq('category', 'now-playing').lte('release_date', today).order('release_date', { ascending: false });
    } else if (category === 'popular') {
      query = query.eq('category', 'popular').order('popularity', { ascending: false });
    } else if (category === 'top-rated') {
      query = query.eq('category', 'top-rated').order('vote_average', { ascending: false });
    } else {
      // fallback — return all
      query = query.order('popularity', { ascending: false });
    }

    const { data, error } = await query.limit(40);
    
    if (error) {
      console.error(`Error fetching movies for category ${category}:`, error);
      return [];
    }

    return (data || []).map(mapDbMovieToFrontendMovie);
  } catch (err) {
    console.error(`Unhandled error in getLiveMoviesByCategory(${category}):`, err);
    return [];
  }
}

export async function getLiveMoviesByGenre(genre: string): Promise<Movie[]> {
  try {
    const { data, error } = await supabase.from('movies').select('*').limit(100);
    
    if (error) {
      console.error(`Error fetching movies for genre ${genre}:`, error);
      return [];
    }

    const mapped = (data || []).map(mapDbMovieToFrontendMovie);
    return mapped.filter(m => m.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
  } catch (err) {
    console.error(`Unhandled error in getLiveMoviesByGenre(${genre}):`, err);
    return [];
  }
}

export async function getLiveMovieById(id: number): Promise<Movie | null> {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching movie ID ${id}:`, error);
      return null;
    }

    if (!data) return null;
    return mapDbMovieToFrontendMovie(data);
  } catch (err) {
    console.error(`Unhandled error in getLiveMovieById(${id}):`, err);
    return null;
  }
}

export async function getLiveRelatedMovies(movieId: number, limit: number = 6): Promise<Movie[]> {
  try {
    const currentMovie = await getLiveMovieById(movieId);
    if (!currentMovie) return [];

    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .neq('id', movieId)
      .limit(50);

    if (error) {
      console.error(`Error fetching related movies for ID ${movieId}:`, error);
      return [];
    }

    const mapped = (data || []).map(mapDbMovieToFrontendMovie);
    
    return mapped
      .filter(m => m.genres.some(g => currentMovie.genres.includes(g)))
      .slice(0, limit);
  } catch (err) {
    console.error(`Unhandled error in getLiveRelatedMovies(${movieId}):`, err);
    return [];
  }
}
