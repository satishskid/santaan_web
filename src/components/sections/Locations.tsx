"use client";

import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const locations = [
    {
        city: "Bhubaneswar",
        title: "The Temple City",
        address: "District Center, Chandrasekharpur & IRC Village",
        description: "Our flagship center of excellence featuring advanced IVF labs and the Santaan Academy."
    },
    {
        city: "Berhampur",
        title: "The Silk City",
        address: "Comprehensive Fertility Care Center",
        description: "Bringing world-class fertility solutions to Southern Odisha."
    },
    {
        city: "Bangalore",
        title: "Silicon Valley of India",
        address: "New Center of Innovation",
        description: "Expanding our footprint with tech-integrated fertility care."
    }
];

export function Locations() {
    return (
        <section className="py-24 bg-santaan-teal text-white relative overflow-hidden">
            {/* Abstract Pattern */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-xl">
                        <span className="text-santaan-amber font-medium tracking-wide uppercase text-sm">Our Presence</span>
                        <h2 className="text-3xl md:text-4xl font-playfair font-bold mt-2">
                            Closer to You, Wherever You Are
                        </h2>
                    </div>
                    <button className="text-white border border-white/30 px-6 py-2 rounded-full hover:bg-white/10 transition-colors">
                        View All Centers
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {locations.map((loc, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/15 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="font-playfair font-bold text-2xl mb-1">{loc.city}</h3>
                                    <p className="text-santaan-amber text-sm">{loc.title}</p>
                                </div>
                                <MapPin className="w-6 h-6 text-santaan-amber" />
                            </div>
                            <p className="text-white/80 text-sm mb-4 leading-relaxed">
                                {loc.address}
                            </p>
                            <p className="text-white/60 text-xs">
                                {loc.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
