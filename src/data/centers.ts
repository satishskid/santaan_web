export interface CenterContact {
  name: string;
  phones: string[];
  city: string;
}

export const CENTER_CONTACTS: CenterContact[] = [
  {
    name: 'Berhampur',
    city: 'Berhampur',
    phones: ['+91 7008990582', '+91 9777989739'],
  },
  {
    name: 'Bhubaneswar',
    city: 'Bhubaneswar',
    phones: ['070089 90586'],
  },
  {
    name: 'Angul',
    city: 'Angul',
    phones: ['+91 7008990586'],
  },
  {
    name: 'Bangalore (R&D)',
    city: 'Bangalore',
    phones: ['+91 8105108416'],
  },
];

export const PRIMARY_CENTER = CENTER_CONTACTS[1];
export const PRIMARY_CALL_NUMBER = PRIMARY_CENTER.phones[0];
export const PRIMARY_WHATSAPP_NUMBER = '917008990586';
export const PRIMARY_WHATSAPP_URL = `https://wa.me/${PRIMARY_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello Santaan IVF, I want to discuss fertility consultation options.')}`;
