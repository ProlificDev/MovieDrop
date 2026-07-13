import { MetadataRoute } from 'next';

const BASE_URL = 'https://moviedrop.site';

const PUBLIC_ROUTES = [
  { path: '/movies/now-playing', changeFrequency: 'daily' as const, priority: 0.9 },
  { path: '/movies/upcoming', changeFrequency: 'daily' as const, priority: 0.9 },
  { path: '/movies/popular', changeFrequency: 'daily' as const, priority: 0.8 },
  { path: '/movies/top-rated', changeFrequency: 'daily' as const, priority: 0.8 },
  { path: '/movies/genre/action', changeFrequency: 'weekly' as const, priority: 0.7 },
  { path: '/movies/genre/comedy', changeFrequency: 'weekly' as const, priority: 0.7 },
  { path: '/movies/genre/drama', changeFrequency: 'weekly' as const, priority: 0.7 },
  { path: '/movies/genre/horror', changeFrequency: 'weekly' as const, priority: 0.7 },
  { path: '/movies/genre/sci-fi', changeFrequency: 'weekly' as const, priority: 0.7 },
  { path: '/movies/genre/thriller', changeFrequency: 'weekly' as const, priority: 0.7 },
  { path: '/movies/genre/animation', changeFrequency: 'weekly' as const, priority: 0.7 },
  { path: '/movies/genre/romance', changeFrequency: 'weekly' as const, priority: 0.7 },
  { path: '/movies/genre/crime', changeFrequency: 'weekly' as const, priority: 0.7 },
  { path: '/movies/genre/adventure', changeFrequency: 'weekly' as const, priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...PUBLIC_ROUTES.map((route) => ({
      url: `${BASE_URL}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];
}
