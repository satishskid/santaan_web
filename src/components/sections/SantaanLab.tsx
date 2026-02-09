"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Microscope, Dna, Database, FileCheck, Users, BarChart3, Shield, CheckCircle2, Award, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function SantaanLab() {
    return (
        <section id="santaan-lab" className="py-24 bg-white relative overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto">
                
                {/* Main Header */}
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <span className="text-santaan-teal font-medium tracking-wide uppercase text-sm">Santaan Lab</span>
                    <h2 className="text-3xl md:text-5xl font-playfair font-bold text-gray-900 mt-2 mb-4 leading-tight">
                        Where Science Meets <span className="text-santaan-amber">Hope</span>
                    </h2>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        Unlike traditional clinics, Santaan is powered by its own advanced R&D center. <strong>Santaan Lab</strong> is where we pioneer new fertility technologies, and <strong className="text-santaan-teal">SAISOP</strong> ensures every innovation becomes consistent, measurable quality.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">

                    {/* Left: Tech Innovations */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <div className="bg-gradient-to-br from-santaan-teal/5 via-santaan-sage/5 to-santaan-amber/5 rounded-2xl p-6 border-2 border-santaan-teal/20">
                            <div className="flex items-center gap-3 mb-6">
                                <Microscope className="w-8 h-8 text-santaan-teal" />
                                <h3 className="text-2xl font-playfair font-bold text-gray-900">Explore our innovations</h3>
                            </div>

                        <div className="space-y-4">
                            <div className="bg-santaan-teal/5 p-5 rounded-xl hover:bg-santaan-teal/10 transition-colors border border-santaan-teal/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                        <Microscope className="w-5 h-5 text-santaan-teal" />
                                    </div>
                                    <h4 className="font-bold text-gray-900">FertiVision AI</h4>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    LLM-powered visual analysis model with 94.2% accuracy—sees through the quality of gametes, embryos, USG images, and other parameters to predict success rates.
                                </p>
                            </div>

                            <div className="bg-santaan-teal/5 p-5 rounded-xl hover:bg-santaan-teal/10 transition-colors border border-santaan-teal/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                        <Dna className="w-5 h-5 text-santaan-teal" />
                                    </div>
                                    <h4 className="font-bold text-gray-900">Santaan Counsel</h4>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    AI-powered treatment pathway and counselor providing personalized guidance, scientific insights, and emotional support throughout your journey.
                                </p>
                            </div>

                            <div className="bg-santaan-teal/5 p-5 rounded-xl hover:bg-santaan-teal/10 transition-colors border border-santaan-teal/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                        <Database className="w-5 h-5 text-santaan-teal" />
                                    </div>
                                    <h4 className="font-bold text-gray-900">Genomic Tech</h4>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Advanced genetic screening (PGT-A/M) to prevent hereditary conditions and optimize embryo selection.
                                </p>
                            </div>

                            <div className="bg-santaan-teal/5 p-5 rounded-xl hover:bg-santaan-teal/10 transition-colors border border-santaan-teal/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                        <Sparkles className="w-5 h-5 text-santaan-teal" />
                                    </div>
                                    <h4 className="font-bold text-gray-900">AI Companion</h4>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    24/7 support providing scientific guidance & emotional comfort throughout your cycle, trained on 10,000+ cases.
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-santaan-amber/5 to-santaan-teal/5 p-5 rounded-xl hover:from-santaan-amber/10 hover:to-santaan-teal/10 transition-colors border border-santaan-amber/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                        <Zap className="w-5 h-5 text-santaan-amber" />
                                    </div>
                                    <h4 className="font-bold text-gray-900">Femtech Accelerator & Incubator</h4>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-2">
                                    Partnering with startups and academia to test, validate, and bring cutting-edge fertility innovations from lab to clinic.
                                </p>
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    <span className="px-2 py-1 bg-white text-santaan-teal text-xs font-medium rounded-full border border-santaan-teal/20">Fertilite</span>
                                    <span className="px-2 py-1 bg-white text-santaan-teal text-xs font-medium rounded-full border border-santaan-teal/20">she&her</span>
                                    <span className="px-2 py-1 bg-white text-santaan-teal text-xs font-medium rounded-full border border-santaan-teal/20">IIT Hyderabad</span>
                                </div>
                            </div>
                        </div>
                        </div>
                    </motion.div>

                    {/* Right: SAISOP Quality Framework */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <div className="bg-gradient-to-br from-santaan-teal/5 via-santaan-amber/5 to-santaan-sage/5 rounded-2xl p-6 border-2 border-santaan-teal/20">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-6 h-6 text-santaan-amber" />
                                <h3 className="text-2xl font-playfair font-bold text-santaan-teal">SAISOP Quality Framework</h3>
                            </div>
                            <p className="text-gray-700 mb-6 text-sm leading-relaxed">
                                <strong>Santaan AI Standard Operating Protocol</strong> transforms innovation into consistent excellence—ensuring every patient receives world-class care, every single time.
                            </p>

                            {/* Four Pillars in 2x2 grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {[
                                    {
                                        icon: FileCheck,
                                        title: "Standardized Protocols",
                                        stat: "7,000+ Cases",
                                        color: "santaan-teal"
                                    },
                                    {
                                        icon: Users,
                                        title: "Team Training",
                                        stat: "100% Aligned",
                                        color: "santaan-amber"
                                    },
                                    {
                                        icon: BarChart3,
                                        title: "Real-Time Monitoring",
                                        stat: "AI-Powered",
                                        color: "santaan-sage"
                                    },
                                    {
                                        icon: Shield,
                                        title: "Quality Gates",
                                        stat: "99.8% Adherence",
                                        color: "santaan-teal"
                                    }
                                ].map((pillar, i) => {
                                    const Icon = pillar.icon;
                                    return (
                                        <div
                                            key={i}
                                            className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <Icon className={`w-6 h-6 text-${pillar.color} mb-2`} />
                                            <h4 className="font-bold text-gray-900 text-sm mb-1">{pillar.title}</h4>
                                            <p className="text-xs text-gray-500">{pillar.stat}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Key Stats */}
                            <div className="space-y-3">
                                <div className="bg-white rounded-lg p-4 border-l-4 border-santaan-teal">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-gray-600">Protocol Adherence</span>
                                        <Zap className="w-4 h-4 text-santaan-amber" />
                                    </div>
                                    <div className="text-2xl font-bold text-santaan-teal">99.8%</div>
                                </div>

                                <div className="bg-white rounded-lg p-4 border-l-4 border-santaan-amber">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-gray-600">Data Points Per Protocol</span>
                                        <BarChart3 className="w-4 h-4 text-santaan-teal" />
                                    </div>
                                    <div className="text-2xl font-bold text-santaan-amber">10,000+</div>
                                </div>
                            </div>

                            {/* Badge */}
                            <div className="mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-santaan-teal/10 border border-santaan-teal/20">
                                <Shield className="w-5 h-5 text-santaan-teal" />
                                <span className="font-bold text-santaan-teal text-sm">Your Safety. Our Standard.</span>
                            </div>

                            {/* CTA */}
                            <div className="mt-6">
                                <a href="#contact">
                                    <Button variant="default" className="w-full bg-santaan-teal hover:bg-santaan-sage text-white px-8 py-4 rounded-full text-base">
                                        Contact Us
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
