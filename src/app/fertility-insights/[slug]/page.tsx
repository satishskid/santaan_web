import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, CalendarDays, Clock, ExternalLink } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSantaanBlogPostBySlug, getSantaanBlogPosts } from '@/lib/medium';
import { isPatientReadyPost } from '@/lib/patient-content';
import { buildBlogPostingSchema, buildBreadcrumbSchema } from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';
import { tagToSlug } from '@/lib/tag-utils';
import { getSiteUrl } from '@/lib/site';

type Params = Promise<{ slug: string }>;

function getRelatedLinks(tags: string[]) {
  const normalized = tags.map((tag) => tag.toLowerCase());

  const links = [
    { href: '/pcos-fertility-treatment', label: 'PCOS Fertility Treatment', match: ['pcos', 'irregular-period'] },
    { href: '/male-infertility-clinic', label: 'Male Infertility Clinic', match: ['male', 'sperm'] },
    { href: '/thyroid-and-fertility', label: 'Thyroid and Fertility', match: ['thyroid', 'prolactin'] },
    { href: '/forgotten-fever-tubal-factor', label: 'Tubal Factor Care', match: ['tubal', 'fallopian', 'pid'] },
    { href: '/at-home-fertility-testing', label: 'At-Home Fertility Testing', match: ['testing', 'diagnosis'] },
  ];

  return links.filter((link) => link.match.some((keyword) => normalized.some((tag) => tag.includes(keyword)))).slice(0, 3);
}

export async function generateStaticParams() {
  const posts = await getSantaanBlogPosts({ type: 'blog', limit: 90 }).catch(() => []);
  return posts.filter(isPatientReadyPost).slice(0, 30).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getSantaanBlogPostBySlug(slug);

  if (!post) {
    return buildMetadata({
      title: 'Fertility Insight',
      description: 'Read fertility insights from Santaan IVF.',
      path: `/fertility-insights/${slug}`,
    });
  }

  return buildMetadata({
    title: `${post.title} | Santaan Fertility Insights`,
    description: post.excerpt,
    path: `/fertility-insights/${post.slug}`,
    type: 'article',
    keywords: post.tags,
    noIndex: !isPatientReadyPost(post),
  });
}

export default async function FertilityInsightDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getSantaanBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  if (post.type === 'doctor') {
    redirect(`/clinical-insights/${slug}`);
  }

  const baseUrl = getSiteUrl();
  const schema = buildBlogPostingSchema({
    title: post.title,
    description: post.excerpt,
    url: `${baseUrl}/fertility-insights/${post.slug}`,
    publishedAt: post.publishedAt,
    modifiedAt: post.publishedAt,
    image: post.thumbnail,
    author: post.author,
    keywords: post.tags,
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: `${baseUrl}/` },
    { name: 'Fertility Insights', url: `${baseUrl}/fertility-insights` },
    { name: post.title, url: `${baseUrl}/fertility-insights/${post.slug}` },
  ]);

  const relatedLinks = getRelatedLinks(post.tags);
  const latestPosts = await getSantaanBlogPosts({ type: 'blog', limit: 90 }).catch(() => []);
  const postTagSlugs = new Set(post.tags.map(tagToSlug).filter(Boolean));
  const relatedPosts = latestPosts
    .filter(isPatientReadyPost)
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
          <Link href="/fertility-insights" className="inline-flex items-center gap-2 text-santaan-teal font-medium hover:text-santaan-amber transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to all insights
          </Link>
          <h1 className="text-3xl md:text-5xl font-playfair font-bold text-gray-900 mt-6 leading-tight">{post.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1"><CalendarDays className="w-4 h-4" /> {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" /> {post.readMinutes} min read</span>
            <span>By {post.author}</span>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <article className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 prose prose-lg max-w-none prose-headings:font-playfair prose-headings:text-santaan-teal prose-headings:mt-8 prose-headings:mb-4 prose-p:my-5 prose-ul:my-5 prose-ol:my-5 prose-li:my-1.5 prose-a:text-santaan-teal hover:prose-a:text-santaan-amber">
            <div dangerouslySetInnerHTML={{ __html: post.html }} />
          </article>

          {post.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.slice(0, 12).map((tag) => (
                <Link
                  key={tag}
                  href={`/fertility-insights/tag/${tagToSlug(tag)}`}
                  className="px-3 py-1.5 rounded-full bg-white border border-gray-100 text-santaan-teal hover:text-santaan-amber hover:border-santaan-teal/30 transition-colors text-sm font-medium"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          <div className="bg-santaan-teal text-white rounded-2xl p-6 md:p-8 mt-10">
            <h2 className="text-2xl font-playfair font-bold">Ready for a personalized fertility plan?</h2>
            <p className="mt-2 text-white/85">Book a consultation or start with at-home fertility testing for quicker, evidence-driven next steps.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/at-home-fertility-testing" className="px-5 py-2.5 bg-santaan-amber text-white rounded-full font-semibold hover:bg-[#E08E45] transition-colors">
                Explore at-home testing
              </Link>
              <Link href="/contact-centres" className="px-5 py-2.5 border border-white/40 rounded-full font-semibold hover:bg-white/10 transition-colors">
                Explore centres
              </Link>
            </div>
          </div>

          {relatedLinks.length > 0 && (
            <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <h3 className="text-xl font-playfair font-bold text-santaan-teal">Related treatment pages</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {relatedLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="px-4 py-2 rounded-full bg-santaan-sage/20 text-santaan-teal hover:bg-santaan-sage/30 transition-colors text-sm font-medium">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {relatedPosts.length > 0 && (
            <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <h3 className="text-xl font-playfair font-bold text-santaan-teal">Related articles</h3>
              <div className="mt-6 grid gap-4">
                {relatedPosts.map((p) => (
                  <Link key={p.slug} href={`/fertility-insights/${p.slug}`} className="group rounded-xl border border-gray-100 p-5 hover:border-santaan-teal/30 hover:bg-gray-50/40 transition-colors">
                    <p className="text-sm text-gray-500">{new Date(p.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
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
