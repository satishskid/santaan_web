"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
    {
        question: "What is the success rate of IVF at Santaan?",
        answer: "Our success rates are consistently above global averages, ranging from 65-78% depending on age and specific conditions. We use advanced embryology visualization to select the healthiest embryos.",
    },
    {
        question: "How much does a typical fertility treatment cost?",
        answer: "Costs vary by treatment type (IUI vs IVF). We believe in complete transparency—our packages are all-inclusive with no hidden fees. You can use our cost calculator or book a free financial counseling session.",
    },
    {
        question: "Do I really need IVF? Are there other options?",
        answer: "Not everyone needs IVF. In fact, many couples conceive with simpler interventions like IUI, medication, or lifestyle optimization. We start with a comprehensive 'Fertility Scan' to find the least invasive effective path.",
    },
    {
        question: "Is the procedure painful?",
        answer: "Most fertility procedures cause minimal discomfort. Egg retrieval is done under gentle sedation, so you sleep through it. Our 'Comfort-First' protocol ensures you feel safe and cared for at every step.",
    },
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-playfair font-bold text-santaan-teal mb-4">
                        Your Questions, Answered
                    </h2>
                    <p className="text-gray-600">
                        Clear answers to common concerns. No medical jargon.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`border rounded-xl transition-all ${openIndex === index ? 'border-santaan-amber bg-santaan-cream/30' : 'border-gray-200 hover:border-santaan-teal/30'}`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left"
                            >
                                <span className={`text-lg font-medium ${openIndex === index ? 'text-santaan-teal' : 'text-gray-700'}`}>
                                    {faq.question}
                                </span>
                                {openIndex === index ? (
                                    <Minus className="w-5 h-5 text-santaan-amber flex-shrink-0" />
                                ) : (
                                    <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                )}
                            </button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-transparent">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
