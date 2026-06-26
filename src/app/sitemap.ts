import type { MetadataRoute } from 'next';
import { servicePageSlugs } from '@/content/servicePages';
import { getSantaanBlogPosts } from '@/lib/medium';
import { getSiteUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const baseUrl = getSiteUrl();

  const staticRoutes = [
    '/',
    '/news',
    '/fertility-insights',
    '/clinical-insights',
    '/contact-centres',
    '/our-doctors',
    '/at-home-fertility-testing',
    '/privacy',
    '/terms',
  ];

  const serviceRoutes = servicePageSlugs.map((slug) => `/${slug}`);

  const blogPosts = await getSantaanBlogPosts({ limit: 100 }).catch(() => []);

  const staticEntries = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: route === '/' ? 1 : route.startsWith('/ivf-clinic-') ? 0.9 : 0.7,
  }));

  const serviceEntries = serviceRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: route.startsWith('/ivf-clinic-') ? 0.9 : 0.7,
  }));

  const blogEntries = blogPosts.map((post) => {
    const route =
      post.type === 'doctor'
        ? `/clinical-insights/${post.slug}`
        : post.type === 'news'
          ? `/news/${post.slug}`
          : `/fertility-insights/${post.slug}`;
    const lastModified = Number.isNaN(new Date(post.publishedAt).getTime()) ? now : new Date(post.publishedAt);

    return {
      url: `${baseUrl}${route}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    };
  });

  return [...staticEntries, ...serviceEntries, ...blogEntries];
}
