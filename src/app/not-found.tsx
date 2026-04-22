import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-santaan-cream">
      <Header />
      <section className="pt-40 pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
          <p className="text-santaan-amber uppercase tracking-[0.2em] text-xs font-semibold">Page not found</p>
          <h1 className="text-4xl md:text-6xl font-playfair font-bold text-santaan-teal mt-3">Let us help you get back on track</h1>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The page you are looking for may have moved. You can continue your fertility journey from our service pages, insights, or direct consultation channels.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="px-5 py-2.5 rounded-full bg-santaan-teal text-white font-semibold hover:bg-santaan-dark-teal transition-colors">
              Go to homepage
            </Link>
            <Link href="/fertility-insights" className="px-5 py-2.5 rounded-full border border-santaan-teal/30 text-santaan-teal font-semibold hover:bg-santaan-teal/5 transition-colors">
              Read fertility insights
            </Link>
            <Link href="/contact-centres" className="px-5 py-2.5 rounded-full border border-santaan-teal/30 text-santaan-teal font-semibold hover:bg-santaan-teal/5 transition-colors">
              Explore centres
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
