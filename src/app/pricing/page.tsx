import Script from 'next/script';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { buildMetadata } from '@/lib/seo';
import { buildFaqSchema } from '@/lib/schema';

export const metadata = buildMetadata({
  title: 'Pricing and EMI Options',
  description:
    'Explore Santaan IVF pricing ranges, what is included, and EMI/financing options. Transparent guidance to plan your fertility journey.',
  path: '/pricing',
  keywords: ['ivf pricing', 'ivf cost', 'iui cost', 'icsi cost', 'fertility emi', 'santaan pricing'],
});

const priceRanges = [
  { service: 'Consultation + Plan Review', range: '₹— (Add range)', includes: 'Doctor consult, report review, plan' },
  { service: 'Diagnostic Workup Bundle', range: '₹— (Add range)', includes: 'AMH, hormones, ultrasound, semen analysis' },
  { service: 'IUI (Per Cycle)', range: '₹— (Add range)', includes: 'Cycle monitoring, procedure, basic meds' },
  { service: 'IVF (Per Cycle)', range: '₹— (Add range)', includes: 'Stimulation, retrieval, lab, transfer' },
  { service: 'ICSI Add-on', range: '₹— (Add range)', includes: 'Micromanipulation fertilization' },
  { service: 'PGT (Embryo Testing)', range: '₹— (Add range)', includes: 'Biopsy + lab testing + reporting' },
  { service: 'Egg Freezing (Cycle)', range: '₹— (Add range)', includes: 'Stimulation, retrieval, vitrification' },
  { service: 'Embryo Freezing/Storage', range: '₹— (Add range)', includes: 'Cryostorage (duration varies)' },
];

const faqs = [
  {
    question: 'Why do fertility treatment costs vary?',
    answer:
      'Costs vary based on diagnosis, medications, lab needs, add-ons such as ICSI/PGT, and how many cycles are needed. A consult and diagnostics help narrow a realistic range.',
  },
  {
    question: 'Do you offer EMI or financing?',
    answer:
      'Yes. EMI options may be available through partner financing. The final eligibility and terms depend on the financing provider and patient profile.',
  },
  {
    question: 'What is typically not included in the base IVF range?',
    answer:
      'Common exclusions can include advanced genetic testing, donor programs, additional medications, embryo freezing/storage beyond a defined period, and repeat procedures. Your plan will list inclusions clearly.',
  },
];

export default function PricingPage() {
  const faqSchema = buildFaqSchema(faqs);

  return (
    <main className="min-h-screen bg-santaan-cream">
      <Script id="pricing-faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Header />

      <section className="pt-40 pb-20 bg-gradient-to-br from-santaan-teal via-santaan-teal/90 to-santaan-dark-teal text-white">
        <div className="container mx-auto px-4 md:px-6">
          <p className="uppercase tracking-[0.2em] text-santaan-amber text-xs font-semibold mb-4">Planning</p>
          <h1 className="text-4xl md:text-6xl font-playfair font-bold max-w-4xl leading-tight">Pricing and EMI Options</h1>
          <p className="mt-6 max-w-2xl text-white/85 text-lg">
            Transparent ranges and what they usually include. Replace placeholders with final ranges once approved by the team.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact-centres" className="px-5 py-2.5 bg-santaan-amber text-white rounded-full font-semibold hover:bg-[#E08E45] transition-colors">
              Talk to a Centre
            </Link>
            <Link href="/at-home-fertility-testing" className="px-5 py-2.5 border border-white/35 rounded-full font-semibold hover:bg-white/10 transition-colors">
              Start with Testing
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10">
            <h2 className="text-2xl md:text-3xl font-playfair font-bold text-santaan-teal">Typical price ranges</h2>
            <p className="text-gray-600 mt-3 max-w-3xl">
              These are placeholders and should be updated with final numbers. Ranges are shown because fertility care is personalized.
            </p>

            <div className="mt-8">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[45%] text-gray-700">Service</TableHead>
                    <TableHead className="w-[20%] text-gray-700">Range</TableHead>
                    <TableHead className="text-gray-700">Usually includes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceRanges.map((row) => (
                    <TableRow key={row.service}>
                      <TableCell className="font-semibold text-gray-900">{row.service}</TableCell>
                      <TableCell className="font-semibold text-santaan-teal">{row.range}</TableCell>
                      <TableCell className="text-gray-600">{row.includes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mt-10">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <h3 className="text-xl font-playfair font-bold text-gray-900">EMI / financing (placeholder)</h3>
              <p className="mt-3 text-gray-600">
                Add final EMI partners, 0% EMI availability, tenure options, and required documents here.
              </p>
              <div className="mt-6 grid gap-3">
                <div className="rounded-xl bg-santaan-sage/15 p-4">
                  <p className="text-sm font-semibold text-santaan-teal">Tenure</p>
                  <p className="text-sm text-gray-700 mt-1">— (Add 3–24 months etc.)</p>
                </div>
                <div className="rounded-xl bg-santaan-sage/15 p-4">
                  <p className="text-sm font-semibold text-santaan-teal">Downpayment</p>
                  <p className="text-sm text-gray-700 mt-1">— (Add details)</p>
                </div>
                <div className="rounded-xl bg-santaan-sage/15 p-4">
                  <p className="text-sm font-semibold text-santaan-teal">Eligibility</p>
                  <p className="text-sm text-gray-700 mt-1">— (Add criteria)</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <h3 className="text-xl font-playfair font-bold text-gray-900">What changes the final cost</h3>
              <ul className="mt-4 space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="mt-2 w-2 h-2 rounded-full bg-santaan-amber shrink-0" />
                  Medications and stimulation protocol based on ovarian reserve, BMI, and response.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 w-2 h-2 rounded-full bg-santaan-amber shrink-0" />
                  Lab needs such as ICSI, blastocyst culture, embryo freezing and storage.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 w-2 h-2 rounded-full bg-santaan-amber shrink-0" />
                  Add-ons such as PGT, donor programs, or surgical procedures when medically needed.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 w-2 h-2 rounded-full bg-santaan-amber shrink-0" />
                  Number of cycles required to reach a healthy embryo/transfer.
                </li>
              </ul>
              <div className="mt-7">
                <Link href="/contact-centres">
                  <Button className="bg-santaan-teal hover:bg-santaan-sage text-white rounded-full px-6">
                    Get a personalized estimate
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mt-10">
            <h3 className="text-xl font-playfair font-bold text-santaan-teal">Pricing FAQs</h3>
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

