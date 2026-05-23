"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Phone, Calendar, MessageCircle } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { PRIMARY_CALL_HREF, PRIMARY_CALL_NUMBER, PRIMARY_WHATSAPP_BOOKING_URL } from '@/data/centers';

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

const navigation = [
    { name: 'IVF centres', href: '/contact-centres' },
    { name: 'Female fertility', href: '/female-fertility' },
    { name: 'Male fertility', href: '/male-infertility-clinic' },
    { name: 'Treatments', href: '/treatments' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Success rates', href: '/success-rates' },
    { name: 'Fertility doctors', href: '/our-doctors' },
    { name: 'Fertility insights', href: '/fertility-insights' },
    { name: 'Doctor insights', href: '/clinical-insights' },
];

function trackHeaderEvent(label: string) {
    if (typeof window === 'undefined') return;
    const analyticsWindow = window as GtagWindow;
    if (!analyticsWindow.gtag) return;

    analyticsWindow.gtag('event', 'click', {
        event_category: 'engagement',
        event_label: label,
    });
}

export function HeaderClient() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinkClass = cn(
        'text-xs lg:text-sm font-medium whitespace-nowrap transition-colors',
        isScrolled ? 'text-gray-700 hover:text-santaan-teal' : 'text-white/90 hover:text-santaan-amber drop-shadow-sm'
    );

    const actionLinkClass = cn(
        'inline-flex items-center gap-2 text-xs lg:text-sm font-semibold transition-colors whitespace-nowrap',
        isScrolled ? 'text-santaan-teal hover:text-santaan-amber' : 'text-white hover:text-santaan-amber drop-shadow-sm'
    );

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
                isScrolled
                    ? 'bg-white/85 backdrop-blur-md shadow-sm border-gray-100 py-2'
                    : 'bg-santaan-teal/45 backdrop-blur-md border-white/15 py-3'
            )}
        >
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-100 px-4 py-2 bg-santaan-teal text-white rounded-md">
                Skip to content
            </a>
            <div className="container mx-auto px-4 md:px-6">
                <nav className="flex items-center justify-between" aria-label="Global">
                    {/* Logo */}
                    <Link href="/" className="flex items-center group shrink-0" aria-label="Santaan IVF Home">
                        <span
                            className={cn(
                                'rounded-md px-2 py-1 transition-colors',
                                isScrolled ? 'bg-white' : 'bg-white/95 shadow-sm'
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <Image src="/favicon.ico" alt="" width={20} height={20} className="h-5 w-5" priority />
                                <span className="font-playfair font-bold text-santaan-teal text-xl tracking-tight leading-none">
                                    Santaan
                                </span>
                            </span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden xl:flex gap-4 2xl:gap-6 items-center">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={navLinkClass}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="hidden xl:flex items-center gap-2 2xl:gap-3">
                        <button type="button" onClick={() => setSearchOpen(true)} className={actionLinkClass}>
                            Search
                        </button>
                        <a
                            href={PRIMARY_CALL_HREF}
                            data-cta-kind="call"
                            data-center="Network"
                            data-cta-target={PRIMARY_CALL_HREF}
                            className={actionLinkClass}
                            onClick={() => trackHeaderEvent('header_call_primary')}
                        >
                            <Phone className="w-4 h-4" />
                            <span>Call</span>
                            <span className="hidden xl:inline">{PRIMARY_CALL_NUMBER}</span>
                        </a>
                        <a
                            href={PRIMARY_WHATSAPP_BOOKING_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-cta-kind="whatsapp"
                            data-center="Network"
                            data-cta-target={PRIMARY_WHATSAPP_BOOKING_URL}
                            className={cn(
                                buttonVariants({
                                    size: 'sm',
                                    className:
                                        'h-9 bg-emerald-600 px-4 text-white hover:bg-emerald-700 hover:text-white border-none shadow-sm',
                                })
                            )}
                            onClick={() => trackHeaderEvent('header_whatsapp_primary')}
                        >
                            <MessageCircle className="w-4 h-4" />
                            Book on WhatsApp
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex xl:hidden gap-4 items-center">
                        <button type="button" onClick={() => setSearchOpen(true)} className={actionLinkClass}>
                            Search
                        </button>
                        <button
                            type="button"
                            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 hover:bg-gray-100"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <span className="sr-only">Open main menu</span>
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </nav>
            </div>

            <AnimatePresence>
                {searchOpen ? (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-24"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSearchOpen(false)}
                    >
                        <motion.div
                            className="w-full max-w-xl rounded-2xl bg-white border border-gray-200 shadow-xl p-5"
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                            transition={{ duration: 0.18 }}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <h2 className="text-sm font-semibold text-gray-900">Search</h2>
                                <button
                                    type="button"
                                    onClick={() => setSearchOpen(false)}
                                    className="text-gray-500 hover:text-gray-900 transition-colors"
                                    aria-label="Close search"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form action="/fertility-insights" method="get" className="mt-4 flex gap-2">
                                <Input name="q" placeholder="Search fertility topics (PCOS, IVF, AMH…)" autoFocus />
                                <Button type="submit">Go</Button>
                            </form>
                        </motion.div>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
                    >
                        <div className="space-y-1 px-4 pb-3 pt-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-santaan-teal"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                <div className="space-y-4">
                                    <a
                                        href={PRIMARY_CALL_HREF}
                                        data-cta-kind="call"
                                        data-center="Network"
                                        data-cta-target={PRIMARY_CALL_HREF}
                                        aria-label={`Call ${PRIMARY_CALL_NUMBER}`}
                                        className={cn(
                                            buttonVariants({ variant: 'outline', fullWidth: true, className: 'w-full justify-center' })
                                        )}
                                    >
                                        Call {PRIMARY_CALL_NUMBER}
                                    </a>
                                    <a
                                        href={PRIMARY_WHATSAPP_BOOKING_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        data-cta-kind="whatsapp"
                                        data-center="Network"
                                        data-cta-target={PRIMARY_WHATSAPP_BOOKING_URL}
                                        aria-label="Chat with Santaan on WhatsApp"
                                        className={cn(
                                            buttonVariants({
                                                fullWidth: true,
                                                className: 'w-full justify-center bg-emerald-600 hover:bg-emerald-700',
                                            })
                                        )}
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Book on WhatsApp
                                    </a>
                                    <a
                                        href="/#book-consultation"
                                        data-cta-kind="book"
                                        data-center="Network"
                                        data-cta-target="/#book-consultation"
                                        className={cn(
                                            buttonVariants({
                                                variant: 'ghost',
                                                fullWidth: true,
                                                className: 'w-full justify-center',
                                            })
                                        )}
                                    >
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Open booking options
                                    </a>
                                    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-600">
                                        Local clinic phone numbers are listed on each centre page with the address, timings, and directions.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
