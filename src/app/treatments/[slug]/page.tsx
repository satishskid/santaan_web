import Script from 'next/script';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { buildMetadata } from '@/lib/seo';
import { buildBreadcrumbSchema, buildFaqSchema } from '@/lib/schema';
import { getSiteUrl } from '@/lib/site';
import { getTreatmentPageBySlug, treatmentSlugs } from '@/content/treatments';

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return treatmentSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const page = getTreatmentPageBySlug(slug);

  if (!page) {
    return {};
  }

  return buildMetadata({
    title: page.title,
    description: page.description,
    path: `/treatments/${page.slug}`,
    keywords: [page.primaryKeyword, 'fertility treatment', 'ivf centre', 'santaan ivf'],
  });
}

export default async function TreatmentPage({ params }: { params: Params }) {
  const { slug } = await params;
  const page = getTreatmentPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const faqSchema = buildFaqSchema(page.faqs);
  const baseUrl = getSiteUrl();
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: `${baseUrl}/` },
    { name: 'Treatments', url: `${baseUrl}/treatments` },
    { name: page.h1, url: `${baseUrl}/treatments/${page.slug}` },
  ]);

  return (
    <main className="min-h-screen bg-santaan-cream">
      <Script id={`treatment-faq-schema-${page.slug}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Script id={`treatment-breadcrumb-schema-${page.slug}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Header />

      <section className="pt-40 pb-20 bg-gradient-to-br from-santaan-teal via-santaan-teal/90 to-santaan-dark-teal text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-white/75">
            <Link href="/treatments" className="hover:text-white transition-colors">
              Treatments
            </Link>
            <span className="text-white/35">/</span>
            <span className="text-white">{page.h1}</span>
          </div>
          <p className="mt-6 uppercase tracking-[0.2em] text-santaan-amber text-xs font-semibold">{page.kicker}</p>
          <h1 className="mt-4 text-4xl md:text-6xl font-playfair font-bold max-w-4xl leading-tight">{page.h1}</h1>
          <p className="mt-6 max-w-3xl text-white/85 text-lg">{page.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact-centres" className="px-5 py-2.5 bg-santaan-amber text-white rounded-full font-semibold hover:bg-[#E08E45] transition-colors">
              Explore centres
            </Link>
            <Link href="/pricing" className="px-5 py-2.5 border border-white/35 rounded-full font-semibold hover:bg-white/10 transition-colors">
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
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10">
                <h2 className="text-2xl md:text-3xl font-playfair font-bold text-santaan-teal">Who it’s for</h2>
                <ul className="mt-5 space-y-3 text-gray-700">
                  {page.whoItsFor.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 w-2 h-2 rounded-full bg-santaan-amber shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10">
                <h2 className="text-2xl md:text-3xl font-playfair font-bold text-santaan-teal">Typical steps</h2>
                <div className="mt-6 grid gap-4">
                  {page.steps.map((step, index) => (
                    <div key={step.title} className="rounded-2xl bg-gray-50/60 border border-gray-100 p-6">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-santaan-teal text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="mt-3 text-gray-700 leading-relaxed">{step.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10">
                <h2 className="text-2xl md:text-3xl font-playfair font-bold text-santaan-teal">Risks and considerations</h2>
                <ul className="mt-5 space-y-3 text-gray-700">
                  {page.risksAndConsiderations.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 w-2 h-2 rounded-full bg-santaan-sage shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10">
                <h2 className="text-2xl md:text-3xl font-playfair font-bold text-santaan-teal">FAQs</h2>
                <div className="mt-6 grid gap-4">
                  {page.faqs.map((faq) => (
                    <details key={faq.question} className="group rounded-xl border border-gray-100 bg-gray-50/40 p-5">
                      <summary className="cursor-pointer list-none font-semibold text-gray-900 flex items-center justify-between gap-4">
                        <span>{faq.question}</span>
                        <span className="text-santaan-teal group-open:rotate-180 transition-transform">▾</span>
                      </summary>
                      <p className="mt-3 text-gray-700 leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-lg font-playfair font-bold text-gray-900">Next best step</h3>
                <p className="mt-3 text-gray-600">
                  Replace this with a writer-approved conversion block: eligibility cues + “book consult” messaging.
                </p>
                <div className="mt-5 grid gap-3">
                  <Link href="/contact-centres" className="w-full text-center px-5 py-3 bg-santaan-amber text-white rounded-full font-semibold hover:bg-[#E08E45] transition-colors">
                    Explore centres
                  </Link>
                  <Link href="/at-home-fertility-testing" className="w-full text-center px-5 py-3 border border-gray-200 rounded-full font-semibold text-santaan-teal hover:bg-gray-50 transition-colors">
                    Explore at-home testing
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-lg font-playfair font-bold text-gray-900">Explore other treatments</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {treatmentSlugs
                    .filter((s) => s !== page.slug)
                    .slice(0, 6)
                    .map((s) => (
                      <Link key={s} href={`/treatments/${s}`} className="px-3 py-1.5 rounded-full bg-santaan-sage/20 text-santaan-teal hover:bg-santaan-sage/30 transition-colors text-sm font-medium">
                        {s.replace('-', ' ').toUpperCase()}
                      </Link>
                    ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
