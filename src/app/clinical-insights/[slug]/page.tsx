import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, CalendarDays, Clock, ExternalLink, Stethoscope } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSantaanBlogPostBySlug, getSantaanBlogPosts } from '@/lib/medium';
import { getClinicalCoverImage, getClinicalQuality, isClinicalReadyPost } from '@/lib/clinical';
import { buildBlogPostingSchema, buildBreadcrumbSchema } from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';
import { tagToSlug } from '@/lib/tag-utils';
import { getSiteUrl } from '@/lib/site';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getSantaanBlogPostBySlug(slug);

  if (!post) {
    return buildMetadata({
      title: 'Clinical Insight',
      description: 'Read clinical fertility updates from Santaan.',
      path: `/clinical-insights/${slug}`,
      type: 'article',
    });
  }

  return buildMetadata({
    title: `${post.title} | Santaan Clinical Insights`,
    description: post.excerpt,
    path: `/clinical-insights/${post.slug}`,
    type: 'article',
    keywords: post.tags,
  });
}

export default async function ClinicalInsightDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getSantaanBlogPostBySlug(slug);

  if (!post) {
    redirect('/clinical-insights');
  }

  if (post.type !== 'doctor') {
    redirect(`/fertility-insights/${slug}`);
  }

  if (!isClinicalReadyPost(post)) {
    redirect('/clinical-insights');
  }

  const quality = getClinicalQuality(post);
  const baseUrl = getSiteUrl();
  const schema = buildBlogPostingSchema({
    title: post.title,
    description: post.excerpt,
    url: `${baseUrl}/clinical-insights/${post.slug}`,
    publishedAt: post.publishedAt,
    modifiedAt: post.publishedAt,
    image: getClinicalCoverImage(post),
    author: post.author,
    keywords: post.tags,
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: `${baseUrl}/` },
    { name: 'Clinical Insights', url: `${baseUrl}/clinical-insights` },
    { name: post.title, url: `${baseUrl}/clinical-insights/${post.slug}` },
  ]);

  const latestPosts = await getSantaanBlogPosts({ type: 'doctor', limit: 80 }).catch(() => []);
  const postTagSlugs = new Set(post.tags.map(tagToSlug).filter(Boolean));
  const relatedPosts = latestPosts
    .filter(isClinicalReadyPost)
    .filter((p) => p.slug !== post.slug)
    .map((p) => {
      const score = p.tags.reduce((acc, t) => (postTagSlugs.has(tagToSlug(t)) ? acc + 1 : acc), 0);
      return { post: p, score };
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((p) => p.post);

  return (
    <main className="min-h-screen bg-santaan-cream">
      <Header />
      <section className="pt-32 pb-10 bg-white border-b border-santaan-sage/20">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <Link href="/clinical-insights" className="inline-flex items-center gap-2 text-santaan-teal font-medium hover:text-santaan-amber transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to clinical insights
          </Link>
          <h1 className="text-3xl md:text-5xl font-playfair font-bold text-gray-900 mt-6 leading-tight">{post.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1"><CalendarDays className="w-4 h-4" /> {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" /> {post.readMinutes} min read</span>
            <span className="inline-flex items-center gap-1"><Stethoscope className="w-4 h-4" /> Clinician audience</span>
            <span>By {post.author}</span>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <img
            src={getClinicalCoverImage(post)}
            alt="Clinical insight cover"
            className="w-full h-56 md:h-72 rounded-2xl object-cover mb-8 border border-santaan-sage/20"
            loading="lazy"
            decoding="async"
          />

          <article className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 prose prose-lg max-w-none prose-headings:font-playfair prose-headings:text-santaan-teal prose-headings:mt-8 prose-headings:mb-4 prose-p:my-5 prose-ul:my-5 prose-ol:my-5 prose-li:my-1.5 prose-a:text-santaan-teal hover:prose-a:text-santaan-amber">
            <div dangerouslySetInnerHTML={{ __html: post.html }} />
          </article>

          {post.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.slice(0, 12).map((tag) => (
                <Link
                  key={tag}
                  href={`/clinical-insights/tag/${tagToSlug(tag)}`}
                  className="px-3 py-1.5 rounded-full bg-white border border-gray-100 text-santaan-teal hover:text-santaan-amber hover:border-santaan-teal/30 transition-colors text-sm font-medium"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 mt-10">
            <h2 className="text-2xl font-playfair font-bold">Clinical note</h2>
            <p className="mt-2 text-white/85">
              This brief is for clinician education and protocol discussion. It does not replace individualized patient-specific medical judgment.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/our-doctors" className="px-5 py-2.5 bg-santaan-amber text-white rounded-full font-semibold hover:bg-[#E08E45] transition-colors">
                Meet Santaan Specialists
              </Link>
              <Link href="/contact-centres" className="px-5 py-2.5 border border-white/40 rounded-full font-semibold hover:bg-white/10 transition-colors">
                Contact Clinical Team
              </Link>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-600 bg-white rounded-2xl border border-gray-100 p-5">
            Quality checks: {quality.wordCount} words, citation signals present, structured sections verified.
          </div>

          {relatedPosts.length > 0 && (
            <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <h3 className="text-xl font-playfair font-bold text-santaan-teal">Related clinical briefs</h3>
              <div className="mt-6 grid gap-4">
                {relatedPosts.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/clinical-insights/${p.slug}`}
                    className="group rounded-xl border border-gray-100 p-5 hover:border-santaan-teal/30 hover:bg-gray-50/40 transition-colors"
                  >
                    <p className="text-sm text-gray-500">
                      {new Date(p.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="mt-2 font-semibold text-gray-900 group-hover:text-santaan-teal transition-colors">{p.title}</p>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">
                      {p.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-8">
            Originally authored by Santaan team and syndicated from Medium.{' '}
            <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">
              View source
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Footer />
    </main>
  );
}
