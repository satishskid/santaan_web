import { getSantaanHubPostBySlug, getSantaanHubPosts } from '@/lib/skids-content-hub';
import { LEGACY_BLOG_SEEDS } from '@/content/legacyBlogSeeds';

export type BlogType = 'blog' | 'news' | 'doctor';

export interface SantaanBlogPost {
  slug: string;
  title: string;
  excerpt: string;
  html: string;
  publishedAt: string;
  author: string;
  thumbnail?: string;
  tags: string[];
  sourceUrl: string;
  type: BlogType;
  readMinutes: number;
}

function newestFirst(posts: SantaanBlogPost[]): SantaanBlogPost[] {
  return [...posts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

function applyPostLimit(posts: SantaanBlogPost[], limit?: number): SantaanBlogPost[] {
  if (typeof limit !== 'number') return posts;
  return posts.slice(0, Math.max(0, limit));
}

function mergePosts(posts: SantaanBlogPost[], options?: { limit?: number; type?: BlogType }): SantaanBlogPost[] {
  const seen = new Set<string>();
  const merged = [...posts, ...LEGACY_BLOG_SEEDS].filter((post) => {
    if (options?.type && post.type !== options.type) return false;
    if (seen.has(post.slug)) return false;
    seen.add(post.slug);
    return true;
  });

  return applyPostLimit(newestFirst(merged), options?.limit);
}

export async function getSantaanBlogPosts(options?: { limit?: number; type?: BlogType }): Promise<SantaanBlogPost[]> {
  const hubPosts = await getSantaanHubPosts(options).catch((error) => {
    console.error('Santaan content hub fetch failed:', error);
    return [];
  });

  return mergePosts(hubPosts, options);
}

export async function getSantaanBlogPostBySlug(slug: string): Promise<SantaanBlogPost | null> {
  const hubPost = await getSantaanHubPostBySlug(slug).catch((error) => {
    console.error('Santaan content hub slug fetch failed:', error);
    return null;
  });

  return hubPost || LEGACY_BLOG_SEEDS.find((post) => post.slug === slug) || null;
}
