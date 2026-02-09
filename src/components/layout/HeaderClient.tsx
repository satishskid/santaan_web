"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Phone, Calendar, User } from 'lucide-react';
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
                        {/* Placeholder Logo Icon */}
                        <div className="w-8 h-8 rounded-full bg-santaan-sage/20 flex items-center justify-center group-hover:bg-santaan-sage/30 transition-colors">
                            <span className="text-santaan-teal text-lg font-playfair font-bold">S</span>
                        </div>
                        <span className="text-xl font-playfair font-bold text-santaan-teal tracking-tight">
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
                        <Link href="tel:+919337326896" className="text-gray-500 hover:text-santaan-teal transition-colors">
                            <Phone className="w-5 h-5" />
                            <span className="sr-only">Call us</span>
                        </Link>

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
                                <Link href="tel:+919337326896" className="hidden lg:flex">
                                    <Button size="sm">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Book Consultation
                                    </Button>
                                </Link>
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
                                    <>
                                        <Link href="tel:+919337326896" className="block">
                                            <Button variant="outline" className="w-full justify-center">Call Now</Button>
                                        </Link>
                                        <Link href="tel:+919337326896" className="block">
                                            <Button className="w-full justify-center">Book Consultation</Button>
                                        </Link>
                                    </>
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
