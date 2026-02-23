import type { Metadata } from 'next';

const SITE_URL = 'https://santaan.in';
const SITE_NAME = 'Santaan IVF';
const DEFAULT_OG_IMAGE = '/assets/hero-origin.png';

export interface PageSeoInput {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  type?: 'website' | 'article';
}

function canonicalUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

export function buildMetadata({ title, description, path, keywords = [], type = 'website' }: PageSeoInput): Metadata {
  const canonical = canonicalUrl(path);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'en_IN',
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export const defaultSeoMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/assets/santaan-logo.png', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [{ url: '/assets/santaan-logo.png', type: 'image/png' }],
  },
  title: {
    default: 'Santaan IVF | Fertility & IVF Centre in Odisha & Bangalore',
    template: '%s | Santaan IVF',
  },
  description:
    'Evidence-driven fertility and IVF care across Bhubaneswar, Berhampur and Bangalore, backed by compassionate doctors and advanced diagnostics.',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'Santaan IVF | Fertility & IVF Centre in Odisha & Bangalore',
    description:
      'Evidence-driven fertility and IVF care across Bhubaneswar, Berhampur and Bangalore, backed by compassionate doctors and advanced diagnostics.',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Santaan IVF',
    description: 'Where science meets hope for your shared fertility journey.',
    images: [DEFAULT_OG_IMAGE],
  },
};
