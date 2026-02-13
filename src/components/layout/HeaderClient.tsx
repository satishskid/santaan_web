"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Session } from 'next-auth';
import Image from 'next/image';
import { useJourney } from '@/context/JourneyContext';

const navigation = [
    { name: 'Understand Fertility', href: '#myth-busting' },
    { name: 'Your Path', href: '#assessment' },
    { name: 'Our Expertise', href: '#doctors' },
    { name: 'About Us', href: '#footer' },
];

const centers = [
    {
        name: 'Berhampur',
        phones: ['+91 7008990582', '+91 9777989739'],
    },
    {
        name: 'Bhubaneswar',
        phones: ['+91 9337326896', '+91 7328839934', '+91 7008990586'],
    },
    {
        name: 'Bangalore (R&D)',
        phones: ['+91 8105108416'],
    },
];

interface HeaderClientProps {
    session: Session | null;
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

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent',
                isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-gray-100 py-2' : 'bg-transparent py-4'
            )}
        >
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-100 px-4 py-2 bg-santaan-teal text-white rounded-md">
                Skip to content
            </a>
            <div className="container mx-auto px-4 md:px-6">
                <nav className="flex items-center justify-between" aria-label="Global">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <Image
                            src="/assets/santaan-logo.png"
                            alt="Santaan Logo"
                            width={120}
                            height={67}
                            className="h-8 w-auto object-contain"
                            priority
                        />
                        <span className="text-xl font-playfair font-bold text-santaan-teal tracking-tight hidden sm:inline">
                            Santaan
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex gap-8 items-center">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-sm font-medium text-gray-600 hover:text-santaan-teal transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="relative group">
                            <button
                                type="button"
                                className="text-gray-500 hover:text-santaan-teal transition-colors inline-flex items-center"
                            >
                                <Phone className="w-5 h-5" />
                                <span className="sr-only">Call a center</span>
                            </button>
                            <div className="absolute right-0 mt-3 w-64 rounded-xl border border-gray-100 bg-white shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all">
                                <div className="p-3 space-y-3">
                                    {centers.map((center) => (
                                        <div key={center.name}>
                                            <div className="text-xs font-semibold text-santaan-teal uppercase tracking-wider mb-1">
                                                {center.name}
                                            </div>
                                            <div className="space-y-1">
                                                {center.phones.map((phone) => (
                                                    <a
                                                        key={phone}
                                                        href={`tel:${phone}`}
                                                        className="block text-sm text-gray-700 hover:text-santaan-amber"
                                                        onClick={() => {
                                                            if (typeof window !== 'undefined' && (window as any).gtag) {
                                                                (window as any).gtag('event', 'click', {
                                                                    event_category: 'contact',
                                                                    event_label: `header_phone_${center.name}_${phone}`
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        {phone}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

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
                            <div className="flex gap-2">
                                <div className="relative group hidden lg:flex">
                                    <Button size="sm" onClick={() => {
                                        if (typeof window !== 'undefined' && (window as any).gtag) {
                                            (window as any).gtag('event', 'click', {
                                                event_category: 'engagement',
                                                event_label: 'header_cta_book_consultation'
                                            });
                                        }
                                        window.location.href = '#assessment';
                                    }}>
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Book Consultation
                                    </Button>
                                    <div className="absolute right-0 mt-3 w-64 rounded-xl border border-gray-100 bg-white shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all">
                                        <div className="p-3 space-y-3">
                                            {centers.map((center) => (
                                                <div key={center.name}>
                                                    <div className="text-xs font-semibold text-santaan-teal uppercase tracking-wider mb-1">
                                                        {center.name}
                                                    </div>
                                                    <div className="space-y-1">
                                                        {center.phones.map((phone) => (
                                                            <a
                                                                key={phone}
                                                                href={`tel:${phone}`}
                                                                className="block text-sm text-gray-700 hover:text-santaan-amber"
                                                            >
                                                                {phone}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden gap-4 items-center">
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
                        className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
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
                                        {centers.map((center) => (
                                            <div key={center.name} className="space-y-2">
                                                <div className="text-xs font-semibold text-santaan-teal uppercase tracking-wider">
                                                    {center.name}
                                                </div>
                                                {center.phones.map((phone) => (
                                                    <Link key={phone} href={`tel:${phone}`} className="block">
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
