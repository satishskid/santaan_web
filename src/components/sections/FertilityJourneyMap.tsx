"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Heart, Microscope, TestTube, Pill, Stethoscope, ArrowRight, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface FertilityPathway {
    age: string;
    challenges: string[];
    treatments: {
        name: string;
        icon: LucideIcon;
        description: string;
        successRate: string;
    }[];
}

const fertilityPaths: FertilityPathway[] = [
    {
        age: "<30",
        challenges: ["Ovulation disorders", "PCOS", "Irregular cycles", "Male factor"],
        treatments: [
            {
                name: "Lifestyle & Tracking",
                icon: Heart,
                description: "Optimizing health, cycle tracking, timed intercourse",
                successRate: "65-75%"
            },
            {
                name: "Ovulation Induction",
                icon: Pill,
                description: "Medications to regulate ovulation (Clomid, Letrozole)",
                successRate: "60-70%"
            },
            {
                name: "IUI",
                icon: Stethoscope,
                description: "Intrauterine insemination with partner or donor sperm",
                successRate: "15-20% per cycle"
            }
        ]
    },
    {
        age: "30-35",
        challenges: ["Declining ovarian reserve", "Endometriosis", "Tubal factors", "Male factor"],
        treatments: [
            {
                name: "IUI",
                icon: Stethoscope,
                description: "Intrauterine insemination, often combined with ovulation drugs",
                successRate: "12-18% per cycle"
            },
            {
                name: "IVF",
                icon: TestTube,
                description: "In vitro fertilization with fresh or frozen embryos",
                successRate: "40-50% per cycle"
            },
            {
                name: "Egg Freezing",
                icon: Microscope,
                description: "Preserve fertility for future family planning",
                successRate: "N/A (Preservation)"
            }
        ]
    },
    {
        age: "35-40",
        challenges: ["Reduced egg quality", "Lower AMH", "Chromosomal risks", "Fibroids"],
        treatments: [
            {
                name: "IVF with PGT",
                icon: TestTube,
                description: "IVF with genetic testing to select healthy embryos",
                successRate: "30-40% per cycle"
            },
            {
                name: "ICSI",
                icon: Microscope,
                description: "Intracytoplasmic sperm injection for fertilization",
                successRate: "35-45% per cycle"
            },
            {
                name: "Donor Eggs",
                icon: Heart,
                description: "Using donor eggs when own egg quality is compromised",
                successRate: "50-60% per cycle"
            }
        ]
    },
    {
        age: "40+",
        challenges: ["Significantly reduced ovarian reserve", "Egg quality decline", "Higher miscarriage risk"],
        treatments: [
            {
                name: "IVF with PGT-A",
                icon: TestTube,
                description: "Advanced embryo screening for chromosomal health",
                successRate: "15-25% per cycle"
            },
            {
                name: "Donor Eggs/Embryos",
                icon: Heart,
                description: "Using donor eggs offers highest success for this age group",
                successRate: "50-60% per cycle"
            },
            {
                name: "Comprehensive Care",
                icon: Stethoscope,
                description: "Personalized protocols, supplements, genetic counseling",
                successRate: "Varies"
            }
        ]
    }
];

export function FertilityJourneyMap() {
    const [selectedAge, setSelectedAge] = useState<string | null>(null);
    const [hoveredTreatment, setHoveredTreatment] = useState<string | null>(null);

    return (
        <section className="py-20 md:py-28 bg-linear-to-br from-santaan-cream via-white to-santaan-sage/10 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-santaan-teal/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-santaan-amber/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-12 md:mb-16">
                    <motion.span 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 rounded-full bg-santaan-teal/10 text-santaan-teal font-semibold uppercase tracking-wider text-xs mb-4"
                    >
                        Your Fertility Journey
                    </motion.span>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-playfair font-bold text-gray-900 mb-4"
                    >
                        Navigate Your <span className="text-santaan-amber">Fertility Path</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-gray-600 max-w-3xl mx-auto"
                    >
                        Age-wise challenges and evidence-based treatment options. Click on any age group to explore personalized pathways.
                    </motion.p>
                </div>

                {/* Age Timeline */}
                <div className="max-w-6xl mx-auto mb-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {fertilityPaths.map((path, index) => (
                            <motion.button
                                key={path.age}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => setSelectedAge(selectedAge === path.age ? null : path.age)}
                                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                                    selectedAge === path.age
                                        ? 'bg-santaan-teal text-white border-santaan-teal shadow-xl scale-105'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-santaan-teal/50 hover:shadow-lg'
                                }`}
                            >
                                <div className={`text-4xl font-bold mb-2 font-playfair ${
                                    selectedAge === path.age ? 'text-white' : 'text-santaan-teal'
                                }`}>
                                    {path.age}
                                </div>
                                <div className={`text-sm font-medium ${
                                    selectedAge === path.age ? 'text-white/90' : 'text-gray-600'
                                }`}>
                                    Years Old
                                </div>
                                {selectedAge === path.age && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-santaan-teal"
                                    />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Details Panel */}
                <AnimatePresence mode="wait">
                    {selectedAge && (
                        <motion.div
                            key={selectedAge}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4 }}
                            className="max-w-6xl mx-auto"
                        >
                            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                                {/* Challenges Section */}
                                <div className="p-8 md:p-10 border-b border-gray-100 bg-linear-to-br from-santaan-teal/5 to-white">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-full bg-santaan-teal/20 flex items-center justify-center">
                                            <Info className="w-5 h-5 text-santaan-teal" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900">Common Challenges (Age {selectedAge})</h3>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        {fertilityPaths.find(p => p.age === selectedAge)?.challenges.map((challenge, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm"
                                            >
                                                <div className="w-2 h-2 rounded-full bg-santaan-amber shrink-0" />
                                                <span className="text-gray-700 font-medium">{challenge}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Treatment Options */}
                                <div className="p-8 md:p-10">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Treatment Pathways</h3>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        {fertilityPaths.find(p => p.age === selectedAge)?.treatments.map((treatment, i) => {
                                            const Icon = treatment.icon;
                                            return (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.15 }}
                                                    onHoverStart={() => setHoveredTreatment(treatment.name)}
                                                    onHoverEnd={() => setHoveredTreatment(null)}
                                                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                                                        hoveredTreatment === treatment.name
                                                            ? 'border-santaan-amber bg-santaan-amber/5 shadow-lg -translate-y-1'
                                                            : 'border-gray-200 bg-white hover:border-santaan-amber/30'
                                                    }`}
                                                >
                                                    <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center transition-colors ${
                                                        hoveredTreatment === treatment.name
                                                            ? 'bg-santaan-amber text-white'
                                                            : 'bg-santaan-teal/10 text-santaan-teal'
                                                    }`}>
                                                        <Icon className="w-7 h-7" />
                                                    </div>
                                                    <h4 className="text-lg font-bold text-gray-900 mb-2">{treatment.name}</h4>
                                                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                                        {treatment.description}
                                                    </p>
                                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                        <span className="text-xs text-gray-500 font-medium">Success Rate</span>
                                                        <span className="text-lg font-bold text-santaan-teal">
                                                            {treatment.successRate}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* CTA Footer */}
                                <div className="p-8 bg-linear-to-r from-santaan-teal/5 to-santaan-sage/10 border-t border-gray-100">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div>
                                            <p className="text-lg font-semibold text-gray-900 mb-1">
                                                Ready to start your personalized journey?
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Get your Santaan Signal assessment or speak with our fertility specialists
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <a href="#santaan-signal">
                                                <motion.button 
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="px-6 py-3 bg-santaan-amber hover:bg-santaan-amber/90 text-white font-semibold rounded-full shadow-lg flex items-center gap-2 transition-colors"
                                                >
                                                    Take Assessment
                                                    <ArrowRight className="w-4 h-4" />
                                                </motion.button>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Default Message */}
                {!selectedAge && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <Users className="w-16 h-16 text-santaan-teal/30 mx-auto mb-4" />
                        <p className="text-xl text-gray-500 font-medium">
                            Select an age range above to explore personalized fertility pathways
                        </p>
                    </motion.div>
                )}

                {/* Disclaimer */}
                <div className="mt-12 text-center max-w-4xl mx-auto">
                    <p className="text-sm text-gray-500 italic">
                        <strong>Note:</strong> Success rates are approximate and vary based on individual health factors, diagnosis, and treatment protocols. 
                        Consult with our fertility specialists for personalized guidance based on your unique situation.
                    </p>
                </div>
            </div>
        </section>
    );
}
