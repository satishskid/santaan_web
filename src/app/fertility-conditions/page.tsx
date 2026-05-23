import Link from 'next/link';
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getServicePageBySlug } from '@/content/servicePages';
import { buildMetadata } from '@/lib/seo';
import { buildPrimaryWhatsappUrl } from '@/data/centers';

export const metadata = buildMetadata({
  title: 'Fertility Conditions We Can Help You Explore',
  description:
    'Explore PCOS, male infertility, thyroid-linked fertility issues, unexplained infertility, and other common conception blockers in one place.',
  path: '/fertility-conditions',
  keywords: [
    'fertility conditions',
    'pcos fertility',
    'male infertility',
    'thyroid fertility',
    'unexplained infertility',
  ],
});

const featuredSlugs = [
  'female-fertility',
  'pcos-fertility-treatment',
  'male-infertility-clinic',
  'thyroid-and-fertility',
  'unexplained-infertility',
  'forgotten-fever-tubal-factor',
];

const featuredPages = featuredSlugs
  .map((slug) => getServicePageBySlug(slug))
  .filter((page): page is NonNullable<typeof page> => Boolean(page));

export default function FertilityConditionsPage() {
  return (
    <main className="min-h-screen bg-santaan-cream">
      <Header />

      <section className="pt-36 pb-20 bg-gradient-to-br from-santaan-teal via-santaan-teal/90 to-santaan-dark-teal text-white">
        <div className="container mx-auto px-4 md:px-6">
          <p className="uppercase tracking-[0.2em] text-santaan-amber text-xs font-semibold mb-4">Explore by Concern</p>
          <h1 className="text-4xl md:text-6xl font-playfair font-bold max-w-4xl leading-tight">
            Start with the condition that sounds most like your situation.
          </h1>
          <p className="mt-6 max-w-3xl text-white/90 text-lg leading-relaxed">
            Warm leads often know the worry before they know the treatment. This page helps them click into the exact
            concern they want to understand better.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/know-your-score"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-santaan-amber text-white font-semibold hover:bg-[#E08E45] transition-colors"
            >
              Know your score
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={buildPrimaryWhatsappUrl("Hi, I'd like to book a consultation and have questions about fertility conditions")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/35 font-semibold hover:bg-white/10 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Book on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8 max-w-3xl">
            <p className="uppercase tracking-[0.2em] text-santaan-amber text-xs font-semibold">Pick a pathway</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-playfair font-bold text-santaan-teal">
              Choose the question you want answered first.
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Each page is written to reduce confusion, build trust, and move the reader toward one useful next step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPages.map((page) => (
              <Link
                key={page.slug}
                href={`/${page.slug}`}
                className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-lg hover:border-santaan-teal/20 transition-all"
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-santaan-cream px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-santaan-teal">
                  <Sparkles className="h-3.5 w-3.5 text-santaan-amber" />
                  {page.kicker}
                </div>
                <h3 className="mt-4 text-2xl font-playfair font-bold text-gray-900 leading-tight group-hover:text-santaan-teal transition-colors">
                  {page.h1}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-700">
                  {page.intro}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-santaan-teal">
                  Open this guide
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-18">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="uppercase tracking-[0.2em] text-santaan-amber text-xs font-semibold">Still unsure where to start?</p>
              <h2 className="mt-3 text-2xl md:text-3xl font-playfair font-bold text-santaan-teal">
                Let the score lead the conversation.
              </h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                If the concern is not obvious yet, the readiness check is the best low-friction next click for a warm lead.
              </p>
            </div>
            <Link
              href="/know-your-score"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-santaan-teal px-5 py-3 text-sm font-semibold text-white hover:bg-santaan-dark-teal transition-colors"
            >
              Know your score
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
