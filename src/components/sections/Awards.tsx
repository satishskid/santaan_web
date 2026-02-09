"use client";

import { motion } from 'framer-motion';
import { Award, Trophy } from 'lucide-react';

const awards = [
    {
        title: "Fertility Tech Solution of the Year",
        org: "National Awards 2024",
        desc: "Recognized for pioneering AI in fertility care.",
        icon: Award
    },
    {
        title: "No. 1 IVF & Fertility Clinic",
        org: "Times Health Icons 2024",
        desc: "Ranked #1 in Odisha for patient outcomes and service excellence.",
        icon: Trophy
    },
    {
        title: "Top 10 Fertility Centres",
        org: "All India Rankings (East Zone)",
        desc: "Consistently ranked among the best since 2017.",
        icon: Award
    },
    {
        title: "Most Awarded Centre",
        org: "Odisha & Eastern India",
        desc: "Honored for passionate service and dedication to families.",
        icon: Trophy
    }
];

export function Awards() {
    return (
        <section id="awards" className="py-24 bg-santaan-cream/50 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-santaan-sage/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="text-center mb-16">
                    <span className="text-santaan-teal font-medium tracking-wide uppercase text-sm">Passionate Service</span>
                    <h2 className="text-3xl md:text-4xl font-playfair font-bold text-gray-900 mt-2 mb-4">
                        Celebrated for <span className="text-santaan-amber">Excellence</span>
                    </h2>
                    <p className="text-black max-w-2xl mx-auto">
                        Our commitment to your journey has been recognized by the nation's most prestigious healthcare institutions.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {awards.map((award, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-transparent hover:border-santaan-amber/20 group text-center"
                        >
                            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-santaan-amber/10 flex items-center justify-center text-santaan-amber group-hover:scale-110 transition-transform duration-300">
                                <award.icon className="w-8 h-8" />
                            </div>
                            <h3 className="font-playfair font-bold text-lg text-gray-900 mb-2 leading-tight">{award.title}</h3>
                            <p className="text-santaan-teal text-sm font-medium mb-3">{award.org}</p>
                            <p className="text-gray-500 text-xs leading-relaxed">
                                {award.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
