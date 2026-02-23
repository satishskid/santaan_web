import { CENTER_CONTACTS, PRIMARY_CALL_NUMBER } from '@/data/centers';

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

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: 'Santaan IVF',
    url: 'https://santaan.in',
    logo: 'https://santaan.in/assets/santaan-logo.png',
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
  return CENTER_CONTACTS.map((center) => ({
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: `Santaan IVF - ${center.name}`,
    url:
      center.city === 'Bhubaneswar'
        ? 'https://santaan.in/ivf-clinic-bhubaneswar'
        : center.city === 'Berhampur'
          ? 'https://santaan.in/ivf-clinic-berhampur'
          : 'https://santaan.in/ivf-clinic-bangalore-aecs-layout',
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
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    datePublished: input.publishedAt,
    dateModified: input.modifiedAt,
    url: input.url,
    image: input.image || 'https://santaan.in/assets/hero-origin.png',
    author: {
      '@type': 'Person',
      name: input.author || 'Santaan Editorial Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Santaan IVF',
      logo: {
        '@type': 'ImageObject',
        url: 'https://santaan.in/assets/santaan-logo.png',
      },
    },
    keywords: (input.keywords || []).join(', '),
    mainEntityOfPage: input.url,
  };
}
