import Link from "next/link";
import { BarChart3, BrainCircuit, ClipboardList, Sparkles } from "lucide-react";

const CARDS = [
  {
    title: "Real cost to the patient",
    icon: ClipboardList,
    points: [
      "Total cost is protocol and condition specific, not a single fixed sticker price.",
      "Medicines and lab steps can change based on ovarian response and diagnosis.",
      "Compare written inclusions, not just a headline number.",
    ],
    cta: { label: "See transparent pricing", href: "/pricing" },
  },
  {
    title: "Real success rate that matters",
    icon: BarChart3,
    points: [
      "A percentage is meaningless without the metric and denominator.",
      "Ask for age bands, own-egg vs donor, fresh vs frozen, and timeframe.",
      "Plan for cumulative outcomes across a complete pathway, not a selective step.",
    ],
    cta: { label: "Understand success rates", href: "/success-rates" },
  },
  {
    title: "Tech + empathy, not a factory",
    icon: BrainCircuit,
    points: [
      "Advanced diagnostics help us choose the right protocol earlier and reduce trial-and-error.",
      "Decisions are personalized and paced to the person, not a production line.",
      "Our Santaan Lab R&D work continuously improves decision quality and consistency.",
    ],
    cta: { label: "See Santaan Lab", href: "#santaan-lab" },
  },
];

export function SantaanXplainer() {
  return (
    <section id="santaan-xplainer" className="py-20 md:py-24 bg-linear-to-b from-white via-santaan-cream/30 to-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-santaan-teal/10 text-santaan-teal font-semibold uppercase tracking-wider text-xs mb-4">
            <Sparkles className="w-4 h-4" />
            Santaan Xplainer
          </span>
          <h2 className="text-3xl md:text-5xl font-playfair font-bold text-santaan-teal mb-4">Clarity over hype</h2>
          <p className="text-gray-700 max-w-3xl mx-auto text-base md:text-lg leading-relaxed">
            Many couples get confused by low headline prices and a single success percentage. Here is how to compare IVF care in a patient-first, evidence-first way.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <a
              href="#santaan-signal"
              className="px-4 py-2 rounded-full bg-white border border-gray-100 text-santaan-teal font-semibold text-sm hover:bg-santaan-cream/40 transition-colors"
            >
              Know your score
            </a>
            <a
              href="#wonder-of-life"
              className="px-4 py-2 rounded-full bg-white border border-gray-100 text-santaan-teal font-semibold text-sm hover:bg-santaan-cream/40 transition-colors"
            >
              Biology Xplainer
            </a>
            <Link
              href="/pricing"
              className="px-4 py-2 rounded-full bg-white border border-gray-100 text-santaan-teal font-semibold text-sm hover:bg-santaan-cream/40 transition-colors"
            >
              Pricing clarity
            </Link>
            <Link
              href="/success-rates"
              className="px-4 py-2 rounded-full bg-white border border-gray-100 text-santaan-teal font-semibold text-sm hover:bg-santaan-cream/40 transition-colors"
            >
              Success rates
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6 max-w-7xl mx-auto">
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-santaan-amber/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-santaan-amber" />
                </div>
                <h3 className="mt-4 text-xl font-playfair font-bold text-gray-900">{card.title}</h3>
                <ul className="mt-4 space-y-2 text-sm text-gray-700">
                  {card.points.map((p) => (
                    <li key={p} className="flex gap-3">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-santaan-teal shrink-0" />
                      <span className="leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link
                    href={card.cta.href}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-santaan-teal text-white font-semibold hover:bg-santaan-dark-teal transition-colors"
                  >
                    {card.cta.label}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-gray-100 bg-gray-50/60 p-6 md:p-8 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-gray-900">Want a personalized plan instead of generic promises?</p>
              <p className="mt-1 text-sm text-gray-600">
                Check your fertility readiness score and get a structured next-step map for your situation.
              </p>
            </div>
            <a
              href="#santaan-signal"
              className="shrink-0 inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-santaan-amber text-white font-semibold hover:bg-[#E08E45] transition-colors"
            >
              Know your score
            </a>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Educational content only. Medical outcomes and costs vary by age, diagnosis, protocol and clinical factors.
          </p>
        </div>
      </div>
    </section>
  );
}
