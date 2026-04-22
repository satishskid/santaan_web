import { CENTER_PROFILES, PRIMARY_CALL_NUMBER, getCenterMapsUrl, type CenterProfile } from '@/data/centers';
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
    areaServed: CENTER_PROFILES.map((center) => ({
      '@type': 'City',
      name: center.city,
    })),
  };
}

export function buildMedicalClinicSchema(center: CenterProfile) {
  const baseUrl = getSiteUrl();
  const openingHoursSpecification = center.hours
    .map((entry) => {
      const [day, time] = entry.split(': ');
      const dayMap: Record<string, string> = {
        Monday: 'https://schema.org/Monday',
        Tuesday: 'https://schema.org/Tuesday',
        Wednesday: 'https://schema.org/Wednesday',
        Thursday: 'https://schema.org/Thursday',
        Friday: 'https://schema.org/Friday',
        Saturday: 'https://schema.org/Saturday',
        Sunday: 'https://schema.org/Sunday',
      };

      if (!day || !time || time.toLowerCase() === 'closed' || !dayMap[day]) {
        return null;
      }

      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: dayMap[day],
        opens: '09:30',
        closes: '18:30',
      };
    })
    .filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: center.centerName,
    description: center.summary,
    url: `${baseUrl}${center.href}`,
    telephone: center.phones[0],
    email: center.email,
    hasMap: getCenterMapsUrl(center),
    areaServed: center.areaServed.map((area) => ({
      '@type': 'AdministrativeArea',
      name: area,
    })),
    address: {
      '@type': 'PostalAddress',
      streetAddress: center.fullAddress,
      addressLocality: center.city,
      addressRegion: center.region,
      addressCountry: 'IN',
    },
    medicalSpecialty: 'ReproductiveHealth',
    openingHoursSpecification: openingHoursSpecification.length > 0 ? openingHoursSpecification : undefined,
    review:
      center.reviews && center.reviews.length > 0
        ? center.reviews.slice(0, 2).map((review) => ({
            '@type': 'Review',
            author: {
              '@type': 'Person',
              name: review.author,
            },
            reviewBody: review.quote,
          }))
        : undefined,
  };
}

export function buildLocalClinicSchemas() {
  return CENTER_PROFILES.map((center) => buildMedicalClinicSchema(center));
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
