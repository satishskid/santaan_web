"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, XCircle, CheckCircle, BookOpen } from 'lucide-react';

const MYTHS = [
    {
        id: 1,
        myth: "Just relax, it will happen naturally.",
        fact: "Stress matters, but it is rarely the only cause. Medical checks bring clarity.",
        story: "Aditi tried every calming ritual and still felt stuck. A simple scan revealed a tubal blockage. With the right treatment, her path opened. Calm helps the heart; diagnosis helps the journey.",
        category: "Common Myths"
    },
    {
        id: 2,
        myth: "Regular periods mean you're fertile.",
        fact: "Periods show rhythm, not necessarily ovulation or egg quality.",
        story: "Meera had clockwork cycles, yet her AMH was low. We explained that cycles can be regular even when ovulation is weak. A few targeted tests gave her a real map.",
        category: "Female Fertility"
    },
    {
        id: 3,
        myth: "Infertility is always the woman's fault.",
        fact: "Male factors contribute in nearly half of cases.",
        story: "Rajesh felt healthy and assumed tests were unnecessary. One semen analysis showed low motility—an easy starting point. Fertility is a shared story, never a solo blame.",
        category: "Male Fertility"
    },
    {
        id: 4,
        myth: "IVF always gives you twins or triplets.",
        fact: "Single embryo transfer is now the safest standard.",
        story: "Priya feared multiple births. We explained our One Healthy Baby policy and chose the strongest embryo. Modern IVF is precision-first, safety-first.",
        category: "Treatment Options"
    },
    {
        id: 5,
        myth: "PCOS means you can never have children.",
        fact: "PCOS is common and highly treatable.",
        story: "Sagarika carried years of fear after a quick diagnosis. We focused on ovulation support and gentle lifestyle changes. It was a hurdle, not a wall—and her cycle found its rhythm again.",
        category: "Medical Conditions"
    },
    {
        id: 6,
        myth: "Wait at least a year before seeing a doctor.",
        fact: "If you’re 35+ or have irregular cycles, consult after 6 months.",
        story: "Time is fertility’s gentle clock. Earlier guidance often means simpler, less invasive care. A quick check can prevent months of worry.",
        category: "When to Act"
    },
    {
        id: 7,
        myth: "Adoption is easier than fertility treatment.",
        fact: "Both are beautiful paths, and neither is ‘easy.’",
        story: "Reena felt pushed toward a single option. We reminded her the right path is personal. She chose treatment and conceived; others choose adoption and thrive. The goal is family, your way.",
        category: "Family Building"
    },
    {
        id: 8,
        myth: "After 40, you can't have biological children.",
        fact: "Age impacts success rates, but pregnancies after 40 do happen.",
        story: "Sunita came at 41 feeling dismissed elsewhere. With careful planning and the right protocols, she welcomed a healthy baby. Hope has no age limit—only a need for clarity.",
        category: "Age Factors"
    },
    {
        id: 9,
        myth: "IVF babies have more health problems.",
        fact: "IVF children are as healthy as naturally conceived children.",
        story: "Amit feared his baby would be ‘different.’ We shared decades of evidence and the role of careful prenatal care. The method of conception does not define health—care does.",
        category: "Treatment Safety"
    }
];

export function MythBusting() {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    return (
        <section className="py-20 md:py-24 bg-linear-to-b from-white via-santaan-cream/30 to-white" id="myth-busting">
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
                                <div className="grow">
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
                                        <div className="px-5 md:px-6 pb-5 md:pb-6 text-gray-700 bg-linear-to-b from-santaan-cream/20 to-transparent">
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
