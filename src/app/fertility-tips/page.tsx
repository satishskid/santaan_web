import Link from 'next/link';
import { ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import NewsletterSubscribe from '@/components/sections/NewsletterSubscribe';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Get Fertility Tips on WhatsApp',
  description:
    'Get short fertility tips, myth-busting education, and gentle next-step guidance on WhatsApp for patients who are still exploring.',
  path: '/fertility-tips',
  keywords: [
    'fertility tips whatsapp',
    'fertility tips',
    'fertility whatsapp updates',
    'pcos fertility tips',
  ],
});

const benefits = [
  'Short, practical fertility tips that do not feel overwhelming.',
  'Educational follow-up for patients who are warm but not ready to book yet.',
  'A softer WhatsApp nurture CTA for Meta, SMS, and remarketing campaigns.',
];

export default function FertilityTipsPage() {
  return (
    <main className="min-h-screen bg-santaan-cream">
      <Header />

      <section className="pt-36 pb-20 bg-gradient-to-br from-santaan-teal via-santaan-teal/90 to-santaan-dark-teal text-white">
        <div className="container mx-auto px-4 md:px-6">
          <p className="uppercase tracking-[0.2em] text-santaan-amber text-xs font-semibold mb-4">Soft Nurture CTA</p>
          <h1 className="text-4xl md:text-6xl font-playfair font-bold max-w-4xl leading-tight">
            Get fertility tips that feel clear, calm, and useful.
          </h1>
          <p className="mt-6 max-w-3xl text-white/90 text-lg leading-relaxed">
            This is the better WhatsApp nurture entry point for warm leads. The promise is simple: one useful insight,
            one myth clarified, and one gentle next step.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#subscribe"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-santaan-amber text-white font-semibold hover:bg-[#E08E45] transition-colors"
            >
              Get tips on WhatsApp
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/fertility-guides"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/35 font-semibold hover:bg-white/10 transition-colors"
            >
              Explore guides
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {benefits.map((item) => (
              <div key={item} className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-santaan-amber" />
                  <p className="text-sm leading-relaxed text-white/90">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="subscribe" className="py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <div className="inline-flex items-center gap-2 rounded-full bg-santaan-cream px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-santaan-teal">
                <MessageCircle className="h-3.5 w-3.5 text-santaan-amber" />
                WhatsApp nurture
              </div>
              <h2 className="mt-4 text-3xl font-playfair font-bold text-santaan-teal">
                Stay connected without feeling pushed.
              </h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                This page is designed for patients who need more confidence before they book. Capture intent now, then
                keep building trust with useful education on WhatsApp.
              </p>
              <div className="mt-6">
                <NewsletterSubscribe />
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <p className="uppercase tracking-[0.2em] text-santaan-amber text-xs font-semibold">Best paired CTAs</p>
              <h2 className="mt-3 text-3xl font-playfair font-bold text-santaan-teal">
                Pair tips with one high-intent path.
              </h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                WhatsApp education works best when the next click is still low pressure but clearly relevant.
              </p>

              <div className="mt-6 grid gap-4">
                <Link
                  href="/know-your-score"
                  className="rounded-2xl border border-santaan-sage/25 bg-santaan-cream/35 p-5 hover:bg-white transition-colors"
                >
                  <h3 className="font-semibold text-gray-900">Know your score</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">
                    Good for leads who are curious but need a more interactive, personalized-feeling next step.
                  </p>
                </Link>

                <Link
                  href="/fertility-conditions"
                  className="rounded-2xl border border-santaan-sage/25 bg-santaan-cream/35 p-5 hover:bg-white transition-colors"
                >
                  <h3 className="font-semibold text-gray-900">Explore conditions</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">
                    Good for leads who already suspect PCOS, thyroid, male-factor, or unexplained fertility issues.
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
