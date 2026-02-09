"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
    {
        question: "What is the Santaan Companion?",
        answer: "It’s our AI guide that answers fertility questions in simple language—any time of day. It’s great for quick clarity, while your doctor handles personal medical decisions.",
    },
    {
        question: "How do I know if I should see a specialist?",
        answer: "If you’re under 35 and trying for 12 months, or 35+ and trying for 6 months, it’s a good time to consult. Irregular cycles, pain, or past surgeries are reasons to come sooner.",
    },
    {
        question: "Do I need IVF, or are there simpler options?",
        answer: "Many couples conceive with simpler steps like ovulation support, IUI, or lifestyle changes. We begin with a fertility check and recommend the least invasive effective path.",
    },
    {
        question: "What tests are usually done first?",
        answer: "Typically: hormone tests, ultrasound, and a semen analysis. These give a clear picture and help plan next steps quickly.",
    },
    {
        question: "Is IVF painful?",
        answer: "Most people feel minimal discomfort. Egg retrieval is done with gentle sedation, and we use comfort-first protocols for recovery.",
    },
    {
        question: "How long does IVF take?",
        answer: "A full cycle usually takes 4–6 weeks from start to transfer. We explain the timeline clearly before you begin.",
    },
    {
        question: "What affects IVF success the most?",
        answer: "Age, egg quality, sperm quality, and overall health are key. Our team focuses on optimizing these before and during treatment.",
    },
    {
        question: "Are IVF babies healthy?",
        answer: "Yes. Decades of research show IVF children are as healthy as naturally conceived children, especially with good prenatal care.",
    },
    {
        question: "Does male fertility matter?",
        answer: "Yes—male factors contribute in nearly half of cases. A simple test can provide important answers early.",
    },
    {
        question: "Can PCOS or thyroid issues be treated?",
        answer: "Yes. These are common and manageable. With the right plan, many people conceive naturally or with minimal support.",
    },
    {
        question: "What does treatment cost?",
        answer: "Costs vary by treatment type. We keep pricing transparent and explain options clearly before you decide.",
    },
    {
        question: "How do I get started with Santaan?",
        answer: "Begin with the Santaan Signal assessment, ask the Companion for quick guidance, or book a consultation. We’ll help you choose the right next step.",
    },
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-playfair font-bold text-santaan-teal mb-4">
                        Your Questions, Answered — by Santaan Companion
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
                                    <Minus className="w-5 h-5 text-santaan-amber shrink-0" />
                                ) : (
                                    <Plus className="w-5 h-5 text-gray-400 shrink-0" />
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
