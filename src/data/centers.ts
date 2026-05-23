export interface CenterContact {
  name: string;
  phones: string[];
  city: string;
}

export interface CenterProfile extends CenterContact {
  slug: string;
  href: string;
  centerName: string;
  fullAddress: string;
  addressLine: string;
  region: string;
  email: string;
  summary: string;
  landmark?: string;
  mapUrl?: string;
  mapQuery: string;
  hours: string[];
  areaServed: string[];
  reviews?: Array<{
    author: string;
    meta: string;
    quote: string;
  }>;
}

function buildMapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export const CENTER_PROFILES: CenterProfile[] = [
  {
    name: 'Berhampur',
    city: 'Berhampur',
    slug: 'ivf-clinic-berhampur',
    href: '/ivf-clinic-berhampur',
    centerName: 'Santaan IVF Berhampur',
    fullAddress: 'Gajapati Nagar 1st Ln, off Sales Tax Square, Extn, Gajapati Nagar, Brahmapur, Odisha 760004',
    addressLine: 'Gajapati Nagar 1st Ln, off Sales Tax Square, Extn, Gajapati Nagar, Brahmapur, Odisha 760004',
    region: 'Odisha',
    email: 'info@santaan.in',
    phones: ['+91 7008990582', '+91 9777989739'],
    summary:
      'A South Odisha access point for fertility workup, IVF planning, and coordinated follow-up for couples who want specialist guidance closer to home.',
    landmark: 'Near Nidaan',
    mapUrl: 'https://maps.app.goo.gl/EFrxERJccp1TAkvZ6',
    mapQuery: 'Santaan IVF Berhampur Odisha',
    hours: [
      'Monday: 9:30 am - 6:30 pm',
      'Tuesday: 9:30 am - 6:30 pm',
      'Wednesday: 9:30 am - 6:30 pm',
      'Thursday: 9:30 am - 6:30 pm',
      'Friday: 9:30 am - 6:30 pm',
      'Saturday: 9:30 am - 6:30 pm',
      'Sunday: Closed',
    ],
    areaServed: ['Berhampur', 'Ganjam', 'South Odisha'],
    reviews: [
      {
        author: 'Santosh Kumar Sahu',
        meta: '6 months ago',
        quote:
          "Heartly thanks to Deepika madam. Madam's calm words and treatment helped bless us with a baby boy. The staff were cooperative and supportive throughout the journey.",
      },
      {
        author: 'Nilu Sahu',
        meta: '6 months ago',
        quote:
          'Heartly thanks to Deepika madam. Her treatment, hope, and calm guidance supported us, and the staff made the journey feel warm and familiar.',
      },
      {
        author: 'Sasmita Sahu',
        meta: '4 months ago',
        quote:
          'Our parenthood and pregnancy journey was very good at Santaan Hospital, and it was possible because of Dr. Deepika and the entire staff.',
      },
    ],
  },
  {
    name: 'Bhubaneswar',
    city: 'Bhubaneswar',
    slug: 'ivf-clinic-bhubaneswar',
    href: '/ivf-clinic-bhubaneswar',
    centerName: 'Santaan IVF Bhubaneswar',
    fullAddress: '3rd Floor, Utkal Pristine, N-5 Plot, IRC Village, Nayapalli, Bhubaneswar, Odisha 751012',
    addressLine: '3rd Floor, Utkal Pristine, IRC Village, Nayapalli, Bhubaneswar, Odisha 751012',
    region: 'Odisha',
    email: 'info@santaan.in',
    phones: ['070089 90586'],
    summary:
      'Our Odisha hub for IVF, ICSI, male-factor review, fertility diagnostics, and step-wise treatment planning built around each couple’s reports and timelines.',
    landmark: 'Above Max Nayapalli',
    mapUrl: 'https://maps.app.goo.gl/g9vKkCU4Xgoikjz86',
    mapQuery: 'Santaan IVF Bhubaneswar Odisha',
    hours: [
      'Monday: 9:30 am - 6:30 pm',
      'Tuesday: 9:30 am - 6:30 pm',
      'Wednesday: 9:30 am - 6:30 pm',
      'Thursday: 9:30 am - 6:30 pm',
      'Friday: 9:30 am - 6:30 pm',
      'Saturday: 9:30 am - 6:30 pm',
      'Sunday: Closed',
    ],
    areaServed: ['Bhubaneswar', 'Khordha', 'Coastal Odisha'],
    reviews: [
      {
        author: 'Sudip Saha',
        meta: 'a month ago',
        quote:
          'After 14 years of marriage and many consultations, our IVF turned positive. The doctor, nurses, and support staff were very helpful through the journey.',
      },
      {
        author: 'Rajat Sharma',
        meta: '10 months ago',
        quote:
          'Dr. Kanika is very helpful with patients and the team gives strong treatment support to couples visiting the Bhubaneswar center.',
      },
      {
        author: 'Alok Ojha',
        meta: '11 months ago',
        quote:
          'If you are looking for a fertility clinic in Bhubaneswar, Santaan stands out for its expert team and modern facilities.',
      },
      {
        author: 'Dipak Biswal',
        meta: '2 years ago',
        quote:
          'The interaction from Dr. Kanika Panda and the nursing staff felt positive, caring, and helpful, and gave us a new ray of hope.',
      },
    ],
  },
  {
    name: 'Angul',
    city: 'Angul',
    slug: 'ivf-clinic-angul',
    href: '/ivf-clinic-angul',
    centerName: 'Santaan IVF Angul',
    fullAddress: 'Shankar Cinema Rd, Bazarapada, Angul, Odisha 759122',
    addressLine: 'Shankar Cinema Rd, Bazarapada, Angul, Odisha 759122',
    region: 'Odisha',
    email: 'info@santaan.in',
    phones: ['+91 7008990586'],
    summary:
      'A local fertility access point for Angul families who need early evaluation, practical next steps, and a smoother path into specialist-led treatment planning.',
    landmark: 'In front of Reliance Digital',
    mapUrl: 'https://maps.app.goo.gl/W8jZwYZWX3yEtAeq7',
    mapQuery: 'Santaan IVF Angul Odisha',
    hours: [],
    areaServed: ['Angul', 'Talcher', 'Central Odisha'],
    reviews: [],
  },
  {
    name: 'Bangalore (AECS Layout)',
    city: 'Bangalore',
    slug: 'ivf-clinic-bangalore-aecs-layout',
    href: '/ivf-clinic-bangalore-aecs-layout',
    centerName: 'Santaan IVF Bangalore AECS Layout',
    fullAddress: 'AECS Layout, Brookefield, Bengaluru, Karnataka',
    addressLine: 'AECS Layout, Brookefield, Bengaluru, Karnataka',
    region: 'Karnataka',
    email: 'info@santaan.in',
    phones: ['+91 8105108416'],
    summary:
      'Built for the Bengaluru IT corridor, with privacy-conscious fertility planning, structured diagnostics, and continuity-friendly support for busy professionals.',
    mapQuery: 'Santaan IVF AECS Layout Brookefield Bengaluru',
    hours: [],
    areaServed: ['AECS Layout', 'Brookefield', 'Whitefield', 'Bengaluru IT Corridor'],
  },
];

export const CENTER_CONTACTS: CenterContact[] = CENTER_PROFILES.map(({ name, phones, city }) => ({
  name,
  phones,
  city,
}));

export const PRIMARY_CENTER = CENTER_PROFILES.find((center) => center.city === 'Bhubaneswar') ?? CENTER_PROFILES[0];
export const PRIMARY_CALL_NUMBER = '+91 80 6548 1541';
export const PRIMARY_CALL_HREF = `tel:${PRIMARY_CALL_NUMBER.replace(/[^0-9+]/g, "")}`;
export const PRIMARY_WHATSAPP_NUMBER = '919668904011';
export const PRIMARY_WHATSAPP_MESSAGE = "Hi, I'd like more info on IVF";
export const PRIMARY_WHATSAPP_BOOKING_MESSAGE = "Hi, I'd like to book a consultation";
export function buildPrimaryWhatsappUrl(message: string = PRIMARY_WHATSAPP_MESSAGE) {
  return `https://wa.me/${PRIMARY_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
export const PRIMARY_WHATSAPP_URL = buildPrimaryWhatsappUrl();
export const PRIMARY_WHATSAPP_BOOKING_URL = buildPrimaryWhatsappUrl(PRIMARY_WHATSAPP_BOOKING_MESSAGE);
export const PRACTO_BOOKING_URL =
  'https://www.practo.com/ganjam/clinic/santaan-fertility-centre-and-research-institute-berhampur-city/infertility-specialist-ps-329';

export function getCenterProfileByCity(city?: string | null) {
  if (!city) return null;
  return CENTER_PROFILES.find((center) => center.city.toLowerCase() === city.toLowerCase()) ?? null;
}

export function getCenterProfileBySlug(slug?: string | null) {
  if (!slug) return null;
  return CENTER_PROFILES.find((center) => center.slug === slug) ?? null;
}

export function getCenterMapsUrl(center: Pick<CenterProfile, 'mapQuery'>) {
  return 'mapUrl' in center && typeof center.mapUrl === 'string' && center.mapUrl.length > 0
    ? center.mapUrl
    : buildMapsSearchUrl(center.mapQuery);
}
