"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Phone, Calendar, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Session } from 'next-auth';
import Image from 'next/image';
import { useJourney } from '@/context/JourneyContext';
import { CENTER_CONTACTS, PRIMARY_CALL_NUMBER, PRIMARY_WHATSAPP_URL } from '@/data/centers';

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

const navigation = [
    { name: 'IVF Centres', href: '/contact-centres' },
    { name: 'Female Fertility', href: '/female-fertility' },
    { name: 'Male Fertility', href: '/male-infertility-clinic' },
    { name: 'Fertility Doctors', href: '/our-doctors' },
    { name: 'Fertility Insights', href: '/fertility-insights' },
    { name: 'Clinical Insights', href: '/clinical-insights' },
];

interface HeaderClientProps {
    session: Session | null;
}

function trackHeaderEvent(label: string) {
    if (typeof window === 'undefined') return;
    const analyticsWindow = window as GtagWindow;
    if (!analyticsWindow.gtag) return;

    analyticsWindow.gtag('event', 'click', {
        event_category: 'engagement',
        event_label: label,
    });
}

export function HeaderClient({ session }: HeaderClientProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { signal } = useJourney();

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
                    <Link href="/" className="flex items-center group" aria-label="Santaan IVF Home">
                        <span
                            className={cn(
                                'rounded-md px-2 py-1 transition-colors',
                                isScrolled ? 'bg-white' : 'bg-white/95 shadow-sm'
                            )}
                        >
                            <Image
                                src="/assets/santaan-logo.png"
                                alt="Santaan Logo"
                                width={120}
                                height={67}
                                className="h-8 w-auto object-contain"
                                priority
                            />
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex gap-4 xl:gap-6 items-center">
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
                    <div className="hidden lg:flex items-center gap-2 xl:gap-3">
                        <a
                            href={`tel:${PRIMARY_CALL_NUMBER}`}
                            data-cta-kind="call"
                            data-center="Bhubaneswar"
                            data-cta-target={`tel:${PRIMARY_CALL_NUMBER}`}
                            className={actionLinkClass}
                            onClick={() => trackHeaderEvent('header_call_primary')}
                        >
                            <Phone className="w-4 h-4" />
                            <span>Call</span>
                            <span className="hidden xl:inline">{PRIMARY_CALL_NUMBER}</span>
                        </a>
                        <a
                            href={PRIMARY_WHATSAPP_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-cta-kind="whatsapp"
                            data-center="Bhubaneswar"
                            data-cta-target={PRIMARY_WHATSAPP_URL}
                            className={cn(actionLinkClass, isScrolled ? 'text-emerald-700 hover:text-emerald-800' : 'text-emerald-300 hover:text-emerald-200')}
                            onClick={() => trackHeaderEvent('header_whatsapp_primary')}
                        >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp
                        </a>

                        {session?.user ? (
                            <Link href="/profile">
                                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                    <div className="relative w-9 h-9">
                                        {session.user.image ? (
                                            <Image
                                                src={session.user.image}
                                                alt={session.user.name || "User"}
                                                fill
                                                className="rounded-full object-cover border-2 border-white ring-1 ring-gray-200"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-santaan-sage/20 flex items-center justify-center text-sm font-bold text-santaan-teal">
                                                {session.user.name?.[0] || "U"}
                                            </div>
                                        )}
                                        {/* Status Dot based on Signal */}
                                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${signal === 'green' ? 'bg-emerald-500' :
                                            signal === 'yellow' ? 'bg-amber-500' :
                                                signal === 'red' ? 'bg-rose-500' :
                                                    'bg-gray-300'
                                            }`}></div>
                                    </div>
                                    <div className="text-xs text-left">
                                        <div className="font-bold text-gray-700">Namaste</div>
                                        <div className="text-santaan-teal font-medium">{session.user.name?.split(' ')[0]}</div>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <Button
                                size="sm"
                                className="bg-santaan-amber hover:bg-[#E08E45] text-white"
                                data-cta-kind="book"
                                data-center="Network"
                                data-cta-target="/at-home-fertility-testing"
                                onClick={() => {
                                    trackHeaderEvent('header_cta_book_assessment');
                                    window.location.href = '/at-home-fertility-testing';
                                }}
                            >
                                <Calendar className="w-4 h-4 mr-2" />
                                Book Assessment
                            </Button>
                        )}

                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex lg:hidden gap-4 items-center">
                        {session?.user && (
                            <Link href="/profile" className="relative w-8 h-8">
                                {session.user.image ? (
                                    <Image
                                        src={session.user.image}
                                        alt={session.user.name || "User"}
                                        fill
                                        className="rounded-full object-cover border border-gray-200"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-santaan-sage/20 flex items-center justify-center text-xs font-bold text-santaan-teal">
                                        {session.user.name?.[0] || "U"}
                                    </div>
                                )}
                            </Link>
                        )}
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
                                {!session?.user ? (
                                    <div className="space-y-4">
                                        <a
                                            href={`tel:${PRIMARY_CALL_NUMBER}`}
                                            className="block"
                                            data-cta-kind="call"
                                            data-center="Bhubaneswar"
                                            data-cta-target={`tel:${PRIMARY_CALL_NUMBER}`}
                                        >
                                            <Button variant="outline" className="w-full justify-center">
                                                Call {PRIMARY_CALL_NUMBER}
                                            </Button>
                                        </a>
                                        <a
                                            href={PRIMARY_WHATSAPP_URL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block"
                                            data-cta-kind="whatsapp"
                                            data-center="Bhubaneswar"
                                            data-cta-target={PRIMARY_WHATSAPP_URL}
                                        >
                                            <Button className="w-full justify-center bg-emerald-600 hover:bg-emerald-700">
                                                WhatsApp a Fertility Advisor
                                            </Button>
                                        </a>
                                        {CENTER_CONTACTS.map((center) => (
                                            <div key={center.name} className="space-y-2">
                                                <div className="text-xs font-semibold text-santaan-teal uppercase tracking-wider">
                                                    {center.name}
                                                </div>
                                                {center.phones.map((phone) => (
                                                    <Link
                                                        key={phone}
                                                        href={`tel:${phone}`}
                                                        className="block"
                                                        data-cta-kind="call"
                                                        data-center={center.city}
                                                        data-cta-target={`tel:${phone}`}
                                                    >
                                                        <Button variant="outline" className="w-full justify-center">
                                                            Call {phone}
                                                        </Button>
                                                    </Link>
                                                ))}
                                            </div>
                                        ))}
                                        <div className="text-xs text-gray-500">Choose your nearest center to book.</div>
                                    </div>
                                ) : (
                                    <Link href="/profile" className="block">
                                        <Button className="w-full justify-center">View Profile</Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
