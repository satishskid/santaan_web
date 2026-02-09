"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Quote } from 'lucide-react';

const stories = [
    {
        image: "/assets/hero-egg-freezing.png",
        name: "Priya, 32",
        type: "Career Woman - Egg Freezing",
        quote: "As a software engineer at Google, I wanted to focus on my career. Santaan gave me the freedom to preserve my future without compromise.",
        location: "Bhubaneswar"
    },
    {
        image: "/assets/hero-couple.png",
        name: "Rahul & Anjali, 35",
        type: "IT Couple - Male Factor",
        quote: "We thought it was my fault. Turns out, it was male factor. The team helped us understand this affects 50% of cases. Now expecting twins!",
        location: "Bangalore"
    },
    {
        image: "/assets/hero-family.png",
        name: "Meera, 38",
        type: "PCOS Success",
        quote: "I was told PCOS meant I'd never conceive. Santaan proved them wrong. My daughter is now 2 years old—PCOS is treatable!",
        location: "Cuttack"
    },
    {
        image: "/assets/hero-twins.png",
        name: "Sanjay & Divya, 36",
        type: "Late Start - IVF",
        quote: "We focused on building our business first. At 36, we thought we'd missed our chance. Science said otherwise. Our twins arrived last month.",
        location: "Berhampur"
    },
    {
        image: "/assets/hero-baby.png",
        name: "Kavita, 34",
        type: "Single Mother by Choice",
        quote: "I didn't have a partner, but I had a dream. Santaan supported my journey to solo motherhood with donor IUI. My son is my world.",
        location: "Bhubaneswar"
    },
    {
        image: "/assets/hero-couple.png",
        name: "Arjun & Shreya, 40",
        type: "Second Chance - After Miscarriage",
        quote: "After three miscarriages, we had lost hope. The genetic testing and personalized protocols at Santaan gave us our rainbow baby.",
        location: "Puri"
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

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
                                    className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
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
