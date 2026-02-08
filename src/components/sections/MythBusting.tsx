"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, XCircle, CheckCircle, BookOpen } from 'lucide-react';

const MYTHS = [
    {
        id: 1,
        myth: "Just relax, it will happen naturally.",
        fact: "Stress is rarely the sole cause—medical issues need medical solutions.",
        story: "Aditi heard 'just relax' from everyone. She tried yoga, vacations, and meditation. The guilt of 'not relaxing enough' was crushing. When she visited Santaan, we found blocked tubes—no amount of relaxation could fix that. Stress management helps, but real medical issues need real solutions.",
        category: "Common Myths"
    },
    {
        id: 2,
        myth: "Regular periods mean you're fertile.",
        fact: "Periods don't guarantee ovulation or egg quality.",
        story: "Meera had perfect 28-day cycles. At 36, she assumed all was well. But an AMH test showed low ovarian reserve. Regular bleeding can happen without ovulation (anovulatory cycles). Periods show uterine health, not necessarily egg quality.",
        category: "Female Fertility"
    },
    {
        id: 3,
        myth: "Infertility is always the woman's fault.",
        fact: "Male factor causes 40-50% of infertility cases.",
        story: "Rajesh felt fit and healthy—why would he get tested? For 2 years, his wife underwent treatments alone. A simple semen analysis revealed low motility. Treating him was faster and simpler. Fertility is a couple's journey, not a blame game.",
        category: "Male Fertility"
    },
    {
        id: 4,
        myth: "IVF always gives you twins or triplets.",
        fact: "Single embryo transfer (SET) is the modern standard.",
        story: "Priya feared having 'too many' babies. At Santaan, we explained our One Healthy Baby policy. Using FertiVision AI, we transfer the single best embryo. Modern IVF is about precision and safety, not numbers.",
        category: "Treatment Options"
    },
    {
        id: 5,
        myth: "PCOS means you can never have children.",
        fact: "PCOS is highly treatable—it's not a dead end.",
        story: "Sagarika was told at 22 she'd never be a mother. She carried that pain for years. But PCOS mainly affects ovulation timing. With lifestyle changes or simple medication, most women with PCOS conceive. It's a hurdle, not a wall.",
        category: "Medical Conditions"
    },
    {
        id: 6,
        myth: "Wait at least a year before seeing a doctor.",
        fact: "If you're 35+, see a doctor after 6 months. Don't wait.",
        story: "Time is fertility's currency. Under 35? Try for a year. Over 35, or have irregular periods, pain, or past surgeries? Don't wait. Early intervention is simpler, less invasive, and more successful.",
        category: "When to Act"
    },
    {
        id: 7,
        myth: "Adoption is easier than fertility treatment.",
        fact: "Both paths are valid, but fertility treatment success rates are high.",
        story: "Reena was pressured to 'just adopt' instead of trying IVF. But she wanted to experience pregnancy. With personalized treatment, she conceived on her second cycle. Every family-building path is personal—there's no 'easier' choice.",
        category: "Family Building"
    },
    {
        id: 8,
        myth: "After 40, you can't have biological children.",
        fact: "Age matters, but 40+ pregnancies happen with proper care.",
        story: "Sunita was 41 when she came to us. Other clinics said she was 'too old.' Using genetic testing and optimized protocols, she delivered a healthy baby girl. Age affects success rates, but hope has no age limit.",
        category: "Age Factors"
    },
    {
        id: 9,
        myth: "IVF babies have more health problems.",
        fact: "IVF babies are as healthy as naturally conceived babies.",
        story: "Amit worried his IVF baby would be 'different.' Decades of research show IVF children are just as healthy. In fact, genetic screening can prevent certain conditions. The method of conception doesn't determine health—prenatal care does.",
        category: "Treatment Safety"
    }
];

export function MythBusting() {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    return (
        <section className="py-20 md:py-24 bg-gradient-to-b from-white via-santaan-cream/30 to-white" id="myth-busting">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12 md:mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-santaan-amber/10 text-santaan-amber font-semibold uppercase tracking-wider text-xs mb-4">Clarifying the Confusion</span>
                    <h2 className="text-3xl md:text-5xl font-playfair font-bold text-santaan-teal mb-4">
                        Busting Myths, Building Hope
                    </h2>
                    <p className="text-gray-700 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                        Fertility is surrounded by folklore and unsolicited advice. Knowledge is the best antidote to anxiety.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
                    {MYTHS.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: (item.id % 3) * 0.1 }}
                            className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border-2 ${expandedId === item.id ? 'border-santaan-teal/40 shadow-santaan-teal/10' : 'border-transparent hover:border-santaan-sage/20'}`}
                        >
                            <button
                                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                className="w-full text-left p-5 md:p-6 flex items-start gap-3 md:gap-4 hover:bg-santaan-cream/30 transition-colors"
                            >
                                <div className={`mt-0.5 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${expandedId === item.id ? 'bg-santaan-teal text-white' : 'bg-red-50 text-red-500'}`}>
                                    {expandedId === item.id ? <BookOpen className="w-4 h-4" /> : <XCircle className="w-4 h-4 md:w-5 md:h-5" />}
                                </div>
                                <div className="flex-grow">
                                    <span className="text-[10px] md:text-xs font-bold text-santaan-teal/60 uppercase tracking-wider mb-1.5 block">
                                        {item.category}
                                    </span>
                                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 leading-snug">
                                        &ldquo;{item.myth}&rdquo;
                                    </h3>
                                    <div className="flex items-start gap-2 text-emerald-600 font-medium text-xs md:text-sm">
                                        <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span className="leading-relaxed">{item.fact}</span>
                                    </div>
                                </div>
                                <div className="mt-1 text-gray-400 shrink-0">
                                    {expandedId === item.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </div>
                            </button>

                            <AnimatePresence>
                                {expandedId === item.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 md:px-6 pb-5 md:pb-6 text-gray-700 bg-gradient-to-b from-santaan-cream/20 to-transparent">
                                            <div className="pt-4 border-t border-santaan-sage/20">
                                                <h4 className="font-playfair font-bold text-santaan-teal mb-3 flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4" />
                                                    The Real Story
                                                </h4>
                                                <p className="text-sm md:text-base leading-relaxed">
                                                    {item.story}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
