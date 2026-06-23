export interface CenterContact {
  name: string;
  phones: string[];
  city: string;
  title?: string;
  address?: string;
  description?: string;
  email?: string;
  mapUrl?: string;
  sortOrder?: number;
}

export const CENTER_CONTACTS: CenterContact[] = [
  {
    name: 'Berhampur',
    city: 'Berhampur',
    title: 'Santaan IVF Berhampur',
    address: 'Santaan IVF Centre, Berhampur, Odisha',
    email: 'care@santaan.in',
    description: 'Fertility consultation and IVF planning for South Odisha.',
    phones: ['+91 7008990582', '+91 9777989739'],
    sortOrder: 1,
  },
  {
    name: 'Bhubaneswar',
    city: 'Bhubaneswar',
    title: 'Santaan IVF Bhubaneswar',
    address: '3rd Floor, Utkal Pristine, N-5, Plot, IRC Village, Nayapalli, Bhubaneswar, Odisha 751012',
    email: 'care@santaan.in',
    description: 'Evidence-driven fertility and IVF care in Bhubaneswar.',
    phones: ['+91 8065481541'],
    sortOrder: 2,
  },
  
  {
    name: 'Angul',
    city: 'Angul',
    title: 'Santaan IVF Angul',
    address: 'Santaan IVF Centre, Angul, Odisha',
    email: 'care@santaan.in',
    description: 'Accessible fertility care and consultation support for Angul families.',
    phones: ['+91 7008990586'],
    sortOrder: 3,
  },
  {
    name: 'Bangalore (R&D)',
    city: 'Bangalore',
    title: 'Santaan Bangalore R&D',
    address: 'Brookefield, Bengaluru, Karnataka',
    email: 'care@santaan.in',
    description: 'Technology-enabled fertility evaluation and R&D support in Bangalore.',
    phones: ['+91 8105108416'],
    sortOrder: 4,
  },
];

export const PRIMARY_CENTER = CENTER_CONTACTS[1];
export const PRIMARY_CALL_NUMBER = PRIMARY_CENTER.phones[0];
export const PRIMARY_WHATSAPP_NUMBER = '919668904011';
export const PRIMARY_WHATSAPP_URL = `https://wa.me/${PRIMARY_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello Santaan IVF, I want to discuss fertility consultation options.')}`;
