import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PhoneCall, MessageCircle, CalendarCheck } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getServicePageBySlug, servicePageSlugs } from '@/content/servicePages';
import { buildBreadcrumbSchema, buildFaqSchema } from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';
import { PRIMARY_CALL_NUMBER, PRIMARY_WHATSAPP_URL } from '@/data/centers';

type Params = Promise<{ slug: string }>;

function pagePath(slug: string) {
  return `/${slug}`;
}

export async function generateStaticParams() {
  return servicePageSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const page = getServicePageBySlug(slug);

  if (!page) {
    return {};
  }

  return buildMetadata({
    title: page.title,
    description: page.description,
    path: pagePath(slug),
    keywords: [page.primaryKeyword, 'fertility clinic', 'ivf treatment', ...(page.city ? [page.city] : [])],
  });
}

export default async function ServicePage({ params }: { params: Params }) {
  const { slug } = await params;
  const page = getServicePageBySlug(slug);

  if (!page) {
    notFound();
  }

  const faqSchema = buildFaqSchema(page.faqs);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://santaan.in/' },
    { name: page.title, url: `https://santaan.in/${slug}` },
  ]);

  return (
    <main className="min-h-screen bg-santaan-cream">
      <Header />
      <section className="pt-36 pb-20 bg-gradient-to-br from-santaan-teal via-santaan-teal/90 to-santaan-dark-teal text-white">
        <div className="container mx-auto px-4 md:px-6">
          <p className="uppercase tracking-[0.2em] text-santaan-amber text-xs font-semibold mb-3">{page.kicker}</p>
          <h1 className="text-4xl md:text-6xl font-playfair font-bold max-w-4xl leading-tight">{page.h1}</h1>
          <p className="mt-6 max-w-3xl text-white/90 text-lg leading-relaxed">{page.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`tel:${PRIMARY_CALL_NUMBER}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-santaan-amber text-white font-semibold hover:bg-[#E08E45] transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              Call a Fertility Advisor
            </a>
            <a
              href={PRIMARY_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/40 font-semibold hover:bg-white/10 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Us
            </a>
            <Link
              href="/at-home-fertility-testing"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/40 font-semibold hover:bg-white/10 transition-colors"
            >
              <CalendarCheck className="w-4 h-4" />
              Book Assessment
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="grid gap-7">
            {page.sections.map((section) => (
              <article key={section.heading} className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-2xl md:text-3xl font-playfair font-bold text-santaan-teal leading-tight">{section.heading}</h2>
                <p className="mt-3 text-gray-700 leading-relaxed">{section.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {page.relatedPages && page.relatedPages.length > 0 ? (
        <section className="pb-16">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-playfair font-bold text-santaan-teal">Explore related fertility pathways</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {page.relatedPages.map((related) => (
                  <Link
                    key={related.href}
                    href={related.href}
                    className="rounded-xl border border-santaan-sage/30 p-4 md:p-5 bg-santaan-cream/40 hover:bg-white transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900">{related.label}</h3>
                    <p className="mt-2 text-sm text-gray-700 leading-relaxed">{related.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-playfair font-bold text-santaan-teal">Frequently asked questions</h2>
            <div className="mt-6 space-y-4">
              {page.faqs.map((faq) => (
                <article key={faq.question} className="rounded-xl border border-santaan-sage/30 p-4 md:p-5 bg-santaan-cream/40">
                  <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                  <p className="mt-2 text-sm text-gray-700 leading-relaxed">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Footer />
    </main>
  );
}
