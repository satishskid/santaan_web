import type { MetadataRoute } from 'next';
import { servicePageSlugs } from '@/content/servicePages';
import { isClinicalReadyPost } from '@/lib/clinical';
import { getSantaanBlogPosts } from '@/lib/medium';
import { isPatientReadyPost } from '@/lib/patient-content';
import { getSiteUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const baseUrl = getSiteUrl();

  const staticRoutes = [
    '/',
    '/know-your-score',
    '/fertility-conditions',
    '/fertility-guides',
    '/fertility-tips',
    '/fertility-insights',
    '/clinical-insights',
    '/contact-centres',
    '/our-doctors',
    '/at-home-fertility-testing',
    '/pricing',
    '/success-rates',
    '/treatments',
    '/privacy',
    '/terms',
  ];

  const serviceRoutes = servicePageSlugs.map((slug) => `/${slug}`);

  const blogPosts = await getSantaanBlogPosts({ limit: 160 }).catch(() => []);
  const readyPosts = blogPosts.filter((post) => (post.type === 'doctor' ? isClinicalReadyPost(post) : isPatientReadyPost(post)));

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

  const blogEntries = readyPosts.map((post) => {
    const route = post.type === 'doctor' ? `/clinical-insights/${post.slug}` : `/fertility-insights/${post.slug}`;
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
