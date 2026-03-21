import Link from 'next/link';
import { ArrowRight, Clock, Stethoscope } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSantaanBlogPosts } from '@/lib/medium';
import { getClinicalCoverImage, isClinicalReadyPost } from '@/lib/clinical';
import { buildMetadata } from '@/lib/seo';
import { tagToSlug } from '@/lib/tag-utils';

export const metadata = buildMetadata({
  title: 'Clinical Insights for Fertility Specialists',
  description:
    'Doctor-facing fertility briefings from Santaan on AI in ART, embryo analytics, endocrinology updates, and evidence-based protocol insights.',
  path: '/clinical-insights',
  keywords: [
    'fertility clinical insights',
    'ai in ivf',
    'embryology updates',
    'doctor fertility articles',
    'reproductive medicine india',
  ],
});

export default async function ClinicalInsightsPage() {
  const doctorPosts = await getSantaanBlogPosts({ type: 'doctor', limit: 60 }).catch(() => []);
  const posts = doctorPosts.filter(isClinicalReadyPost).slice(0, 24);
  const tagCounts = posts.reduce<Record<string, number>>((acc, post) => {
    post.tags.forEach((tag) => {
      const slug = tagToSlug(tag);
      if (!slug) return;
      acc[slug] = (acc[slug] || 0) + 1;
    });
    return acc;
  }, {});
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([slug]) => slug);

  return (
    <main className="min-h-screen bg-santaan-cream">
      <Header />
      <section className="pt-40 pb-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <p className="uppercase tracking-[0.2em] text-santaan-amber text-xs font-semibold mb-4">Clinical Knowledge Library</p>
          <h1 className="text-4xl md:text-6xl font-playfair font-bold max-w-4xl leading-tight">
            Clinical Insights for Fertility Specialists
          </h1>
          <p className="mt-6 max-w-3xl text-white/85 text-lg">
            Evidence-oriented updates on AI-enabled diagnostics, protocol decisions, and reproductive medicine research.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/fertility-insights"
              className="px-4 py-2 rounded-full border border-white/35 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              For Patients
            </Link>
            <span className="px-4 py-2 rounded-full bg-white/20 text-white text-sm font-semibold">For Doctors</span>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          {topTags.length > 0 && (
            <div className="mb-10 bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-playfair font-bold text-santaan-teal">Browse by topic</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {topTags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/clinical-insights/tag/${tag}`}
                    className="px-3 py-1.5 rounded-full bg-santaan-sage/20 text-santaan-teal hover:bg-santaan-sage/30 transition-colors text-sm font-medium"
                  >
                    {tag.replace(/-+/g, ' ')}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <h2 className="text-2xl font-playfair font-bold text-santaan-teal">No validated clinical briefs are live yet</h2>
              <p className="text-gray-600 mt-3">
                Publish with <code className="bg-gray-100 px-1.5 py-0.5 rounded">audience-doctor</code>, medical citations, and structured sections.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full"
                >
                  <img src={getClinicalCoverImage(post)} alt="Clinical insight cover" className="w-full h-52 object-cover" loading="lazy" decoding="async" />
                  <div className="p-6 flex flex-col grow">
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                      <span>{new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="text-gray-300">•</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readMinutes} min read
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="inline-flex items-center gap-1">
                        <Stethoscope className="w-3.5 h-3.5" />
                        Clinical
                      </span>
                    </div>

                    <h2
                      className="text-xl font-playfair font-bold text-gray-900 leading-tight mb-3 min-h-[3.4rem] [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden"
                    >
                      {post.title}
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed mb-5 min-h-[4.2rem] [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] overflow-hidden">
                      {post.excerpt}
                    </p>

                    <Link
                      href={`/clinical-insights/${post.slug}`}
                      className="mt-auto inline-flex items-center gap-2 text-santaan-teal font-semibold hover:text-santaan-amber transition-colors"
                    >
                      Read clinical brief
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
