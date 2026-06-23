import type { BlogType, SantaanBlogPost } from '@/lib/medium';

const DEFAULT_CONTENT_HUB_URL = 'https://www.skids.clinic/api/content/articles';

interface HubArticle {
  articleType: BlogType;
  slug: string;
  title: string;
  metaDescription: string;
  category: string;
  signal?: string;
  primaryKeyword?: string;
  contentHtml: string;
  heroImageUrl?: string;
  socialCaption?: string;
  publishedAt: string;
  updatedAt?: string;
  href: string;
}

function contentHubUrl() {
  return process.env.SANTAAN_CONTENT_HUB_URL || DEFAULT_CONTENT_HUB_URL;
}

function stripHtml(input: string): string {
  return input
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function estimateReadMinutes(html: string): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function uniqueTags(article: HubArticle): string[] {
  return Array.from(
    new Set([article.category, article.primaryKeyword, article.signal].filter((tag): tag is string => Boolean(tag?.trim()))),
  );
}

function mapHubArticle(article: HubArticle): SantaanBlogPost {
  return {
    slug: article.slug,
    title: article.title,
    excerpt: article.metaDescription,
    html: article.contentHtml,
    publishedAt: article.publishedAt,
    author: 'Santaan Editorial Team',
    thumbnail: article.heroImageUrl,
    tags: uniqueTags(article),
    sourceUrl: article.href,
    type: article.articleType === 'doctor' ? 'doctor' : article.articleType === 'news' ? 'news' : 'blog',
    readMinutes: estimateReadMinutes(article.contentHtml),
  };
}

export async function getSantaanHubPosts(options?: { limit?: number; type?: BlogType }): Promise<SantaanBlogPost[]> {
  const url = new URL(contentHubUrl());
  url.searchParams.set('brand', 'santaan');
  url.searchParams.set('limit', String(options?.limit || 100));
  if (options?.type) url.searchParams.set('type', options.type);

  const response = await fetch(url, { next: { revalidate: 300 } });
  if (!response.ok) return [];

  const data = (await response.json()) as { articles?: HubArticle[] };
  return (data.articles || []).map(mapHubArticle);
}

export async function getSantaanHubPostBySlug(slug: string): Promise<SantaanBlogPost | null> {
  const url = new URL(contentHubUrl());
  url.searchParams.set('brand', 'santaan');
  url.searchParams.set('slug', slug);

  const response = await fetch(url, { next: { revalidate: 300 } });
  if (!response.ok) return null;

  const data = (await response.json()) as { article?: HubArticle };
  return data.article ? mapHubArticle(data.article) : null;
}
