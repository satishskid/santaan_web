"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import Image from 'next/image';

export function Hero() {
    const slides = [
        {
            id: 1,
            image: "/assets/hero-egg-freezing.png",
            alt: "Confident young woman in her 30s planning her future",
            badge: "Preserve Your Future",
            title: "Your Timeline, <span class=\"text-santaan-amber\">Your Choice</span>",
            description: "Empowering you to control your biological clock with advanced egg freezing. Freedom to plan your family when you are ready."
        },
        {
            id: 2,
            image: "/assets/hero-couple.png",
            alt: "Professional couple in their 30s planning their future",
            badge: "Shared Fertility Journey",
            title: "It Takes Two to <span class=\"text-santaan-amber\">Create Life</span>",
            description: "Male health matters just as much. Comprehensive care for both partners to ensure the best start for your growing family."
        },
        {
            id: 3,
            image: "/assets/hero-family.png",
            alt: "Happy young family with their baby",
            badge: "Dreams Come True",
            title: "Building <span class=\"text-santaan-amber\">Happy Families</span>",
            description: "Join thousands of couples in their 30s and 40s who achieved their dream of parenthood through advanced fertility care."
        },
        {
            id: 4,
            image: "/assets/hero-baby.png",
            alt: "Precious newborn baby",
            badge: "The Miracle of Life",
            title: "Where Science Meets <span class=\"text-santaan-amber\">Hope</span>",
            description: "Understanding the miracle of life, one cell at a time. We demystify fertility through deeper scientific insights."
        }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [slides.length]);

    const currentSlide = slides[currentIndex];

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-santaan-cream via-[#E6F0E6] to-[#FDF6F0]">
            {/* Background Visual Slider */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-santaan-teal/90 via-santaan-teal/60 to-transparent mix-blend-multiply z-10" />
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide.image}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={currentSlide.image}
                            alt={currentSlide.alt}
                            fill
                            sizes="100vw"
                            className="object-cover"
                            priority
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="container relative z-10 px-4 md:px-6 text-center max-w-4xl mx-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-sm font-medium tracking-wide border border-white/20 shadow-sm">
                            {currentSlide.badge}
                        </span>

                        <h1
                            className="text-5xl md:text-7xl font-playfair font-bold text-white mb-6 leading-tight drop-shadow-md"
                            dangerouslySetInnerHTML={{ __html: currentSlide.title }}
                        />

                        <p className="text-lg md:text-xl text-white/90 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-medium">
                            {currentSlide.description}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 md:mb-16">
                            <a href="#santaan-signal">
                                <Button 
                                    size="lg" 
                                    className="group w-full sm:w-auto bg-santaan-amber hover:bg-[#E08E45] border-none shadow-lg hover:shadow-xl transition-all"
                                >
                                    Begin Your Journey
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </a>

                            <a href="#insights">
                                <Button 
                                    size="lg" 
                                    variant="outline" 
                                    className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10 backdrop-blur-sm"
                                >
                                    <BookOpen className="w-5 h-5 mr-2" />
                                    Read Today&apos;s Insight
                                </Button>
                            </a>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Floating Trust Badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-10 left-0 right-0 hidden md:flex justify-center gap-12 text-sm text-white/80 font-medium"
                >
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-santaan-sage" />
                        7,000+ Happy Families
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-santaan-sage" />
                        15+ National Awards
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-santaan-sage" />
                        Most Awarded Fertility Centre (Odisha & East)
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
