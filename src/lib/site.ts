const FALLBACK_SITE_URL = 'https://www.santaan.in';

const normalizeSiteUrlCandidate = (value?: string): string | null => {
  if (!value) return null;

  const trimmed = value.trim();
  const unquoted = trimmed.replace(/^['"]+|['"]+$/g, '').trim();

  return unquoted || null;
};

export const getSiteUrl = (): string => {
  const candidate =
    normalizeSiteUrlCandidate(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalizeSiteUrlCandidate(process.env.NEXTAUTH_URL) ||
    FALLBACK_SITE_URL;
  const normalized = candidate.replace(/\/$/, '');

  try {
    return new URL(normalized).toString().replace(/\/$/, '');
  } catch {
    return FALLBACK_SITE_URL;
  }
};

export const getSiteHost = (): string => {
  try {
    return new URL(getSiteUrl()).host;
  } catch {
    return 'santaan.in';
  }
};
