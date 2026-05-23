import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, PhoneCall, MessageCircle, CalendarCheck } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getServicePageBySlug, servicePageSlugs } from '@/content/servicePages';
import { buildBreadcrumbSchema, buildFaqSchema, buildMedicalClinicSchema } from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';
import { getSiteUrl } from '@/lib/site';
import {
  PRIMARY_CALL_NUMBER,
  buildPrimaryWhatsappUrl,
  getCenterMapsUrl,
  getCenterProfileByCity,
  getCenterProfileBySlug,
} from '@/data/centers';

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
  const baseUrl = getSiteUrl();
  const centerProfile = getCenterProfileBySlug(slug) ?? getCenterProfileByCity(page.city);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: `${baseUrl}/` },
    { name: page.title, url: `${baseUrl}/${slug}` },
  ]);
  const clinicSchema = centerProfile ? buildMedicalClinicSchema(centerProfile) : null;
  const callNumber = PRIMARY_CALL_NUMBER;
  const callHref = `tel:${callNumber.replace(/[^0-9+]/g, '')}`;
  const whatsappHref = buildPrimaryWhatsappUrl(`Hi, I'd like to book a consultation about ${page.h1}`);
  const mapsHref = centerProfile ? getCenterMapsUrl(centerProfile) : null;

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
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              data-cta-kind="whatsapp"
              data-center="Network"
              data-cta-target={whatsappHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Book on WhatsApp
            </a>
            <a
              href={callHref}
              data-cta-kind="call"
              data-center="Network"
              data-cta-target={callHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/40 font-semibold hover:bg-white/10 transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              Call Santaan
            </a>
            <Link
              href="/at-home-fertility-testing"
              data-cta-kind="book"
              data-center={centerProfile?.city ?? 'Network'}
              data-cta-target="/at-home-fertility-testing"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/40 font-semibold hover:bg-white/10 transition-colors"
            >
              <CalendarCheck className="w-4 h-4" />
              Explore at-home testing
            </Link>
          </div>
        </div>
      </section>

      {centerProfile ? (
        <section className="py-12">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6 rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-santaan-amber font-semibold">Center Details</p>
                <h2 className="mt-3 text-2xl md:text-3xl font-playfair font-bold text-santaan-teal">
                  Visit {centerProfile.centerName}
                </h2>
                <p className="mt-3 text-gray-700 leading-relaxed">{centerProfile.summary}</p>
                <div className="mt-5 grid gap-4 md:grid-cols-2 text-sm">
                  <div className="rounded-xl bg-santaan-cream/60 border border-santaan-sage/20 p-4">
                    <p className="font-semibold text-gray-900">Location</p>
                    <p className="mt-2 text-gray-700">{centerProfile.fullAddress}</p>
                  </div>
                  <div className="rounded-xl bg-santaan-cream/60 border border-santaan-sage/20 p-4">
                    <p className="font-semibold text-gray-900">Serves</p>
                    <p className="mt-2 text-gray-700">{centerProfile.areaServed.join(', ')}</p>
                  </div>
                  {centerProfile.phones.length > 0 ? (
                    <div className="rounded-xl bg-santaan-cream/60 border border-santaan-sage/20 p-4">
                      <p className="font-semibold text-gray-900">Clinic phone</p>
                      <div className="mt-2 space-y-1">
                        {centerProfile.phones.map((phone) => (
                          <p key={phone} className="text-gray-700">
                            Ph: {phone}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {centerProfile.landmark ? (
                    <div className="rounded-xl bg-santaan-cream/60 border border-santaan-sage/20 p-4">
                      <p className="font-semibold text-gray-900">Landmark</p>
                      <p className="mt-2 text-gray-700">{centerProfile.landmark}</p>
                    </div>
                  ) : null}
                  {centerProfile.hours.length > 0 ? (
                    <div className="rounded-xl bg-santaan-cream/60 border border-santaan-sage/20 p-4">
                      <p className="font-semibold text-gray-900">Timings</p>
                      <p className="mt-2 text-gray-700">{centerProfile.hours[0].replace('Monday: ', '')} Monday to Saturday</p>
                      <p className="mt-1 text-gray-700">Sunday: Closed</p>
                    </div>
                  ) : null}
                </div>
                {centerProfile.reviews && centerProfile.reviews.length > 0 ? (
                  <div className="mt-5 rounded-2xl border border-santaan-sage/20 bg-santaan-cream/60 p-4 md:p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-santaan-amber font-semibold">Patient feedback</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      {centerProfile.reviews.slice(0, 2).map((review) => (
                        <article key={`${review.author}-${review.meta}`} className="rounded-xl border border-santaan-sage/20 bg-white p-4">
                          <p className="text-sm text-gray-700 leading-relaxed">“{review.quote}”</p>
                          <p className="mt-3 text-xs font-semibold text-gray-900">{review.author}</p>
                          <p className="text-[11px] text-gray-500">{review.meta}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl bg-santaan-teal text-white p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-santaan-amber font-semibold">Quick Actions</p>
                <div className="mt-5 space-y-3">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cta-kind="whatsapp"
                    data-center="Network"
                    data-cta-target={whatsappHref}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Book on WhatsApp
                  </a>
                  <a
                    href={callHref}
                    data-cta-kind="call"
                    data-center="Network"
                    data-cta-target={callHref}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold hover:bg-white/10 transition-colors"
                  >
                    <PhoneCall className="w-4 h-4" />
                    Call Santaan
                  </a>
                  {mapsHref ? (
                    <a
                      href={mapsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold hover:bg-white/10 transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      Open in Maps
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

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
      {clinicSchema ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicSchema) }} />
      ) : null}
      <Footer />
    </main>
  );
}
