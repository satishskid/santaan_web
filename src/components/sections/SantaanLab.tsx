"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Microscope, Dna, Database } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function SantaanLab() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div>
                            <span className="text-santaan-teal font-medium tracking-wide uppercase text-sm">Santaan Lab</span>
                            <h2 className="text-3xl md:text-5xl font-playfair font-bold text-gray-900 mt-2 mb-4 leading-tight">
                                Where Science Meets <span className="text-santaan-amber">Hope</span>
                            </h2>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                Unlike traditional clinics, Santaan is powered by its own advanced R&D center. **Santaan Lab** is where we pioneer new fertility technologies to solve the most complex cases.
                            </p>
                        </div>

                        <div className="space-y-8">
                            {/* AI & Tech Highlights */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div className="bg-santaan-teal/5 p-4 rounded-xl hover:bg-santaan-teal/10 transition-colors">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <Microscope className="w-5 h-5 text-santaan-teal" />
                                        </div>
                                        <h3 className="font-bold text-gray-900">FertiVision</h3>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Visual AI model with 94.2% accuracy for embryo selection, ensuring higher success rates.
                                    </p>
                                </div>

                                <div className="bg-santaan-teal/5 p-4 rounded-xl hover:bg-santaan-teal/10 transition-colors">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <Dna className="w-5 h-5 text-santaan-teal" />
                                        </div>
                                        <h3 className="font-bold text-gray-900">AI Companion</h3>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        24/7 support providing scientific guidance & emotional comfort throughout your cycle.
                                    </p>
                                </div>

                                <div className="bg-santaan-teal/5 p-4 rounded-xl hover:bg-santaan-teal/10 transition-colors">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <Database className="w-5 h-5 text-santaan-teal" />
                                        </div>
                                        <h3 className="font-bold text-gray-900">Genomic Tech</h3>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Advanced genetic screening (PGT-A/M) to prevent hereditary conditions.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button variant="default" className="mt-8 bg-santaan-teal hover:bg-santaan-sage text-white px-8 py-6 rounded-full text-lg">
                            Explore Our Innovation
                        </Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl"
                    >
                        {/* Using abstract/lab imagery placeholder for now, would be replaced by specific lab photo if available */}
                        <div className="absolute inset-0 bg-gradient-to-br from-santaan-teal/90 to-santaan-sage/90 mix-blend-multiply z-10" />
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="text-center text-white p-8">
                                <Microscope className="w-24 h-24 mx-auto mb-6 opacity-30" />
                                <h3 className="font-playfair text-3xl font-bold mb-2">The Engine of Santaan</h3>
                                <p className="text-white/80">Innovation happens here, everyday.</p>
                            </div>
                        </div>
                        {/* Fallback pattern if no image */}
                        <div className="absolute inset-0 bg-[url('/assets/pattern-bg.png')] opacity-20" />
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
