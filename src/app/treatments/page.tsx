import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { buildMetadata } from '@/lib/seo';
import { treatmentSlugs, getTreatmentPageBySlug } from '@/content/treatments';

export const metadata = buildMetadata({
  title: 'Treatments',
  description:
    'Explore IVF, IUI, ICSI, egg freezing, and PGT treatment pathways at Santaan IVF. Clear steps, candid considerations, and next actions.',
  path: '/treatments',
  keywords: ['ivf treatment', 'iui treatment', 'icsi', 'egg freezing', 'pgt', 'fertility treatments'],
});

export default function TreatmentsIndexPage() {
  const treatments = treatmentSlugs.map((slug) => getTreatmentPageBySlug(slug)).filter(Boolean);

  return (
    <main className="min-h-screen bg-santaan-cream">
      <Header />

      <section className="pt-40 pb-20 bg-gradient-to-br from-santaan-teal via-santaan-teal/90 to-santaan-dark-teal text-white">
        <div className="container mx-auto px-4 md:px-6">
          <p className="uppercase tracking-[0.2em] text-santaan-amber text-xs font-semibold mb-4">Care Pathways</p>
          <h1 className="text-4xl md:text-6xl font-playfair font-bold max-w-4xl leading-tight">Treatments</h1>
          <p className="mt-6 max-w-2xl text-white/85 text-lg">
            Explore structured treatment pathways for IVF, IUI, ICSI, egg freezing and embryo testing, with clear steps, decision points and next actions.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/pricing" className="px-5 py-2.5 bg-santaan-amber text-white rounded-full font-semibold hover:bg-[#E08E45] transition-colors">
              Pricing & EMI
            </Link>
            <Link href="/success-rates" className="px-5 py-2.5 border border-white/35 rounded-full font-semibold hover:bg-white/10 transition-colors">
              Success rates
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {treatments.map((treatment) => (
              <Link
                key={treatment.slug}
                href={`/treatments/${treatment.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 p-7 hover:shadow-lg transition-shadow"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-santaan-amber font-semibold">{treatment.kicker}</p>
                <h2 className="mt-3 text-2xl font-playfair font-bold text-gray-900 group-hover:text-santaan-teal transition-colors">
                  {treatment.h1}
                </h2>
                <p className="mt-4 text-gray-600 leading-relaxed">{treatment.description}</p>
                <p className="mt-6 text-santaan-teal font-semibold group-hover:text-santaan-amber transition-colors">
                  Explore steps →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
