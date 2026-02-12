"use client";

import { motion } from 'framer-motion';
import { MapPin, IndianRupee, HeartCrack, Globe2 } from 'lucide-react';

const gapPoints = [
    {
        icon: MapPin,
        title: "Geographic Barriers",
        desc: "Couples travel 100-200km on average to reach quality care.",
        stat: "Only Urban Access"
    },
    {
        icon: IndianRupee,
        title: "Prohibitive Costs",
        desc: "Hidden fees & travel expenses drain family savings.",
        stat: "High Financial Stress"
    },
    {
        icon: HeartCrack,
        title: "Eroding Trust",
        desc: "Commercialized, hyper-marketed centers with zero empathy.",
        stat: "Transactional Care"
    },
    {
        icon: Globe2,
        title: "Quality Gap",
        desc: "World-class tech is concentrated only in metros.",
        stat: "Tier 2/3 Ignored"
    }
];

export function CareGap() {
    return (
        <section className="py-24 bg-santaan-dark-teal text-white relative overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 items-start">

                    <div className="lg:w-1/2 sticky top-24">
                        <span className="text-santaan-amber font-medium tracking-wide uppercase text-sm">The Reality</span>
                        <h2 className="text-3xl md:text-5xl font-playfair font-bold mt-2 mb-6 leading-tight">
                            Why is Fertility Care so <span className="text-red-400">Broken</span>?
                        </h2>
                        <div className="space-y-6">
                            <p className="text-white/80 text-lg leading-relaxed">
                                In India, <span className="font-bold text-white">27.5 Million couples</span> face fertility challenges. Yet, for most, the journey is filled with barriers, not hope.
                            </p>
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-xl">
                                <h4 className="font-bold text-xl mb-2 text-santaan-amber">The &quot;Quality Care Gap&quot;</h4>
                                <p className="text-base text-white/80 leading-relaxed">
                                    Clinics are crowded in metros. If you live in a smaller town, you are forced to choose between <strong className="text-white bg-red-500/20 px-1 rounded">traveling constantly</strong> or <strong className="text-white bg-red-500/20 px-1 rounded">compromising on quality</strong>.
                                </p>
                            </div>

                            <div className="pt-4">
                                <p className="text-white/60 text-sm mb-4">It doesn&apos;t have to be this way.</p>
                                <a href="#contact">
                                    <button className="bg-gradient-to-r from-santaan-amber to-orange-500 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2">
                                        Bridge the Gap with Santaan
                                        <Globe2 className="w-5 h-5" />
                                    </button>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/2 grid grid-cols-1 gap-6">
                        {gapPoints.map((point, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/5 p-6 rounded-xl hover:bg-white/10 transition-colors border border-white/5 flex gap-5 items-start"
                            >
                                <div className="bg-white/10 p-3 rounded-lg shrink-0">
                                    <point.icon className="w-6 h-6 text-red-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1 text-white">{point.title}</h3>
                                    <p className="text-red-300/80 text-xs font-mono uppercase tracking-wider mb-2">{point.stat}</p>
                                    <p className="text-sm text-white/70 leading-relaxed">
                                        {point.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
