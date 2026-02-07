"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Quote } from 'lucide-react';

const stories = [
    {
        image: "/assets/hero-egg-freezing.png",
        name: "Priya, 29",
        type: "Egg Freezing",
        quote: "Santaan gave me the power to prioritize my career without compromising my dream of being a mother someday. The process was empowering.",
        location: "Bhubaneswar"
    },
    {
        image: "/assets/hero-couple.png",
        name: "Rahul & Anjali",
        type: "Male Infertility",
        quote: "We thought it was impossible. But the Doctor at Santaan and the team showed us that male factor issues have solutions. We are now expecting twins!",
        location: "Berhampur"
    },
    {
        image: "/assets/hero-older-couple.png",
        name: "Sunita & Rajesh",
        type: "IVF at 42",
        quote: "Other clinics said we were 'too old'. Santaan said 'let's look at the science'. holding our baby today proves science—and hope—won.",
        location: "Bangalore"
    }
];

export function SuccessStories() {
    return (
        <section className="py-24 bg-white">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-16">
                    <span className="text-santaan-teal font-medium tracking-wide uppercase text-sm">Real Stories, Real Joy</span>
                    <h2 className="text-3xl md:text-4xl font-playfair font-bold text-gray-900 mt-2 mb-4">
                        From "Impossible" to <span className="text-santaan-amber">"Parent"</span>
                    </h2>
                    <p className="text-black max-w-2xl mx-auto">
                        Every family we help create adds a new chapter to our story. Here are just a few of the 7,000+ journeys we've been honored to be part of.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {stories.map((story, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="bg-[#FDF6F0] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                        >
                            <div className="relative h-64 overflow-hidden">
                                <Image
                                    src={story.image}
                                    alt={story.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-4 left-4 text-white">
                                    <p className="font-bold text-lg">{story.name}</p>
                                    <p className="text-sm opacity-90">{story.type} | {story.location}</p>
                                </div>
                            </div>
                            <div className="p-6 relative">
                                <Quote className="absolute top-4 right-4 w-8 h-8 text-santaan-teal/10" />
                                <p className="text-gray-700 italic leading-relaxed mb-4">"{story.quote}"</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
