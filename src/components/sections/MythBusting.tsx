
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, XCircle, CheckCircle, BookOpen } from 'lucide-react';

const MYTHS = [
    {
        id: 1,
        myth: "Stress is the main reason you aren't conceiving.",
        fact: "Stress is rarely the sole cause of infertility.",
        story: "Aditi heard 'just relax' from every auntie at every wedding. She took vacations, did yoga, and meditated. Yet, month after month, the test was negative. The guilt of 'not relaxing enough' added to her burden. When she finally visited Santaan, we found blocked tubes—a physical condition that no amount of relaxation could unblock. Stress management helps copings, but medical issues need medical solutions. Don't blame yourself.",
        category: "Emotional Wellbeing"
    },
    {
        id: 2,
        myth: "If you have periods, you are fertile.",
        fact: "Regular periods do not guarantee ovulation or egg quality.",
        story: "Meera prided herself on her clockwork 28-day cycles. At 36, she assumed everything was fine. But regular bleeding can happen even without ovulation (anovulatory cycles), or egg quality might be low age-related decline. A simple AMH test revealed her ovarian reserve was lower than expected. Periods are a sign of the uterus shedding, not necessarily a sign of a high-quality egg being released.",
        category: "Biological"
    },
    {
        id: 3,
        myth: "Infertility is a 'woman's problem'.",
        fact: "Male factor contributes to 40-50% of infertility cases.",
        story: "Rajesh hesitated to get tested. He felt fit, went to the gym, and had no 'performance' issues. For two years, his wife underwent treatments alone. When they finally came to Santaan, a simple semen analysis showed low motility. It was a turning point. Treating him was simpler and faster than the complex protocols his wife was enduring. Fertility is a couple's equation.",
        category: "Male Factor"
    },
    {
        id: 4,
        myth: "IVF always results in twins or triplets.",
        fact: "Modern single embryo transfer (SET) prioritizes one healthy baby.",
        story: "The fear of a 'litter' kept Priya away from IVF. She imagined chaotic scenes from movies. At Santaan, we explained our 'One Healthy Baby' policy. Using advanced FertiVision AI, we select the single best embryo for transfer. This minimizes the risks associated with multiple pregnancies for both mother and child. IVF today is about precision, not numbers.",
        category: "Treatment"
    },
    {
        id: 5,
        myth: "PCOS means you can't get pregnant.",
        fact: "PCOS is the most common, treatable cause of infertility.",
        story: "Sagarika was diagnosed with PCOS in college and told she'd never be a mother. That heartbreak stayed with her. But PCOS mainly affects ovulation timing. With simple ovulation induction or lifestyle changes, many women with PCOS conceive naturally or with minimal help. It's a hurdle, not a dead end.",
        category: "Medical Conditions"
    },
    {
        id: 6,
        myth: "You should wait at least a year before seeing a doctor.",
        fact: "If you are 35+, wait only 6 months. If you have known issues, don't wait.",
        story: "Conventional wisdom says 'keep trying'. But time is fertility's currency. Ideally, if you are under 35, try for a year. But if you are over 35, or have irregular periods, pain, or history of surgery, waiting just depletes your reserve. Early intervention is often simpler and less invasive.",
        category: "Timing"
    }
];

export function MythBusting() {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    return (
        <section className="py-24 bg-santaan-cream" id="myth-busting">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <span className="text-santaan-amber font-medium uppercase tracking-wider text-sm mb-2 block">Clarifying the Confusion</span>
                    <h2 className="text-3xl md:text-5xl font-playfair font-bold text-santaan-teal mb-6">
                        Busting Mtyhs, Building Hope
                    </h2>
                    <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                        Fertility is surrounded by folklore and unsolicited advice. We believe knowledge is the best antidote to anxiety.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {MYTHS.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 ${expandedId === item.id ? 'ring-2 ring-santaan-teal/20' : ''}`}
                        >
                            <button
                                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                className="w-full text-left p-6 flex items-start gap-4"
                            >
                                <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${expandedId === item.id ? 'bg-santaan-teal text-white' : 'bg-red-50 text-red-500'}`}>
                                    {expandedId === item.id ? <BookOpen className="w-4 h-4" /> : <XCircle className="w-5 h-5" />}
                                </div>
                                <div className="flex-grow">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">
                                        {item.category}
                                    </span>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        "{item.myth}"
                                    </h3>
                                    <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Fact: {item.fact}</span>
                                    </div>
                                </div>
                                <div className="mt-1 text-gray-400">
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
                                        <div className="p-6 pt-0 text-gray-600 border-t border-gray-100 bg-gray-50/50">
                                            <div className="pt-4">
                                                <h4 className="font-playfair font-bold text-santaan-teal mb-2">The Real Story</h4>
                                                <p className="leading-relaxed italic">
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
