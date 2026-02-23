import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, CalendarDays, Clock, ExternalLink, Stethoscope } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSantaanBlogPostBySlug } from '@/lib/medium';
import { getClinicalCoverImage, getClinicalQuality, isClinicalReadyPost } from '@/lib/clinical';
import { buildBlogPostingSchema } from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';

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
  const schema = buildBlogPostingSchema({
    title: post.title,
    description: post.excerpt,
    url: `https://santaan.in/clinical-insights/${post.slug}`,
    publishedAt: post.publishedAt,
    modifiedAt: post.publishedAt,
    image: getClinicalCoverImage(post),
    author: post.author,
    keywords: post.tags,
  });

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
          />

          <article className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 prose prose-lg max-w-none prose-headings:font-playfair prose-headings:text-santaan-teal prose-headings:mt-8 prose-headings:mb-4 prose-p:my-5 prose-ul:my-5 prose-ol:my-5 prose-li:my-1.5 prose-a:text-santaan-teal hover:prose-a:text-santaan-amber">
            <div dangerouslySetInnerHTML={{ __html: post.html }} />
          </article>

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
      <Footer />
    </main>
  );
}
