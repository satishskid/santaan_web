import type { SantaanBlogPost } from '@/lib/medium';

export interface PatientContentQuality {
  wordCount: number;
  hasStructuredSections: boolean;
  hasLongformSignal: boolean;
  isSubstantive: boolean;
  isReady: boolean;
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

export function getPatientContentQuality(post: SantaanBlogPost): PatientContentQuality {
  const html = post.html || '';
  const plain = stripHtml(html);
  const wordCount = plain.split(/\s+/).filter(Boolean).length;

  const hasStructuredSections = /<h[1-6]|<ol|<ul/i.test(html);
  const hasLongformSignal = wordCount >= 700;
  const isSubstantive = wordCount >= 220;
  const isReady = isSubstantive && (hasStructuredSections || hasLongformSignal);

  return {
    wordCount,
    hasStructuredSections,
    hasLongformSignal,
    isSubstantive,
    isReady,
  };
}

export function isPatientReadyPost(post: SantaanBlogPost): boolean {
  if (post.type === 'doctor') return false;
  return getPatientContentQuality(post).isReady;
}
