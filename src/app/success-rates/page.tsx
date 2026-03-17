import Script from 'next/script';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { buildMetadata } from '@/lib/seo';
import { buildFaqSchema } from '@/lib/schema';

export const metadata = buildMetadata({
  title: 'IVF Success Rates by Age (Overview)',
  description:
    'Explore a transparent overview of IVF success rates by age band and key factors that influence outcomes. Replace placeholders with audited numbers before publishing.',
  path: '/success-rates',
  keywords: ['ivf success rates by age', 'ivf outcomes', 'ivf success rate india', 'icsi success rate', 'santaan success rates'],
});

const ageBands = [
  { band: '<30', note: 'Placeholder band summary', range: '— (Add %)' },
  { band: '30–34', note: 'Placeholder band summary', range: '— (Add %)' },
  { band: '35–37', note: 'Placeholder band summary', range: '— (Add %)' },
  { band: '38–40', note: 'Placeholder band summary', range: '— (Add %)' },
  { band: '41–42', note: 'Placeholder band summary', range: '— (Add %)' },
  { band: '43+', note: 'Placeholder band summary', range: '— (Add %)' },
];

const methodNotes = [
  {
    title: 'What the numbers should represent',
    body: 'Define the exact metric before publishing: clinical pregnancy rate, live birth rate, or ongoing pregnancy rate. Use one primary metric and mention secondary metrics separately.',
  },
  {
    title: 'How we segment outcomes',
    body: 'Most audited reporting groups outcomes by maternal age, diagnosis (PCOS, endometriosis, male factor), and whether embryos were tested (PGT-A).',
  },
  {
    title: 'Why outcomes vary',
    body: 'Embryo genetics, ovarian reserve, sperm quality, uterine factors, and protocol adherence are major drivers. Lab processes and clinical decision quality also matter.',
  },
];

const faqs = [
  {
    question: 'Are success rates the same as live birth rates?',
    answer:
      'Not always. A success rate can mean different things (clinical pregnancy, ongoing pregnancy, or live birth). This page should clearly define the metric used once final numbers are approved.',
  },
  {
    question: 'Can you publish success rates by diagnosis?',
    answer:
      'Yes. Many clinics publish segmented success rates (PCOS, tubal factor, male factor, endometriosis) as long as the cohort size is sufficient and the methodology is clearly stated.',
  },
  {
    question: 'Does PGT-A improve outcomes?',
    answer:
      'PGT-A can reduce transfers of aneuploid embryos and may improve time-to-pregnancy in select cohorts, but it is not right for everyone. The decision should be individualized.',
  },
];

export default function SuccessRatesPage() {
  const faqSchema = buildFaqSchema(faqs);

  return (
    <main className="min-h-screen bg-santaan-cream">
      <Script id="success-rates-faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Header />

      <section className="pt-40 pb-20 bg-gradient-to-br from-santaan-teal via-santaan-teal/90 to-santaan-dark-teal text-white">
        <div className="container mx-auto px-4 md:px-6">
          <p className="uppercase tracking-[0.2em] text-santaan-amber text-xs font-semibold mb-4">Transparency</p>
          <h1 className="text-4xl md:text-6xl font-playfair font-bold max-w-4xl leading-tight">IVF Success Rates by Age</h1>
          <p className="mt-6 max-w-3xl text-white/85 text-lg">
            This page is a framework. Replace placeholder values with audited clinic data and publish a clear methodology.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact-centres" className="px-5 py-2.5 bg-santaan-amber text-white rounded-full font-semibold hover:bg-[#E08E45] transition-colors">
              Discuss your odds
            </Link>
            <Link href="/pricing" className="px-5 py-2.5 border border-white/35 rounded-full font-semibold hover:bg-white/10 transition-colors">
              See pricing & EMI
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10">
            <h2 className="text-2xl md:text-3xl font-playfair font-bold text-santaan-teal">Age-band overview</h2>
            <p className="text-gray-600 mt-3 max-w-3xl">
              Fill the success rate column with the chosen primary metric. Consider adding cohort size and timeframe once audited.
            </p>

            <div className="mt-8">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[18%] text-gray-700">Age band</TableHead>
                    <TableHead className="w-[22%] text-gray-700">Success rate</TableHead>
                    <TableHead className="text-gray-700">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ageBands.map((row) => (
                    <TableRow key={row.band}>
                      <TableCell className="font-semibold text-gray-900">{row.band}</TableCell>
                      <TableCell className="font-semibold text-santaan-teal">{row.range}</TableCell>
                      <TableCell className="text-gray-600">{row.note}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-8 rounded-2xl bg-santaan-sage/15 p-6">
              <p className="text-sm text-gray-800 font-semibold">Methodology disclaimer (keep this section when publishing)</p>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li>Success rates depend on age, diagnosis, ovarian reserve, sperm factors, embryo genetics, and treatment adherence.</li>
                <li>Any published number should specify timeframe, cohort size, and the exact metric definition.</li>
                <li>Individual outcomes vary; consult a fertility specialist for a personalized plan.</li>
              </ul>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mt-10">
            {methodNotes.map((card) => (
              <div key={card.title} className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
                <h3 className="text-xl font-playfair font-bold text-gray-900">{card.title}</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mt-10">
            <h3 className="text-xl font-playfair font-bold text-santaan-teal">Success rate FAQs</h3>
            <div className="mt-6 grid gap-4">
              {faqs.map((faq) => (
                <details key={faq.question} className="group rounded-xl border border-gray-100 bg-gray-50/40 p-5">
                  <summary className="cursor-pointer list-none font-semibold text-gray-900 flex items-center justify-between gap-4">
                    <span>{faq.question}</span>
                    <span className="text-santaan-teal group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <p className="mt-3 text-gray-700 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

