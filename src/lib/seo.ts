import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/site';

const SITE_NAME = 'Santaan IVF';
const DEFAULT_OG_IMAGE = '/assets/hero-family.png';

export interface PageSeoInput {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  type?: 'website' | 'article';
  noIndex?: boolean;
}

function canonicalUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export function buildMetadata({ title, description, path, keywords = [], type = 'website', noIndex = false }: PageSeoInput): Metadata {
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
    robots: noIndex
      ? {
          index: false,
          follow: true,
          googleBot: {
            index: false,
            follow: true,
          },
        }
      : undefined,
  };
}

export const defaultSeoMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  icons: {
    icon: [
      { url: '/favicon.ico' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [{ url: '/favicon.ico' }],
  },
  title: {
    default: 'Santaan IVF | Fertility & IVF Centre in Odisha & Bangalore',
    template: '%s | Santaan IVF',
  },
  description:
    'Evidence-driven fertility and IVF care across Bhubaneswar, Berhampur and Bangalore, backed by compassionate doctors and advanced diagnostics.',
  alternates: {
    canonical: getSiteUrl(),
  },
  openGraph: {
    title: 'Santaan IVF | Fertility & IVF Centre in Odisha & Bangalore',
    description:
      'Evidence-driven fertility and IVF care across Bhubaneswar, Berhampur and Bangalore, backed by compassionate doctors and advanced diagnostics.',
    url: getSiteUrl(),
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
