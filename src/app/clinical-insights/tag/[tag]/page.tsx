import Link from 'next/link';
import { ArrowRight, Clock, Stethoscope } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSantaanBlogPosts } from '@/lib/medium';
import { getClinicalCoverImage, isClinicalReadyPost } from '@/lib/clinical';
import { buildMetadata } from '@/lib/seo';
import { slugToLabel, tagToSlug } from '@/lib/tag-utils';

type Params = Promise<{ tag: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { tag } = await params;
  const label = slugToLabel(tag);

  return buildMetadata({
    title: `Clinical Insights: ${label}`,
    description: `Clinical fertility briefs tagged with ${label}. Evidence-oriented updates and protocol insights from Santaan.`,
    path: `/clinical-insights/tag/${tag}`,
    keywords: ['clinical fertility insights', 'ivf clinical', 'embryology', label],
  });
}

export default async function ClinicalInsightsTagPage({ params }: { params: Params }) {
  const { tag } = await params;
  const doctorPosts = await getSantaanBlogPosts({ type: 'doctor', limit: 90 }).catch(() => []);
  const ready = doctorPosts.filter(isClinicalReadyPost);
  const filtered = ready.filter((post) => post.tags.some((t) => tagToSlug(t) === tag)).slice(0, 24);
  const label = slugToLabel(tag);

  return (
    <main className="min-h-screen bg-santaan-cream">
      <Header />
      <section className="pt-36 pb-14 bg-white border-b border-santaan-sage/20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <Link href="/clinical-insights" className="text-santaan-teal hover:text-santaan-amber transition-colors font-medium">
              Clinical Insights
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 font-semibold">{label}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-playfair font-bold text-gray-900 mt-6 leading-tight">Tag: {label}</h1>
          <p className="text-gray-600 mt-4 max-w-2xl">A focused cluster of clinical briefs for faster discovery and internal linking.</p>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-4 md:px-6">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <h2 className="text-2xl font-playfair font-bold text-santaan-teal">No clinical briefs found for this tag yet</h2>
              <p className="text-gray-600 mt-3">Try another tag or view all clinical insights.</p>
              <div className="mt-6">
                <Link href="/clinical-insights" className="inline-flex items-center gap-2 text-santaan-teal font-semibold hover:text-santaan-amber transition-colors">
                  View all clinical insights
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((post) => (
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

                    <h2 className="text-xl font-playfair font-bold text-gray-900 leading-tight mb-3 min-h-[3.4rem] [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed mb-5 min-h-[4.2rem] [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] overflow-hidden">
                      {post.excerpt}
                    </p>

                    <Link href={`/clinical-insights/${post.slug}`} className="mt-auto inline-flex items-center gap-2 text-santaan-teal font-semibold hover:text-santaan-amber transition-colors">
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

