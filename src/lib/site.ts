const FALLBACK_SITE_URL = 'https://www.santaan.in';

export const getSiteUrl = (): string => {
  const candidate = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || FALLBACK_SITE_URL;
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
