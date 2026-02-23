import type { MetadataRoute } from 'next';
import { servicePageSlugs } from '@/content/servicePages';
import { getSantaanBlogPosts } from '@/lib/medium';

const baseUrl = 'https://santaan.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes = [
    '/',
    '/fertility-insights',
    '/clinical-insights',
    '/contact-centres',
    '/our-doctors',
    '/at-home-fertility-testing',
    '/privacy',
    '/terms',
  ];

  const serviceRoutes = servicePageSlugs.map((slug) => `/${slug}`);

  const blogRoutes = await getSantaanBlogPosts({ limit: 100 })
    .then((posts) =>
      posts.map((post) => (post.type === 'doctor' ? `/clinical-insights/${post.slug}` : `/fertility-insights/${post.slug}`))
    )
    .catch(() => []);

  return [...staticRoutes, ...serviceRoutes, ...blogRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency:
      route.startsWith('/fertility-insights/') || route.startsWith('/clinical-insights/') ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : route.startsWith('/ivf-clinic-') ? 0.9 : 0.7,
  }));
}
