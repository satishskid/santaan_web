import Link from 'next/link';
import { ArrowRight, CheckCircle2, MessageCircle, Stethoscope } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FertilityReadinessAssessment } from '@/components/sections/FertilityReadinessAssessment';
import { buildMetadata } from '@/lib/seo';
import { buildPrimaryWhatsappUrl } from '@/data/centers';

export const metadata = buildMetadata({
  title: 'Know Your Fertility Score',
  description:
    'Take Santaan’s fertility readiness check to understand your score, what may be slowing conception, and the smartest next step.',
  path: '/know-your-score',
  keywords: [
    'fertility readiness score',
    'fertility assessment india',
    'check your fertility score',
    'fertility self assessment',
  ],
});

const highlights = [
  'A fast self-check for common fertility blockers.',
  'A simpler way to understand whether to wait, test, or speak to a doctor.',
  'Built to turn confusion into one clear next action.',
];

const nextSteps = [
  {
    title: 'Want deeper answers?',
    description: 'See the most common fertility conditions and find the page that matches your concern.',
    href: '/fertility-conditions',
    label: 'Explore conditions',
  },
  {
    title: 'Prefer private guidance?',
    description: 'Chat with Santaan on WhatsApp and tell us what is worrying you most right now.',
    href: buildPrimaryWhatsappUrl("Hi, I've taken the readiness check and have questions"),
    label: 'Ask on WhatsApp',
    external: true,
  },
];

export default function KnowYourScorePage() {
  return (
    <main className="min-h-screen bg-santaan-cream">
      <Header />

      <section className="pt-36 pb-18 bg-gradient-to-br from-santaan-teal via-santaan-teal/90 to-santaan-dark-teal text-white">
        <div className="container mx-auto px-4 md:px-6">
          <p className="uppercase tracking-[0.2em] text-santaan-amber text-xs font-semibold mb-4">Warm Lead CTA</p>
          <h1 className="text-4xl md:text-6xl font-playfair font-bold max-w-4xl leading-tight">
            Know your fertility score before you guess the next step.
          </h1>
          <p className="mt-6 max-w-3xl text-white/90 text-lg leading-relaxed">
            This quick readiness check helps patients understand whether they should keep trying, investigate a possible
            blocker, or speak to a specialist sooner.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#score-check"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-santaan-amber text-white font-semibold hover:bg-[#E08E45] transition-colors"
            >
              Check your score
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/fertility-conditions"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/35 font-semibold hover:bg-white/10 transition-colors"
            >
              Explore conditions
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <div key={item} className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-santaan-amber shrink-0" />
                  <p className="text-sm leading-relaxed text-white/90">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="score-check" className="scroll-mt-24">
        <FertilityReadinessAssessment />
      </section>

      <section className="pb-18">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
            <div className="max-w-2xl">
              <p className="uppercase tracking-[0.2em] text-santaan-amber text-xs font-semibold">After the score</p>
              <h2 className="mt-3 text-2xl md:text-3xl font-playfair font-bold text-santaan-teal">
                Keep the momentum going with one clearer next click.
              </h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                Warm leads convert better when the next page matches the concern they already have in mind. Choose the
                path that feels closest to your question.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {nextSteps.map((step) => {
                const content = (
                  <>
                    <div className="flex items-center gap-3">
                      {step.external ? (
                        <MessageCircle className="h-5 w-5 text-santaan-amber" />
                      ) : (
                        <Stethoscope className="h-5 w-5 text-santaan-amber" />
                      )}
                      <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-gray-700">{step.description}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-santaan-teal">
                      {step.label}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </>
                );

                return step.external ? (
                  <a
                    key={step.title}
                    href={step.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl border border-santaan-sage/25 bg-santaan-cream/35 p-5 hover:bg-white transition-colors"
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    key={step.title}
                    href={step.href}
                    className="rounded-2xl border border-santaan-sage/25 bg-santaan-cream/35 p-5 hover:bg-white transition-colors"
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
