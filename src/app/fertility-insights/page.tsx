import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { getSantaanBlogPosts } from '@/lib/medium';
import { isPatientReadyPost } from '@/lib/patient-content';
import { buildMetadata } from '@/lib/seo';
import { tagToSlug } from '@/lib/tag-utils';

export const metadata = buildMetadata({
  title: 'Fertility Insights and Stories',
  description:
    'Read Santaan IVF fertility insights on PCOS, male infertility, thyroid, tubal factor and IVF planning across Bhubaneswar, Berhampur and Bangalore.',
  path: '/fertility-insights',
  keywords: [
    'fertility blog india',
    'ivf insights',
    'pcos fertility guide',
    'male infertility articles',
    'santaan blog',
  ],
});

export default async function FertilityInsightsPage({ searchParams }: { searchParams?: { q?: string } }) {
  const query = typeof searchParams?.q === 'string' ? searchParams.q.trim() : '';

  const posts = await getSantaanBlogPosts({ type: 'blog', limit: 90 }).catch(() => []);
  const readyPosts = posts.filter(isPatientReadyPost);
  const visiblePosts = query
    ? readyPosts.filter((post) => {
        const haystack = `${post.title} ${post.excerpt}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
    : readyPosts;
  const tagCounts = readyPosts.reduce<Record<string, number>>((acc, post) => {
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
      <section className="pt-40 pb-24 bg-gradient-to-br from-santaan-teal via-santaan-teal/90 to-santaan-dark-teal text-white">
        <div className="container mx-auto px-4 md:px-6">
          <p className="uppercase tracking-[0.2em] text-santaan-amber text-xs font-semibold mb-4">Knowledge Library</p>
          <h1 className="text-4xl md:text-6xl font-playfair font-bold max-w-3xl leading-tight">
            Fertility Insights and Stories
          </h1>
          <p className="mt-6 max-w-2xl text-white/85 text-lg">
            Science-backed explainers and practical fertility guidance for couples and individuals planning parenthood.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="px-4 py-2 rounded-full bg-white/20 text-white text-sm font-semibold">For Patients</span>
            <Link
              href="/clinical-insights"
              className="px-4 py-2 rounded-full border border-white/35 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              For Doctors
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-10 bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-playfair font-bold text-santaan-teal">Search</h2>
            <form action="/fertility-insights" method="get" className="mt-4 flex flex-col sm:flex-row gap-3">
              <Input
                name="q"
                defaultValue={query}
                placeholder="Search articles (e.g., PCOS, IVF, AMH, semen analysis)"
                className="flex-1"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-santaan-teal text-white font-semibold hover:bg-santaan-dark-teal transition-colors"
              >
                Search
              </button>
              <Link
                href="/fertility-insights"
                className="px-5 py-2.5 rounded-full border border-santaan-teal/30 text-santaan-teal font-semibold hover:bg-santaan-teal/5 transition-colors text-center"
              >
                Clear
              </Link>
            </form>
            {query ? <p className="mt-3 text-sm text-gray-600">Showing results for “{query}”.</p> : null}
          </div>

          {topTags.length > 0 && (
            <div className="mb-10 bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-playfair font-bold text-santaan-teal">Browse by topic</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {topTags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/fertility-insights/tag/${tag}`}
                    className="px-3 py-1.5 rounded-full bg-santaan-sage/20 text-santaan-teal hover:bg-santaan-sage/30 transition-colors text-sm font-medium"
                  >
                    {tag.replace(/-+/g, ' ')}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {visiblePosts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <h2 className="text-2xl font-playfair font-bold text-santaan-teal">
                {query ? 'No matching articles found' : 'Fresh articles are syncing'}
              </h2>
              <p className="text-gray-600 mt-3">
                {query
                  ? 'Try a different keyword (PCOS, IVF, AMH, male infertility) or clear the search.'
                  : 'Please check back in a few minutes for the latest insights from our editorial team.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visiblePosts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full"
                >
                  {post.thumbnail ? (
                    <img src={post.thumbnail} alt={post.title} className="w-full h-52 object-cover" loading="lazy" decoding="async" />
                  ) : (
                    <div className="w-full h-52 bg-gradient-to-r from-santaan-sage/30 to-santaan-teal/20" />
                  )}
                  <div className="p-6 flex flex-col grow">
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                      <span>{new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="text-gray-300">•</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readMinutes} min read
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
                      href={`/fertility-insights/${post.slug}`}
                      className="mt-auto inline-flex items-center gap-2 text-santaan-teal font-semibold hover:text-santaan-amber transition-colors"
                    >
                      Read this guide
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
