import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { blogPosts } from '@/db/schema';
import { LEGACY_BLOG_SEEDS } from '@/content/legacyBlogSeeds';

const MEDIUM_FEED_URL = 'https://medium.com/feed/@santaanIVF';
// Add a random cache-busting parameter to bypass rss2json's heavy caching
const RSS2JSON_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(MEDIUM_FEED_URL)}&api_key=${process.env.RSS2JSON_API_KEY || ''}&_cacheBust=${Date.now()}`;

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

interface Rss2JsonItem {
  title?: string;
  pubDate?: string;
  link?: string;
  author?: string;
  thumbnail?: string;
  enclosure?: {
    link?: string;
    type?: string;
  };
  description?: string;
  content?: string;
  categories?: string[];
}

interface Rss2JsonResponse {
  status?: string;
  items?: Rss2JsonItem[];
}

type BlogRow = typeof blogPosts.$inferSelect;

function mergeWithLegacySeeds(posts: SantaanBlogPost[], options?: { limit?: number; type?: BlogType }): SantaanBlogPost[] {
  const existingSlugs = new Set(posts.map((post) => post.slug));
  const eligibleLegacy = LEGACY_BLOG_SEEDS.filter((seed) => !existingSlugs.has(seed.slug));
  const merged = [...posts, ...eligibleLegacy];
  const typeFiltered = options?.type ? merged.filter((post) => post.type === options.type) : merged;
  typeFiltered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  if (typeof options?.limit === 'number') {
    return typeFiltered.slice(0, Math.max(0, options.limit));
  }

  return typeFiltered;
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

function unwrapGoogleSearchRedirect(url: string): string {
  const match = url.match(/^https?:\/\/www\.google\.com\/search\?q=([^&]+).*$/i);
  if (!match) return url;

  try {
    const decoded = decodeURIComponent(match[1]);
    if (/^https?:\/\//i.test(decoded)) {
      return decoded;
    }
  } catch {
    return url;
  }
  return url;
}

function stripInternalPublishingTail(html: string): string {
  if (!html) return html;

  const markerPatterns = [
    /technical\s*(?:<\/?[^>]+>\s*)*publish\s*(?:<\/?[^>]+>\s*)*checklist/i,
    /publish\s*(?:<\/?[^>]+>\s*)*checklist\s*(?:<\/?[^>]+>\s*)*internal/i,
    /internal\s*(?:<\/?[^>]+>\s*)*use/i,
    /publishing\s*(?:<\/?[^>]+>\s*)*account/i,
    /mandatory\s*(?:<\/?[^>]+>\s*)*tags/i,
  ];

  let cutIndex = -1;
  for (const pattern of markerPatterns) {
    const match = html.match(pattern);
    if (!match || typeof match.index !== 'number') continue;
    cutIndex = cutIndex === -1 ? match.index : Math.min(cutIndex, match.index);
  }

  if (cutIndex === -1) return html;

  const blockStart = html.lastIndexOf('<', cutIndex);
  const safeIndex = blockStart >= 0 ? blockStart : cutIndex;
  return html.slice(0, safeIndex);
}

function ensureImageAttributes(html: string): string {
  if (!html) return html;

  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const hasAlt = /\salt\s*=/.test(tag);
    const hasLoading = /\sloading\s*=/.test(tag);
    const hasDecoding = /\sdecoding\s*=/.test(tag);

    let injection = '';
    if (!hasAlt) injection += ' alt=""';
    if (!hasLoading) injection += ' loading="lazy"';
    if (!hasDecoding) injection += ' decoding="async"';

    if (!injection) return tag;
    return tag.replace(/<img\b/i, `<img${injection}`);
  });
}

function sanitizeMediumHtml(input: string): string {
  if (!input) return '';

  let html = input;

  html = stripInternalPublishingTail(html);

  // Drop Medium RSS tracking pixels.
  html = html.replace(
    /<img[^>]+src=["']https?:\/\/medium\.com\/_\/stat\?[^"']+["'][^>]*>/gi,
    ''
  );

  // Unwrap Google "search?q=" redirects into direct links.
  html = html.replace(
    /href=["'](https?:\/\/www\.google\.com\/search\?q=[^"']+)["']/gi,
    (_full, href: string) => `href="${unwrapGoogleSearchRedirect(href)}"`
  );

  // Remove dangling separators often used before internal notes.
  html = html.replace(/<p>\s*[—-]\s*[—-]?\s*<\/p>\s*$/gi, '');
  html = ensureImageAttributes(html);
  html = html.trim();
  return html;
}

function makeSlug(item: Rss2JsonItem): string {
  if (item.link) {
    const lastPath = item.link.split('/').filter(Boolean).pop();
    if (lastPath) {
      return lastPath
        .replace(/\?.*$/, '')
        .replace(/-[a-f0-9]{8,}$/i, '')
        .toLowerCase();
    }
  }

  const title = (item.title || 'fertility-insight').toLowerCase();
  return title
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function normalizeTag(tag: string): string {
  return tag.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function inferTypeFromTags(tags: string[]): BlogType {
  const normalized = tags.map(normalizeTag);
  const isNews = normalized.some((tag) => tag.includes('santaan-news') || tag.includes('announcement'));
  if (isNews) return 'news';

  const isDoctor = normalized.some(
    (tag) =>
      tag.includes('audience-doctor') ||
      tag.includes('for-doctors') ||
      tag.includes('doctor-audience') ||
      tag.includes('doctor-insights') ||
      tag.includes('clinical-update') ||
      tag.includes('clinical-insight') ||
      tag === 'clinical' ||
      tag.includes('clinician-education') ||
      tag.includes('doctor') ||
      tag.includes('clinician')
  );
  if (isDoctor) return 'doctor';

  return 'blog';
}

function inferTypeFromContent(input: { title?: string; excerpt?: string; html?: string }): BlogType {
  const text = `${input.title || ''} ${input.excerpt || ''} ${stripHtml(input.html || '')}`.toLowerCase();

  const hardDoctorSignals = [
    'clinical disclaimer',
    'for clinician education',
    'for clinicians',
    'journal brief',
    'pmid',
    'doi:',
    'clinical protocol',
    'meta-analysis',
    'randomized trial',
  ];

  if (hardDoctorSignals.some((signal) => text.includes(signal))) {
    return 'doctor';
  }

  const softDoctorSignals = [
    'evidence level',
    'protocol insight',
    'clinical implementation',
    'multicenter',
    'non-invasive pgt-a',
    'embryology',
    'implantation potential',
    'follicle intelligence',
  ];
  const softHits = softDoctorSignals.reduce((count, signal) => (text.includes(signal) ? count + 1 : count), 0);
  if (softHits >= 2) {
    return 'doctor';
  }

  return 'blog';
}

function inferPostType(input: { tags: string[]; title?: string; excerpt?: string; html?: string }): BlogType {
  const tagType = inferTypeFromTags(input.tags);
  if (tagType !== 'blog') return tagType;
  return inferTypeFromContent({ title: input.title, excerpt: input.excerpt, html: input.html });
}

function estimateReadMinutes(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function normalizeImageUrl(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  return trimmed;
}

function extractFirstImageUrl(html: string): string | undefined {
  if (!html) return undefined;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return normalizeImageUrl(match?.[1]);
}

function normalizeItem(item: Rss2JsonItem): SantaanBlogPost {
  const html = sanitizeMediumHtml(item.content || item.description || '');
  const plainText = stripHtml(html);
  const excerpt = plainText.slice(0, 180) + (plainText.length > 180 ? '...' : '');
  const tags = (item.categories || []).filter(Boolean);
  const thumbnail =
    normalizeImageUrl(item.thumbnail) ||
    normalizeImageUrl(item.enclosure?.link) ||
    extractFirstImageUrl(html);

  return {
    slug: makeSlug(item),
    title: item.title || 'Untitled Insight',
    excerpt,
    html,
    publishedAt: item.pubDate || new Date().toISOString(),
    author: item.author || 'Santaan Editorial Team',
    thumbnail,
    tags,
    sourceUrl: item.link || MEDIUM_FEED_URL,
    type: inferPostType({ tags, title: item.title, excerpt, html }),
    readMinutes: estimateReadMinutes(plainText),
  };
}

function parseTags(tags: string | null): string[] {
  if (!tags) return [];
  try {
    const parsed: unknown = JSON.parse(tags);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string');
    }
  } catch {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

function toBlogType(
  value: string | null,
  input: { tags: string[]; title?: string; excerpt?: string; html?: string }
): BlogType {
  const normalizedValue = value?.toLowerCase().trim() || null;
  if (normalizedValue === 'clinical' || normalizedValue === 'clinician') {
    return 'doctor';
  }
  if (normalizedValue === 'announcement') {
    return 'news';
  }

  if (normalizedValue === 'blog' || normalizedValue === 'news' || normalizedValue === 'doctor') {
    if (normalizedValue === 'blog') {
      // Backward compatibility: older rows may be stored as "blog" before doctor split.
      const inferred = inferPostType(input);
      return inferred === 'doctor' || inferred === 'news' ? inferred : normalizedValue;
    }
    return normalizedValue;
  }
  return inferPostType(input);
}

function mapRowToPost(row: BlogRow): SantaanBlogPost {
  const html = sanitizeMediumHtml(row.html);
  const plainText = stripHtml(html);
  const tags = parseTags(row.tags);
  const type = toBlogType(row.type, {
    tags,
    title: row.title,
    excerpt: row.excerpt,
    html,
  });
  return {
    slug: row.slug,
    title: row.title,
    excerpt: plainText.slice(0, 180) + (plainText.length > 180 ? '...' : ''),
    html,
    publishedAt: row.publishedAt,
    author: row.author || 'Santaan Editorial Team',
    thumbnail: normalizeImageUrl(row.thumbnail || undefined) || extractFirstImageUrl(html),
    tags,
    sourceUrl: row.sourceUrl,
    type,
    readMinutes: row.readMinutes || estimateReadMinutes(plainText),
  };
}

async function ensureBlogPostsTable() {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      slug text NOT NULL UNIQUE,
      title text NOT NULL,
      excerpt text NOT NULL,
      html text NOT NULL,
      author text DEFAULT 'Santaan Editorial Team',
      thumbnail text,
      tags text DEFAULT '[]',
      source_url text NOT NULL,
      type text DEFAULT 'blog',
      read_minutes integer DEFAULT 1,
      is_active integer DEFAULT true,
      published_at text NOT NULL,
      synced_at text DEFAULT CURRENT_TIMESTAMP,
      updated_at text DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_type_published ON blog_posts(type, published_at DESC)`);
}

async function fetchMediumFeedPosts(options?: { limit?: number; type?: BlogType }): Promise<SantaanBlogPost[]> {
  // Use a dynamic cache-buster so each fetch gets the latest if possible
  const dynamicUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(MEDIUM_FEED_URL)}&api_key=${process.env.RSS2JSON_API_KEY || ''}&_t=${Date.now()}`;
  
  const response = await fetch(dynamicUrl, {
    next: { revalidate: 3600 },
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Medium feed: ${response.status}`);
  }

  const data = (await response.json()) as Rss2JsonResponse;
  if (data.status !== 'ok') {
    throw new Error('Invalid Medium feed response');
  }

  let posts = (data.items || []).map(normalizeItem);

  if (options?.type) {
    posts = posts.filter((post) => post.type === options.type);
  }

  if (typeof options?.limit === 'number') {
    posts = posts.slice(0, Math.max(0, options.limit));
  }

  return mergeWithLegacySeeds(posts, options);
}

async function readStoredPosts(options?: { limit?: number; type?: BlogType }): Promise<SantaanBlogPost[]> {
  await ensureBlogPostsTable();

  const limit = typeof options?.limit === 'number' ? Math.max(1, options.limit) : 50;
  const fetchLimit = options?.type ? Math.max(limit * 5, 120) : limit;

  const rows = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.isActive, true))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(fetchLimit);

  const mapped = rows.map(mapRowToPost);
  const filtered = options?.type ? mapped.filter((post) => post.type === options.type) : mapped;
  return mergeWithLegacySeeds(filtered.slice(0, limit), options);
}

export async function syncMediumPostsToStore(options?: { limit?: number }) {
  await ensureBlogPostsTable();

  const incomingPosts = await fetchMediumFeedPosts({ limit: options?.limit || 60 });

  for (const post of incomingPosts) {
    await db
      .insert(blogPosts)
      .values({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        html: post.html,
        author: post.author,
        thumbnail: post.thumbnail || null,
        tags: JSON.stringify(post.tags),
        sourceUrl: post.sourceUrl,
        type: post.type,
        readMinutes: post.readMinutes,
        isActive: true,
        publishedAt: post.publishedAt,
        syncedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: blogPosts.slug,
        set: {
          title: post.title,
          excerpt: post.excerpt,
          html: post.html,
          author: post.author,
          thumbnail: post.thumbnail || null,
          tags: JSON.stringify(post.tags),
          sourceUrl: post.sourceUrl,
          type: post.type,
          readMinutes: post.readMinutes,
          isActive: true,
          publishedAt: post.publishedAt,
          syncedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
  }

  return {
    synced: incomingPosts.length,
  };
}

export async function getSantaanBlogPosts(options?: { limit?: number; type?: BlogType }): Promise<SantaanBlogPost[]> {
  const storedPosts = await readStoredPosts(options);
  if (storedPosts.length > 0) {
    return storedPosts;
  }

  try {
    await syncMediumPostsToStore({ limit: options?.limit ? Math.max(options.limit, 20) : 60 });
    const refreshedPosts = await readStoredPosts(options);
    if (refreshedPosts.length > 0) {
      return refreshedPosts;
    }
  } catch (error) {
    console.error('Blog sync fallback failed:', error);
  }

  try {
    return await fetchMediumFeedPosts(options);
  } catch (error) {
    console.error('Direct Medium fetch failed:', error);
    return mergeWithLegacySeeds([], options);
  }
}

export async function getSantaanBlogPostBySlug(slug: string): Promise<SantaanBlogPost | null> {
  const legacySeed = LEGACY_BLOG_SEEDS.find((post) => post.slug === slug);
  if (legacySeed) {
    return legacySeed;
  }

  await ensureBlogPostsTable();

  let existing = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.isActive, true)))
    .get();

  if (existing) {
    return mapRowToPost(existing);
  }

  try {
    await syncMediumPostsToStore({ limit: 80 });
    existing = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.isActive, true)))
      .get();

    if (existing) {
      return mapRowToPost(existing);
    }
  } catch (error) {
    console.error('Blog detail sync fallback failed:', error);
  }

  try {
    const posts = await fetchMediumFeedPosts({ limit: 80 });
    const foundInFeed = posts.find((post) => post.slug === slug);
    if (foundInFeed) return foundInFeed;
  } catch (error) {
    console.error('Direct Medium slug fetch failed:', error);
  }

  return null;
}
