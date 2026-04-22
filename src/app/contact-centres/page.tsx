import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Locations } from '@/components/sections/Locations';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Contact Santaan IVF Centres',
  description:
    'Contact Santaan IVF centres in Bhubaneswar, Berhampur, Angul and Bangalore. Find city-specific fertility centre details, phone numbers and booking paths.',
  path: '/contact-centres',
  keywords: [
    'santaan ivf contact',
    'ivf clinic bhubaneswar',
    'ivf clinic berhampur',
    'ivf clinic angul',
    'fertility centre bangalore',
  ],
});

export default function ContactCentresPage() {
  return (
    <main className="min-h-screen bg-santaan-cream">
      <Header />
      <section className="pt-24">
        <Locations headingAs="h1" />
      </section>
      <Footer />
    </main>
  );
}
