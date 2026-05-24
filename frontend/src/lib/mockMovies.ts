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
}

export const mockMovies: Movie[] = [
  // Upcoming
  {
    id: 1,
    title: 'Dune: Part Three',
    posterPath: '/images/dune_part_three_poster.png',
    backdropPath: '/images/dune_part_three_backdrop.png',
    releaseDate: '2026-12-18',
    overview:
      'The final chapter of Paul Atreides journey as he navigates political intrigue and war on the desert planet Arrakis.',
    rating: 8.5,
    genres: ['Sci-Fi', 'Action', 'Drama'],
    runtime: 166,
    category: 'upcoming',
    trailerUrl: 'https://www.youtube.com/embed/tjrX3USeF2k',
    cast: [
      {
        id: 1,
        name: 'Timothée Chalamet',
        character: 'Paul Atreides',
        profilePath: 'https://picsum.photos/200/300?random=1',
      },
      {
        id: 2,
        name: 'Zendaya',
        character: 'Chani',
        profilePath: 'https://picsum.photos/200/300?random=2',
      },
      {
        id: 3,
        name: 'Austin Butler',
        character: 'Feyd-Rautha',
        profilePath: 'https://picsum.photos/200/300?random=3',
      },
    ],
  },
  {
    id: 2,
    title: 'Avatar: The Way of Water 2',
    posterPath: 'https://picsum.photos/400/600?random=4',
    backdropPath: 'https://picsum.photos/1200/400?random=4',
    releaseDate: '2026-08-15',
    overview:
      'The continuation of Jakes journey in Pandora as new threats emerge and alliances are tested.',
    rating: 8.2,
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    runtime: 190,
    category: 'upcoming',
    trailerUrl: 'https://www.youtube.com/embed/Ea1yLqEpqXQ',
    cast: [
      {
        id: 4,
        name: 'Sam Worthington',
        character: 'Jake Sully',
        profilePath: 'https://picsum.photos/200/300?random=5',
      },
      {
        id: 5,
        name: 'Zoe Saldana',
        character: 'Neytiri',
        profilePath: 'https://picsum.photos/200/300?random=6',
      },
    ],
  },
  {
    id: 3,
    title: 'Deadpool & Wolverine 3',
    posterPath: 'https://picsum.photos/400/600?random=7',
    backdropPath: 'https://picsum.photos/1200/400?random=7',
    releaseDate: '2026-07-26',
    overview:
      'The Merc with a Mouth and the mutant wolverine team up for an explosive adventure.',
    rating: 8.0,
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    runtime: 128,
    category: 'upcoming',
    trailerUrl: 'https://www.youtube.com/embed/1_VT0KW_i40',
    cast: [
      {
        id: 6,
        name: 'Ryan Reynolds',
        character: 'Deadpool',
        profilePath: 'https://picsum.photos/200/300?random=8',
      },
      {
        id: 7,
        name: 'Hugh Jackman',
        character: 'Wolverine',
        profilePath: 'https://picsum.photos/200/300?random=9',
      },
    ],
  },

  // Now Playing
  {
    id: 4,
    title: 'Inside Out 3',
    posterPath: 'https://picsum.photos/400/600?random=10',
    backdropPath: 'https://picsum.photos/1200/400?random=10',
    releaseDate: '2024-06-14',
    overview:
      'An emotional journey through the mind of a teenage girl as she navigates growing up.',
    rating: 8.8,
    genres: ['Animation', 'Comedy', 'Drama'],
    runtime: 96,
    category: 'now-playing',
    trailerUrl: 'https://www.youtube.com/embed/xdvP_xWBfOE',
    cast: [
      {
        id: 8,
        name: 'Amy Poehler',
        character: 'Joy',
        profilePath: 'https://picsum.photos/200/300?random=11',
      },
      {
        id: 9,
        name: 'Maya Hawke',
        character: 'Anxiety',
        profilePath: 'https://picsum.photos/200/300?random=12',
      },
    ],
  },
  {
    id: 5,
    title: 'Bad Boys: Ride or Die',
    posterPath: 'https://picsum.photos/400/600?random=13',
    backdropPath: 'https://picsum.photos/1200/400?random=13',
    releaseDate: '2024-06-07',
    overview:
      'Miami detectives uncover a dangerous conspiracy while testing their friendship and loyalty.',
    rating: 7.9,
    genres: ['Action', 'Comedy', 'Crime'],
    runtime: 115,
    category: 'now-playing',
    trailerUrl: 'https://www.youtube.com/embed/G1kkixW-r3c',
    cast: [
      {
        id: 10,
        name: 'Will Smith',
        character: 'Mike Lowrey',
        profilePath: 'https://picsum.photos/200/300?random=14',
      },
      {
        id: 11,
        name: 'Martin Lawrence',
        character: 'Marcus Burnett',
        profilePath: 'https://picsum.photos/200/300?random=15',
      },
    ],
  },
  {
    id: 6,
    title: 'A Quiet Place: Day One',
    posterPath: 'https://picsum.photos/400/600?random=16',
    backdropPath: 'https://picsum.photos/1200/400?random=16',
    releaseDate: '2024-06-28',
    overview:
      'A prequel exploring the origins of the silent alien creatures and how the world changed.',
    rating: 7.6,
    genres: ['Horror', 'Thriller', 'Sci-Fi'],
    runtime: 99,
    category: 'now-playing',
    trailerUrl: 'https://www.youtube.com/embed/wSVMNz3hs7k',
    cast: [
      {
        id: 12,
        name: 'Lupita Nyongo',
        character: 'Mae',
        profilePath: 'https://picsum.photos/200/300?random=17',
      },
      {
        id: 13,
        name: 'Joseph Quinn',
        character: 'Eric',
        profilePath: 'https://picsum.photos/200/300?random=18',
      },
    ],
  },

  // Popular
  {
    id: 7,
    title: 'The Shawshank Redemption',
    posterPath: 'https://picsum.photos/400/600?random=19',
    backdropPath: 'https://picsum.photos/1200/400?random=19',
    releaseDate: '1994-09-23',
    overview:
      'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    rating: 9.3,
    genres: ['Drama', 'Crime'],
    runtime: 142,
    category: 'popular',
    cast: [
      {
        id: 14,
        name: 'Tim Robbins',
        character: 'Andy Dufresne',
        profilePath: 'https://picsum.photos/200/300?random=20',
      },
      {
        id: 15,
        name: 'Morgan Freeman',
        character: 'Ellis Boyd Redding',
        profilePath: 'https://picsum.photos/200/300?random=21',
      },
    ],
  },
  {
    id: 8,
    title: 'Inception',
    posterPath: 'https://picsum.photos/400/600?random=22',
    backdropPath: 'https://picsum.photos/1200/400?random=22',
    releaseDate: '2010-07-16',
    overview:
      'A skilled thief infiltrates the dreams of corporate executives to steal their secrets.',
    rating: 8.8,
    genres: ['Sci-Fi', 'Action', 'Thriller'],
    runtime: 148,
    category: 'popular',
    trailerUrl: 'https://www.youtube.com/embed/8zQcxurwtFs',
    cast: [
      {
        id: 16,
        name: 'Leonardo DiCaprio',
        character: 'Cobb',
        profilePath: 'https://picsum.photos/200/300?random=23',
      },
      {
        id: 17,
        name: 'Marion Cotillard',
        character: 'Mal',
        profilePath: 'https://picsum.photos/200/300?random=24',
      },
    ],
  },
  {
    id: 9,
    title: 'The Dark Knight',
    posterPath: 'https://picsum.photos/400/600?random=25',
    backdropPath: 'https://picsum.photos/1200/400?random=25',
    releaseDate: '2008-07-18',
    overview:
      'Batman battles a criminal mastermind known as The Joker, a criminal psychopath who wants to plunge Gotham into anarchy.',
    rating: 9.0,
    genres: ['Action', 'Crime', 'Drama'],
    runtime: 152,
    category: 'popular',
    trailerUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY',
    cast: [
      {
        id: 18,
        name: 'Christian Bale',
        character: 'Bruce Wayne',
        profilePath: 'https://picsum.photos/200/300?random=26',
      },
      {
        id: 19,
        name: 'Heath Ledger',
        character: 'The Joker',
        profilePath: 'https://picsum.photos/200/300?random=27',
      },
    ],
  },

  // Top Rated
  {
    id: 10,
    title: 'The Godfather',
    posterPath: 'https://picsum.photos/400/600?random=28',
    backdropPath: 'https://picsum.photos/1200/400?random=28',
    releaseDate: '1972-03-24',
    overview:
      'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant youngest son.',
    rating: 9.2,
    genres: ['Crime', 'Drama'],
    runtime: 175,
    category: 'top-rated',
    cast: [
      {
        id: 20,
        name: 'Marlon Brando',
        character: 'Vito Corleone',
        profilePath: 'https://picsum.photos/200/300?random=29',
      },
      {
        id: 21,
        name: 'Al Pacino',
        character: 'Michael Corleone',
        profilePath: 'https://picsum.photos/200/300?random=30',
      },
    ],
  },
  {
    id: 11,
    title: 'Pulp Fiction',
    posterPath: 'https://picsum.photos/400/600?random=31',
    backdropPath: 'https://picsum.photos/1200/400?random=31',
    releaseDate: '1994-10-14',
    overview:
      'The lives of two mob hitmen, a boxer, a gangsters wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    rating: 8.9,
    genres: ['Crime', 'Drama'],
    runtime: 154,
    category: 'top-rated',
    trailerUrl: 'https://www.youtube.com/embed/s7EdQ4FqSTM',
    cast: [
      {
        id: 22,
        name: 'John Travolta',
        character: 'Vincent Vega',
        profilePath: 'https://picsum.photos/200/300?random=32',
      },
      {
        id: 23,
        name: 'Samuel L. Jackson',
        character: 'Jules Winnfield',
        profilePath: 'https://picsum.photos/200/300?random=33',
      },
    ],
  },
  {
    id: 12,
    title: 'Forrest Gump',
    posterPath: 'https://picsum.photos/400/600?random=34',
    backdropPath: 'https://picsum.photos/1200/400?random=34',
    releaseDate: '1994-07-06',
    overview:
      'The presidencies of Kennedy and Johnson unfold through the perspective of an Alabama man with an IQ of 75.',
    rating: 8.8,
    genres: ['Drama', 'Romance'],
    runtime: 142,
    category: 'top-rated',
    cast: [
      {
        id: 24,
        name: 'Tom Hanks',
        character: 'Forrest Gump',
        profilePath: 'https://picsum.photos/200/300?random=35',
      },
      {
        id: 25,
        name: 'Sally Field',
        character: 'Mrs. Gump',
        profilePath: 'https://picsum.photos/200/300?random=36',
      },
    ],
  },
];

export const GENRES = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'Animation',
];

export const getMoviesByCategory = (category: string): Movie[] => {
  return mockMovies.filter(
    (movie) => movie.category === category
  );
};

export const getMoviesByGenre = (genre: string): Movie[] => {
  return mockMovies.filter((movie) =>
    movie.genres.includes(genre)
  );
};

export const getMovieById = (id: number): Movie | undefined => {
  return mockMovies.find((movie) => movie.id === id);
};

export const getRelatedMovies = (
  movieId: number,
  limit: number = 6
): Movie[] => {
  const movie = getMovieById(movieId);
  if (!movie) return [];

  return mockMovies
    .filter((m) => m.id !== movieId)
    .filter(
      (m) =>
        m.genres.some((g) => movie.genres.includes(g)) ||
        m.category === movie.category
    )
    .slice(0, limit);
};
