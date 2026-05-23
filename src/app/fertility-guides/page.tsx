import Link from 'next/link';
import { ArrowRight, Clock, BookOpenText } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSantaanBlogPosts } from '@/lib/medium';
import { isPatientReadyPost } from '@/lib/patient-content';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Fertility Guides for Patients',
  description:
    'Read practical fertility guides on PCOS, male infertility, tests, IVF, and early next steps written to keep warm leads engaged and moving.',
  path: '/fertility-guides',
  keywords: [
    'fertility guides',
    'fertility education',
    'pcos guide',
    'male infertility guide',
    'ivf guide',
  ],
});

const guidePromises = [
  'Shorter, clearer explanations than a generic blog feed.',
  'Topics that map to the questions warm leads actually ask on WhatsApp.',
  'Built to educate first, then move the reader to the next click.',
];

export default async function FertilityGuidesPage() {
  const posts = await getSantaanBlogPosts({ type: 'blog', limit: 24 }).catch(() => []);
  const featuredPosts = posts.filter(isPatientReadyPost).slice(0, 6);

  return (
    <main className="min-h-screen bg-santaan-cream">
      <Header />

      <section className="pt-36 pb-20 bg-gradient-to-br from-santaan-teal via-santaan-teal/90 to-santaan-dark-teal text-white">
        <div className="container mx-auto px-4 md:px-6">
          <p className="uppercase tracking-[0.2em] text-santaan-amber text-xs font-semibold mb-4">Education That Converts</p>
          <h1 className="text-4xl md:text-6xl font-playfair font-bold max-w-4xl leading-tight">
            Fertility guides that make the next step feel easier.
          </h1>
          <p className="mt-6 max-w-3xl text-white/90 text-lg leading-relaxed">
            Use this page when a patient is curious, cautious, and still exploring. It gives them practical reading
            without dropping them into an overwhelming library first.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/know-your-score"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-santaan-amber text-white font-semibold hover:bg-[#E08E45] transition-colors"
            >
              Know your score
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/fertility-conditions"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/35 font-semibold hover:bg-white/10 transition-colors"
            >
              Explore conditions
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {guidePromises.map((item) => (
              <div key={item} className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm leading-relaxed text-white/90">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="uppercase tracking-[0.2em] text-santaan-amber text-xs font-semibold">Featured reading</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-playfair font-bold text-santaan-teal">
                Start with the guides most likely to keep a warm lead moving.
              </h2>
            </div>
            <Link
              href="/fertility-insights"
              className="inline-flex items-center gap-2 text-sm font-semibold text-santaan-teal hover:text-santaan-amber transition-colors"
            >
              Explore all patient guides
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featuredPosts.length === 0 ? (
            <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
              <h2 className="text-2xl font-playfair font-bold text-santaan-teal">Fresh guides are syncing right now.</h2>
              <p className="mt-3 text-gray-600">
                Please check back shortly or explore the readiness and condition pages instead.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <article
                  key={post.slug}
                  className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-shadow"
                >
                  {post.thumbnail ? (
                    <img src={post.thumbnail} alt={post.title} className="h-52 w-full object-cover" loading="lazy" decoding="async" />
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-gradient-to-r from-santaan-sage/25 to-santaan-teal/20">
                      <BookOpenText className="h-10 w-10 text-santaan-teal/60" />
                    </div>
                  )}

                  <div className="flex grow flex-col p-6">
                    <div className="mb-4 flex items-center gap-3 text-xs text-gray-500">
                      <span>{new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="text-gray-300">•</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readMinutes} min read
                      </span>
                    </div>

                    <h3 className="min-h-[3.4rem] text-xl font-playfair font-bold leading-tight text-gray-900 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                      {post.title}
                    </h3>
                    <p className="mt-3 min-h-[4.4rem] text-sm leading-relaxed text-gray-700 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden">
                      {post.excerpt}
                    </p>

                    <Link
                      href={`/fertility-insights/${post.slug}`}
                      className="mt-auto pt-5 inline-flex items-center gap-2 text-sm font-semibold text-santaan-teal hover:text-santaan-amber transition-colors"
                    >
                      Read this guide
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pb-18">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="uppercase tracking-[0.2em] text-santaan-amber text-xs font-semibold">From reading to action</p>
              <h2 className="mt-3 text-2xl md:text-3xl font-playfair font-bold text-santaan-teal">
                When the patient is ready, move them to one softer CTA.
              </h2>
              <p className="mt-3 text-gray-700 leading-relaxed">
                A good educational click should naturally lead into score-checking, condition exploration, or a private WhatsApp conversation.
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
