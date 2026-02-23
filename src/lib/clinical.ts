import type { SantaanBlogPost } from '@/lib/medium';

export interface ClinicalQuality {
  wordCount: number;
  hasStructuredSections: boolean;
  hasCitationSignals: boolean;
  hasReferenceHeading: boolean;
  citationLinkCount: number;
  isSubstantive: boolean;
  isReady: boolean;
}

const CLINICAL_COVER_IMAGES = [
  '/assets/clinical-cover-1.svg',
  '/assets/clinical-cover-2.svg',
  '/assets/clinical-cover-3.svg',
  '/assets/clinical-cover-4.svg',
];

const TRUSTED_CITATION_DOMAINS = [
  'doi.org',
  'pubmed.ncbi.nlm.nih.gov',
  'ncbi.nlm.nih.gov',
  'nejm.org',
  'thelancet.com',
  'nature.com',
  'sciencedirect.com',
  'oxfordacademic.com',
  'jamanetwork.com',
  'wiley.com',
  'springer.com',
  'bmj.com',
  'frontiersin.org',
];

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

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getCitationLinks(html: string): string[] {
  const matches = Array.from(html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi));
  const links = matches.map((match) => match[1]).filter(Boolean);
  return links.filter((href) => TRUSTED_CITATION_DOMAINS.some((domain) => href.includes(domain)));
}

export function getClinicalQuality(post: SantaanBlogPost): ClinicalQuality {
  const html = post.html || '';
  const plain = stripHtml(html);
  const wordCount = plain.split(/\s+/).filter(Boolean).length;

  const hasStructuredSections = /<h[1-6]|<ol|<ul/i.test(html);
  const hasReferenceHeading = /(>|\s)(references|citations|sources)\s*(<|$)/i.test(plain) || /<h[1-6][^>]*>\s*(references|citations|sources)\s*<\/h[1-6]>/i.test(html);
  const doiOrPmidSignal = /\bdoi:\s*10\.\d{4,9}\/[-._;()/:a-z0-9]+\b|\bPMID[:\s]*\d{5,9}\b/i.test(plain);
  const citationLinks = getCitationLinks(html);
  const citationLinkCount = citationLinks.length;
  const hasCitationSignals = doiOrPmidSignal || hasReferenceHeading || citationLinkCount >= 1;

  const isSubstantive = wordCount >= 260;
  const isReady = isSubstantive && hasStructuredSections && hasCitationSignals;

  return {
    wordCount,
    hasStructuredSections,
    hasCitationSignals,
    hasReferenceHeading,
    citationLinkCount,
    isSubstantive,
    isReady,
  };
}

export function isClinicalReadyPost(post: SantaanBlogPost): boolean {
  if (post.type !== 'doctor') return false;
  return getClinicalQuality(post).isReady;
}

export function getClinicalCoverImage(post: SantaanBlogPost): string {
  const allowOriginal = post.tags.some((tag) => tag.toLowerCase() === 'clinical-image-approved');
  if (allowOriginal && post.thumbnail) {
    return post.thumbnail;
  }
  return CLINICAL_COVER_IMAGES[hashString(post.slug) % CLINICAL_COVER_IMAGES.length];
}
