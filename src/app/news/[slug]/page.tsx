import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSantaanBlogPostBySlug, getSantaanBlogPosts } from '@/lib/medium';
import { buildBlogPostingSchema, buildBreadcrumbSchema } from '@/lib/schema';
import { buildMetadata } from '@/lib/seo';
import { getSiteUrl } from '@/lib/site';

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const posts = await getSantaanBlogPosts({ type: 'news', limit: 30 }).catch(() => []);
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getSantaanBlogPostBySlug(slug);

  if (!post) {
    return buildMetadata({
      title: 'Santaan Announcement',
      description: 'Read the latest Santaan IVF announcement.',
      path: `/news/${slug}`,
      type: 'article',
    });
  }

  return buildMetadata({
    title: `${post.title} | Santaan News`,
    description: post.excerpt,
    path: `/news/${post.slug}`,
    type: 'article',
    keywords: post.tags,
  });
}

export default async function NewsDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getSantaanBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  if (post.type === 'doctor') {
    redirect(`/clinical-insights/${slug}`);
  }

  if (post.type === 'blog') {
    redirect(`/fertility-insights/${slug}`);
  }

  const baseUrl = getSiteUrl();
  const schema = buildBlogPostingSchema({
    title: post.title,
    description: post.excerpt,
    url: `${baseUrl}/news/${post.slug}`,
    publishedAt: post.publishedAt,
    modifiedAt: post.publishedAt,
    image: post.thumbnail,
    author: post.author,
    keywords: post.tags,
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: `${baseUrl}/` },
    { name: 'News', url: `${baseUrl}/news` },
    { name: post.title, url: `${baseUrl}/news/${post.slug}` },
  ]);

  return (
    <main className="min-h-screen bg-santaan-cream">
      <Header />
      <section className="pt-32 pb-10 bg-white border-b border-santaan-sage/20">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <Link href="/news" className="inline-flex items-center gap-2 text-santaan-teal font-medium hover:text-santaan-amber transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to news
          </Link>
          <p className="uppercase tracking-[0.2em] text-santaan-amber text-xs font-semibold mt-8 mb-4">Santaan announcement</p>
          <h1 className="text-3xl md:text-5xl font-playfair font-bold text-gray-900 leading-tight">{post.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="w-4 h-4" />
              {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span>By {post.author}</span>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {post.thumbnail ? (
            <img src={post.thumbnail} alt={post.title} className="w-full h-56 md:h-80 rounded-2xl object-cover mb-8 border border-santaan-sage/20" loading="lazy" decoding="async" />
          ) : null}
          <article className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 prose prose-lg max-w-none prose-headings:font-playfair prose-headings:text-santaan-teal prose-headings:mt-8 prose-headings:mb-4 prose-p:my-5 prose-ul:my-5 prose-ol:my-5 prose-li:my-1.5 prose-a:text-santaan-teal hover:prose-a:text-santaan-amber">
            <div dangerouslySetInnerHTML={{ __html: post.html }} />
          </article>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Footer />
    </main>
  );
}
