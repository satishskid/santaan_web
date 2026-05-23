"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { ElementType } from 'react';
import { CENTER_PROFILES, buildPrimaryWhatsappUrl, getCenterMapsUrl } from '@/data/centers';

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

interface LocationsProps {
    headingAs?: Extract<ElementType, 'h1' | 'h2'>;
}

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

    return (
        <section className="py-24 bg-santaan-teal text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-2xl">
                        <span className="text-santaan-amber font-medium tracking-wide uppercase text-sm">Contact Us</span>
                        <HeadingTag className="text-3xl md:text-4xl font-playfair font-bold mt-2">
                            Closer to You, Wherever You Are
                        </HeadingTag>
                        <p className="text-white/80 text-sm mt-3">
                            Explore Santaan fertility centres by city, view local clinic details, and open a dedicated city page for next-step guidance.
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
                    {CENTER_PROFILES.map((loc, i) => {
                        const mapHref = getCenterMapsUrl(loc);

                        return (
                            <motion.article
                                key={loc.slug}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.12 }}
                                className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/15 transition-colors flex flex-col"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h3 className="font-playfair font-bold text-2xl mb-1">{loc.city}</h3>
                                        <p className="text-santaan-amber text-sm">{loc.centerName}</p>
                                    </div>
                                    <MapPin className="w-6 h-6 text-santaan-amber shrink-0" />
                                </div>

                                <p className="text-white/85 text-sm leading-relaxed">{loc.addressLine}</p>
                                <p className="text-white/65 text-xs mt-3 leading-relaxed">{loc.summary}</p>
                                {loc.landmark ? (
                                    <p className="text-white/75 text-xs mt-2 leading-relaxed">
                                        Landmark: {loc.landmark}
                                    </p>
                                ) : null}
                                {loc.hours.length > 0 ? (
                                    <p className="text-white/75 text-xs mt-2 leading-relaxed">
                                        Timings: {loc.hours[0].replace('Monday: ', '')} Monday to Saturday, Sunday closed
                                    </p>
                                ) : null}

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {loc.areaServed.map((area) => (
                                        <span
                                            key={area}
                                            className="rounded-full bg-white/10 border border-white/10 px-2.5 py-1 text-[11px] text-white/80"
                                        >
                                            {area}
                                        </span>
                                    ))}
                                </div>

                                <div className="space-y-3 pt-5 mt-6 border-t border-white/10">
                                    <div className="flex items-start gap-2">
                                        <Mail className="w-4 h-4 text-santaan-amber mt-0.5 flex-shrink-0" />
                                        <a
                                            href={`mailto:${loc.email}`}
                                            className="text-white/90 text-sm hover:text-santaan-amber transition-colors"
                                            onClick={() => trackLocationEvent(`location_email_${loc.city}`)}
                                        >
                                            {loc.email}
                                        </a>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <Phone className="w-4 h-4 text-santaan-amber mt-0.5 flex-shrink-0" />
                                        <div className="flex flex-col gap-1">
                                            {loc.phones.map((phone) => {
                                                const telHref = `tel:${phone.replace(/[^0-9+]/g, '')}`;
                                                return (
                                                    <a
                                                        key={phone}
                                                        href={telHref}
                                                        data-cta-kind="call"
                                                        data-center={loc.city}
                                                        data-cta-target={telHref}
                                                        className="text-white/90 text-sm hover:text-santaan-amber transition-colors"
                                                        onClick={() => trackLocationEvent(`location_phone_${loc.city}_${phone}`)}
                                                    >
                                                        {phone}
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-santaan-amber mt-0.5 flex-shrink-0" />
                                        <a
                                            href={mapHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-white/90 text-sm hover:text-santaan-amber transition-colors inline-flex items-center gap-1"
                                            onClick={() => trackLocationEvent(`location_map_${loc.city}`)}
                                        >
                                            Open in Maps
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                </div>

                                {loc.reviews && loc.reviews.length > 0 ? (
                                    <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-[11px] uppercase tracking-[0.2em] text-santaan-amber font-semibold">
                                            Patient voice
                                        </p>
                                        <p className="mt-2 text-sm text-white/90 leading-relaxed">
                                            “{loc.reviews[0].quote}”
                                        </p>
                                        <p className="mt-2 text-[11px] text-white/60">
                                            {loc.reviews[0].author} • {loc.reviews[0].meta}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-[11px] uppercase tracking-[0.2em] text-santaan-amber font-semibold">
                                            Patient voice
                                        </p>
                                        <p className="mt-2 text-sm text-white/70 leading-relaxed">
                                            Reviews will be added as approved patient feedback becomes available.
                                        </p>
                                    </div>
                                )}

                                <div className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-3">
                                    <Link
                                        href={loc.href}
                                        className="inline-flex items-center justify-between rounded-xl bg-white text-santaan-teal px-4 py-3 text-sm font-semibold hover:bg-santaan-cream transition-colors"
                                        onClick={() => trackLocationEvent(`location_page_${loc.city}`)}
                                    >
                                        Explore {loc.city} page
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <a
                                        href={buildPrimaryWhatsappUrl(`Hi, I'd like to book a consultation for ${loc.city}`)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        data-cta-kind="book"
                                        data-center={loc.city}
                                        data-cta-target="whatsapp_booking"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold hover:bg-white/10 transition-colors"
                                        onClick={() => trackLocationEvent(`location_book_${loc.city}`)}
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Book on WhatsApp
                                    </a>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
