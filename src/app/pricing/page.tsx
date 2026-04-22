import Script from 'next/script';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { buttonVariants } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
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
  { service: 'Consultation + Plan Review', range: '₹800–₹1,500*', includes: 'Doctor consult, report review, plan' },
  { service: 'Diagnostic Workup Bundle', range: '₹6,000–₹15,000*', includes: 'AMH, hormones, ultrasound, semen analysis' },
  { service: 'IUI (Per Cycle)', range: '₹10,000–₹20,000*', includes: 'Cycle monitoring, procedure, basic meds' },
  { service: 'IVF (Per Cycle)', range: '₹1,20,000–₹2,00,000*', includes: 'Stimulation, retrieval, lab, transfer' },
  { service: 'ICSI Add-on', range: '₹25,000–₹55,000*', includes: 'Micromanipulation fertilization' },
  { service: 'PGT (Embryo Testing)', range: '₹1,00,000–₹2,50,000*', includes: 'Biopsy + lab testing + reporting' },
  { service: 'Egg Freezing (Cycle)', range: '₹1,10,000–₹2,40,000*', includes: 'Stimulation, retrieval, vitrification' },
  { service: 'Embryo Freezing/Storage', range: '₹35,000–₹1,00,000*', includes: 'Cryostorage (duration varies)' },
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
            Indicative IVF, IUI, ICSI and fertility testing costs with inclusions. Exact pricing depends on diagnosis, protocol, medicines and lab add-ons.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact-centres" className="px-5 py-2.5 bg-santaan-amber text-white rounded-full font-semibold hover:bg-[#E08E45] transition-colors">
              Explore centres
            </Link>
            <Link href="/at-home-fertility-testing" className="px-5 py-2.5 border border-white/35 rounded-full font-semibold hover:bg-white/10 transition-colors">
              Explore at-home testing
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10">
            <h2 className="text-2xl md:text-3xl font-playfair font-bold text-santaan-teal">Indicative price ranges</h2>
            <p className="text-gray-600 mt-3 max-w-3xl">
              Ranges are shown because fertility care is personalized. Total cost may vary based on condition and protocol; these are average ranges. Your final plan will list inclusions and exclusions based on your reports.
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
              <h3 className="text-xl font-playfair font-bold text-gray-900">EMI / financing options</h3>
              <p className="mt-3 text-gray-600">
                EMI may be available through partner financial institutions, subject to eligibility, terms and documentation.
              </p>
              <div className="mt-6 grid gap-3">
                <div className="rounded-xl bg-santaan-sage/15 p-4">
                  <p className="text-sm font-semibold text-santaan-teal">Tenure</p>
                  <p className="text-sm text-gray-700 mt-1">3–24 months (plan and lender dependent)</p>
                </div>
                <div className="rounded-xl bg-santaan-sage/15 p-4">
                  <p className="text-sm font-semibold text-santaan-teal">Downpayment</p>
                  <p className="text-sm text-gray-700 mt-1">0–30% (offer dependent)</p>
                </div>
                <div className="rounded-xl bg-santaan-sage/15 p-4">
                  <p className="text-sm font-semibold text-santaan-teal">Eligibility</p>
                  <p className="text-sm text-gray-700 mt-1">KYC + income proof + lender credit assessment</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                *0% EMI offers, where available, are provided by third party financial institutions and may be limited to select plans and time windows.
              </p>
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
                <Link
                  href="/contact-centres"
                  className={cn(
                    buttonVariants({
                      className: 'bg-santaan-teal hover:bg-santaan-sage text-white rounded-full px-6',
                    })
                  )}
                >
                  Get a personalized estimate
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mt-10">
            <h3 className="text-xl md:text-2xl font-playfair font-bold text-santaan-teal">The real cost that matters</h3>
            <p className="text-gray-600 mt-3 max-w-4xl">
              Fertility care is not a single product. The total cost is protocol and condition specific, and it can change with ovarian response and lab strategy. The safest way to avoid surprises is to ask for a written plan with clear inclusions.
            </p>

            <div className="grid lg:grid-cols-2 gap-6 mt-6">
              <div className="rounded-2xl bg-santaan-sage/10 border border-santaan-sage/20 p-6">
                <h4 className="font-semibold text-gray-900">Why “low headline prices” can become expensive</h4>
                <ul className="mt-4 space-y-2 text-sm text-gray-700">
                  <li>Medicines can be the largest variable and differ by ovarian reserve, BMI and response.</li>
                  <li>Lab steps (ICSI, blastocyst culture, freezing, storage) may be added based on clinical need.</li>
                  <li>Multiple ultrasounds, scans, anesthesia/OT charges, and repeat procedures may be billed separately.</li>
                  <li>Some packages quote per transfer, while your real cost is per full cycle plan.</li>
                </ul>
              </div>
              <div className="rounded-2xl bg-santaan-amber/10 border border-santaan-amber/20 p-6">
                <h4 className="font-semibold text-gray-900">How Santaan keeps planning transparent</h4>
                <ul className="mt-4 space-y-2 text-sm text-gray-700">
                  <li>Protocol is selected from your diagnosis, hormone trends, ovarian reserve and semen parameters.</li>
                  <li>We treat patients as people, not a factory queue—decisions are paced to your biology and comfort.</li>
                  <li>Advanced diagnostics and lab decision-support reduce trial-and-error and unnecessary add-ons.</li>
                  <li>Santaan Lab is our active R&amp;D unit that continuously improves decision quality and consistency.</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-gray-50/60 border border-gray-100 p-6">
              <h4 className="font-semibold text-gray-900">What to ask before you compare IVF costs</h4>
              <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm text-gray-700">
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">Ask for a written inclusion list</p>
                  <p>Does the quoted amount include medicines, monitoring scans, egg retrieval, lab charges and transfer?</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">Ask what triggers add-ons</p>
                  <p>When would ICSI, blastocyst culture, freezing or PGT be recommended—and what do they cost?</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">Ask what “per cycle” means</p>
                  <p>Is the quote per started cycle, per retrieval, or per embryo transfer?</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">Ask about cancellation and conversion</p>
                  <p>If response is low or the plan changes, how are charges adjusted?</p>
                </div>
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
          <p className="mt-6 text-xs text-gray-500 max-w-4xl">
            *Pricing ranges are indicative. Final costs vary by diagnosis, medicines, lab add-ons, number of cycles and center-specific protocols. Individual outcomes vary.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
