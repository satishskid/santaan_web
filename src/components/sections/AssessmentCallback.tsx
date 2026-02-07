"use client";

import { Button } from "@/components/ui/Button";
import { MessageCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function AssessmentCallback() {
    return (
        <section id="assessment" className="py-24 bg-santaan-cream relative overflow-hidden">
            {/* Background decorative blob */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-santaan-sage/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

            <div className="container mx-auto px-4 md:px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    <div className="relative z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="text-santaan-teal font-medium uppercase tracking-wider text-sm mb-2 block">Personalized Insights</span>
                            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-santaan-teal mb-6">
                                Know Your Fertility Path
                            </h2>
                            <p className="text-xl text-gray-600 mb-8 max-w-xl">
                                Every journey is different. Answer a few simple questions to understand where you are, and let us guide you to the next step with confidence.
                            </p>

                            <ul className="space-y-4 mb-10">
                                {[
                                    "Receive a personalized fertility score",
                                    "Understand potential factors affecting you",
                                    "Get tailored advice for your timeline"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700">
                                        <CheckCircle2 className="w-5 h-5 text-santaan-sage" />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <Button size="lg" className="bg-santaan-amber hover:bg-[#E08E45] shadow-lg shadow-santaan-amber/20">
                                Start Assessment
                            </Button>
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
                                    Yes, I'd like to clarity on my chances.
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
