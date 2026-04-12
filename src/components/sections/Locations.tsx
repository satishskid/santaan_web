"use client";

import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, ExternalLink } from 'lucide-react';
import type { ElementType } from 'react';
import { CENTER_CONTACTS } from '@/data/centers';

interface Center {
    id: string;
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

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

interface LocationsProps {
    headingAs?: Extract<ElementType, 'h1' | 'h2'>;
}

const PUBLIC_CENTERS: Center[] = CENTER_CONTACTS.map((center, index) => ({
    id: `center-${index + 1}`,
    city: center.city,
    title: center.name,
    address: center.city === 'Bangalore' ? 'Brookefield, Bengaluru, Karnataka' : `${center.city}, Odisha`,
    description: 'Contact our team for exact landmark details and appointment coordination.',
    email: 'info@santaan.in',
    phones: center.phones,
    mapUrl: null,
    isActive: true,
    sortOrder: index + 1,
}));

export function Locations({ headingAs = 'h2' }: LocationsProps) {
    const HeadingTag = headingAs;

    const trackLocationEvent = (eventLabel: string) => {
        if (typeof window === 'undefined') return;
        const analyticsWindow = window as GtagWindow;
        if (!analyticsWindow.gtag) return;

        analyticsWindow.gtag('event', 'click', {
            event_category: 'contact',
            event_label: eventLabel
        });
    };

    const displayCity = (city: string) => {
        if (city.toLowerCase() === 'bengaluru' || city.toLowerCase() === 'bangalore') return 'Bangalore (R&D)';
        return city;
    };

    return (
        <section className="py-24 bg-santaan-teal text-white relative overflow-hidden">
            {/* Abstract Pattern */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-xl">
                        <span className="text-santaan-amber font-medium tracking-wide uppercase text-sm">Contact Us</span>
                        <HeadingTag className="text-3xl md:text-4xl font-playfair font-bold mt-2">
                            Closer to You, Wherever You Are
                        </HeadingTag>
                        <p className="text-white/80 text-sm mt-3">
                            Walk into one of our fertility clinics to get a detailed analysis of your fertility status
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {PUBLIC_CENTERS.map((loc, i) => {
                            const mapHref = loc.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${loc.title} ${loc.city} ${loc.address}`)}`;

                            return (
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
                                        <a href={`mailto:${loc.email}`} className="text-white/90 text-sm hover:text-santaan-amber transition-colors"
                                            onClick={() => {
                                                trackLocationEvent(`location_email_${loc.city}`);
                                            }}
                                        >
                                            {loc.email}
                                        </a>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Phone className="w-4 h-4 text-santaan-amber mt-0.5 flex-shrink-0" />
                                        <div className="flex flex-col gap-1">
                                            {loc.phones.map((phone, idx) => (
                                                <a key={idx} href={`tel:${phone}`} className="text-white/90 text-sm hover:text-santaan-amber transition-colors"
                                                    onClick={() => {
                                                        trackLocationEvent(`location_phone_${loc.city}_${phone}`);
                                                    }}
                                                >
                                                    {phone}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-santaan-amber mt-0.5 flex-shrink-0" />
                                        <a
                                            href={mapHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-white/90 text-sm hover:text-santaan-amber transition-colors inline-flex items-center gap-1"
                                            onClick={() => {
                                                trackLocationEvent(`location_map_${loc.city}`);
                                            }}
                                        >
                                            Open in Maps
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
