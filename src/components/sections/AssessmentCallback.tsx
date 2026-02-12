"use client";

import { Button } from "@/components/ui/Button";
import { MessageCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function AssessmentCallback() {
    return (
        <section id="assessment" className="py-20 md:py-24 bg-white relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-150 h-150 bg-linear-to-br from-santaan-sage/5 to-santaan-amber/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-125 h-125 bg-linear-to-tr from-santaan-teal/5 to-transparent rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center max-w-6xl mx-auto">

                    <div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-block px-4 py-1.5 rounded-full bg-santaan-teal/10 text-santaan-teal font-semibold uppercase tracking-wider text-xs mb-4">Personalized Insights</span>
                            <h2 className="text-3xl md:text-5xl font-playfair font-bold text-santaan-teal mb-6">
                                Know Your Fertility Path
                            </h2>
                            <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
                                Every journey is unique. Get science-backed insights about your fertility health and understand your next steps.
                            </p>

                            <ul className="space-y-4 mb-8">
                                {[
                                    { text: "Receive your personalized Santaan Signal score", color: "santaan-sage" },
                                    { text: "Understand factors affecting your fertility", color: "santaan-teal" },
                                    { text: "Get tailored recommendations for your timeline", color: "santaan-amber" }
                                ].map((item, i) => (
                                    <motion.li 
                                        key={i} 
                                        className="flex items-center gap-3 text-gray-700"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 + 0.3 }}
                                    >
                                        <div className={`w-6 h-6 rounded-full bg-${item.color}/20 flex items-center justify-center shrink-0`}>
                                            <CheckCircle2 className={`w-4 h-4 text-${item.color}`} />
                                        </div>
                                        <span className="font-medium">{item.text}</span>
                                    </motion.li>
                                ))}
                            </ul>

                            <p className="text-sm text-gray-600 mb-6">
                                Prefer a quick answer? Tap <span className="font-semibold text-santaan-teal">Ask Santaan AI</span> at the bottom-right.
                                For daily guidance, <a href="#newsletter" className="text-santaan-amber font-semibold hover:text-[#E08E45]">subscribe here</a>.
                            </p>

                            <a href="#santaan-signal">
                                <Button size="lg" className="bg-santaan-amber hover:bg-[#E08E45] shadow-lg shadow-santaan-amber/20 text-white font-semibold">
                                    Start Your Assessment
                                </Button>
                            </a>
                        </motion.div>
                    </div>

                    <div className="relative">
                        {/* Chat UI Mockup */}
                        <motion.div
                            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 max-w-md mx-auto relative z-10"
                            initial={{ y: 40, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-50">
                                <div className="w-12 h-12 rounded-full bg-santaan-sage/20 flex items-center justify-center">
                                    <MessageCircle className="w-6 h-6 text-santaan-teal" />
                                </div>
                                <div>
                                    <div className="font-bold text-santaan-teal">Santaan Guide</div>
                                    <div className="text-xs text-green-600 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Online Now
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-lg rounded-tl-none p-4 text-sm text-gray-700">
                                    Hi there! I'm here to help you understand your fertility health. Ready to start?
                                </div>
                                <div className="bg-santaan-teal/5 text-santaan-teal rounded-lg rounded-tr-none p-4 text-sm ml-auto max-w-[80%]">
                                    Yes, I&apos;d like to clarity on my chances.
                                </div>
                                <div className="bg-gray-50 rounded-lg rounded-tl-none p-4 text-sm text-gray-700 flex gap-2">
                                    <span className="w-1 h-4 bg-gray-400 rounded-full animate-bounce" />
                                    <span className="w-1 h-4 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                                    <span className="w-1 h-4 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Decorative elements behind phone */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-santaan-sage/30 rounded-full blur-[80px] -z-10" />
                    </div>

                </div>
            </div>
        </section>
    );
}
