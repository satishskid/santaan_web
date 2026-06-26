import Link from 'next/link';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSantaanBlogPosts } from '@/lib/medium';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Santaan News and Announcements',
  description: 'Latest Santaan IVF awards, announcements, events, and patient-facing updates from the Santaan team.',
  path: '/news',
  keywords: ['Santaan IVF news', 'Santaan announcements', 'fertility clinic updates'],
});

export default async function NewsPage() {
  const posts = await getSantaanBlogPosts({ type: 'news', limit: 24 }).catch(() => []);

  return (
    <main className="min-h-screen bg-santaan-cream">
      <Header />
      <section className="pt-40 pb-20 bg-gradient-to-br from-santaan-teal via-santaan-teal/90 to-santaan-dark-teal text-white">
        <div className="container mx-auto px-4 md:px-6">
          <p className="uppercase tracking-[0.2em] text-santaan-amber text-xs font-semibold mb-4">What&apos;s New</p>
          <h1 className="text-4xl md:text-6xl font-playfair font-bold max-w-3xl leading-tight">
            Santaan news and announcements
          </h1>
          <p className="mt-6 max-w-2xl text-white/85 text-lg">
            Awards, clinic updates, events, and important notes from Santaan IVF.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          {posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <h2 className="text-2xl font-playfair font-bold text-santaan-teal">No announcements are live yet</h2>
              <p className="text-gray-600 mt-3">New Santaan announcements will appear here after the editorial team publishes them.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.slug} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full">
                  {post.thumbnail ? (
                    <img src={post.thumbnail} alt={post.title} className="w-full h-52 object-cover" loading="lazy" decoding="async" />
                  ) : (
                    <div className="w-full h-52 bg-gradient-to-r from-santaan-sage/30 to-santaan-teal/20" />
                  )}
                  <div className="p-6 flex flex-col grow">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>{new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <h2 className="text-xl font-playfair font-bold text-gray-900 leading-tight mb-3">{post.title}</h2>
                    <p className="text-gray-600 text-sm leading-relaxed mb-5 [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] overflow-hidden">
                      {post.excerpt}
                    </p>
                    <Link href={`/news/${post.slug}`} className="mt-auto inline-flex items-center gap-2 text-santaan-teal font-semibold hover:text-santaan-amber transition-colors">
                      Read announcement
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
