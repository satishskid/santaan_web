import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Doctors } from '@/components/sections/Doctors';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Our Fertility Doctors',
  description:
    'Meet Santaan IVF fertility specialists and center heads across Odisha and Bangalore. Explore doctor expertise in IVF, IUI, PCOS and male infertility care.',
  path: '/our-doctors',
  keywords: ['ivf specialist', 'fertility doctor', 'santaan doctors'],
});

export default function OurDoctorsPage() {
  return (
    <main className="min-h-screen bg-santaan-cream">
      <Header />
      <section className="pt-24">
        <Doctors headingAs="h1" />
      </section>
      <Footer />
    </main>
  );
}
