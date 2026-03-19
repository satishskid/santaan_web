import { CENTER_CONTACTS, PRIMARY_CALL_NUMBER } from '@/data/centers';
import { getSiteUrl } from '@/lib/site';

interface FaqItem {
  question: string;
  answer: string;
}

export function buildFaqSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildOrganizationSchema() {
  const baseUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: 'Santaan IVF',
    url: baseUrl,
    logo: `${baseUrl}/favicon.ico`,
    telephone: PRIMARY_CALL_NUMBER,
    sameAs: [
      'https://www.facebook.com/santaanfertilityclinic',
      'https://www.instagram.com/santaan_fertility/',
      'https://x.com/SantaanIVF',
      'https://www.linkedin.com/school/santaan-fertility-center-and-research-institute/',
      'https://medium.com/@santaanIVF',
    ],
    areaServed: CENTER_CONTACTS.map((center) => ({
      '@type': 'City',
      name: center.city,
    })),
  };
}

export function buildLocalClinicSchemas() {
  const baseUrl = getSiteUrl();
  return CENTER_CONTACTS.map((center) => ({
    // Use service-page canonicals for cities with dedicated pages.
    // Fallback to contact centres page for other active locations.
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: `Santaan IVF - ${center.name}`,
    url:
      center.city === 'Bhubaneswar'
        ? `${baseUrl}/ivf-clinic-bhubaneswar`
        : center.city === 'Berhampur'
          ? `${baseUrl}/ivf-clinic-berhampur`
          : center.city === 'Bangalore'
            ? `${baseUrl}/ivf-clinic-bangalore-aecs-layout`
            : `${baseUrl}/contact-centres`,
    telephone: center.phones[0],
    areaServed: center.city,
    address: {
      '@type': 'PostalAddress',
      addressLocality: center.city,
      addressCountry: 'IN',
    },
    medicalSpecialty: 'ReproductiveHealth',
  }));
}

export function buildBlogPostingSchema(input: {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  modifiedAt: string;
  image?: string;
  author?: string;
  keywords?: string[];
}) {
  const baseUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    datePublished: input.publishedAt,
    dateModified: input.modifiedAt,
    url: input.url,
    image: input.image || `${baseUrl}/assets/hero-family.png`,
    author: {
      '@type': 'Person',
      name: input.author || 'Santaan Editorial Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Santaan IVF',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/favicon.ico`,
      },
    },
    keywords: (input.keywords || []).join(', '),
    mainEntityOfPage: input.url,
  };
}
