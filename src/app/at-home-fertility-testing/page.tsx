import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import AtHomeTesting from '@/components/sections/AtHomeTesting';
import { FAQ } from '@/components/sections/FAQ';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'At-Home Fertility Testing',
  description:
    'Book discreet at-home fertility testing with Santaan IVF. Get semen analysis, hormone markers and doctor-guided next steps without clinic waiting.',
  path: '/at-home-fertility-testing',
  keywords: ['at home fertility test india', 'home semen test', 'fertility test at home'],
});

export default function AtHomeFertilityTestingPage() {
  return (
    <main className="min-h-screen bg-santaan-cream">
      <Header />
      <section className="pt-24">
        <AtHomeTesting headingAs="h1" />
      </section>
      <FAQ />
      <Footer />
    </main>
  );
}
