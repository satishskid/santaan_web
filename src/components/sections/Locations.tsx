"use client";

import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Center {
    id: number;
    city: string;
    title: string;
    address: string;
    description: string | null;
    email: string;
    phones: string[];
    mapUrl: string | null;
    isActive: boolean;
    sortOrder: number;
}

export function Locations() {
    const [centers, setCenters] = useState<Center[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const displayCity = (city: string) => {
        if (city.toLowerCase() === 'bengaluru' || city.toLowerCase() === 'bangalore') return 'Bangalore (R&D)';
        return city;
    };

    useEffect(() => {
        const fetchCenters = async () => {
            try {
                const res = await fetch('/api/admin/centers');
                if (res.ok) {
                    const data = await res.json();
                    const desiredOrder = ['Berhampur', 'Bhubaneswar', 'Cuttack', 'Bengaluru', 'Bangalore'];
                    const orderIndex = (city: string) => {
                        const idx = desiredOrder.findIndex((x) => x.toLowerCase() === city.toLowerCase());
                        return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
                    };
                    const nextCenters = (data.centers || []) as Center[];
                    nextCenters.sort((a, b) => {
                        const ao = orderIndex(a.city);
                        const bo = orderIndex(b.city);
                        if (ao !== bo) return ao - bo;
                        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
                    });
                    setCenters(nextCenters);
                }
            } catch (error) {
                console.error('Failed to fetch centers:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCenters();
    }, []);

    return (
        <section className="py-24 bg-santaan-teal text-white relative overflow-hidden">
            {/* Abstract Pattern */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-xl">
                        <span className="text-santaan-amber font-medium tracking-wide uppercase text-sm">Contact Us</span>
                        <h2 className="text-3xl md:text-4xl font-playfair font-bold mt-2">
                            Closer to You, Wherever You Are
                        </h2>
                        <p className="text-white/80 text-sm mt-3">
                            Walk into one of our fertility clinics to get a detailed analysis of your fertility status
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-santaan-amber" />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                        {centers.map((loc, i) => (
                            <motion.div
                                key={loc.id}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/15 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h3 className="font-playfair font-bold text-2xl mb-1">{displayCity(loc.city)}</h3>
                                        <p className="text-santaan-amber text-sm">{loc.title}</p>
                                    </div>
                                    <MapPin className="w-6 h-6 text-santaan-amber" />
                                </div>
                                <p className="text-white/80 text-sm mb-4 leading-relaxed">
                                    {loc.address}
                                </p>
                                {loc.description && (
                                    <p className="text-white/60 text-xs mb-6">
                                        {loc.description}
                                    </p>
                                )}
                                
                                {/* Contact Info */}
                                <div className="space-y-3 pt-4 border-t border-white/10">
                                    <div className="flex items-start gap-2">
                                        <Mail className="w-4 h-4 text-santaan-amber mt-0.5 flex-shrink-0" />
                                        <a href={`mailto:${loc.email}`} className="text-white/90 text-sm hover:text-santaan-amber transition-colors">
                                            {loc.email}
                                        </a>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Phone className="w-4 h-4 text-santaan-amber mt-0.5 flex-shrink-0" />
                                        <div className="flex flex-col gap-1">
                                            {loc.phones.map((phone, idx) => (
                                                <a key={idx} href={`tel:${phone}`} className="text-white/90 text-sm hover:text-santaan-amber transition-colors">
                                                    {phone}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
