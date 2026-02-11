"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Quote } from 'lucide-react';

const stories = [
    {
        image: "/assets/hero-priya-final.jpg",
        name: "Priya*, 30",
        type: "Career Woman - Egg Freezing",
        quote: "As a software engineer at Google, I wanted to focus on my career. Santaan gave me the freedom to preserve my future without compromise.",
        location: "Bhubaneswar"
    },
    {
        image: "/assets/hero-family.png",
        name: "Rahul & Anjali*, 33",
        type: "IT Couple - Male Factor",
        quote: "We thought it was my fault. Turns out, it was male factor. The team helped us understand this affects 50% of cases. Now expecting twins!",
        location: "Bangalore"
    },
    {
        image: "/assets/hero-meera-final.jpg",
        name: "Meera*, 37",
        type: "PCOS Success",
        quote: "I was told PCOS meant I'd never conceive. Santaan proved them wrong. My daughter is now 2 years old—PCOS is treatable!",
        location: "Cuttack"
    },
    {
        image: "/assets/hero-twins.png",
        name: "Sanjay & Divya*, 40",
        type: "Late Start - IVF Success",
        quote: "We focused on building our business first. At 40, we thought we'd missed our chance. Science said otherwise. Our twins arrived last month.",
        location: "Berhampur"
    },
    {
        image: "/assets/hero-kavita-final.png",
        name: "Kavita*, 35",
        type: "Single Mother by Choice",
        quote: "I didn't have a partner, but I had a dream. Santaan supported my journey to solo motherhood with donor IUI. My son is my world.",
        location: "Bhubaneswar"
    },
    {
        image: "/assets/hero-arjun-shreya-final.png",
        name: "Arjun & Shreya*, 45",
        type: "Second Chance - After Miscarriage",
        quote: "After three miscarriages, we had lost hope. The genetic testing and personalized protocols at Santaan gave us our rainbow baby.",
        location: "Puri"
    },
    {
        image: "/assets/hero-older-couple.png",
        name: "Dr. Ramesh & Lakshmi*, 48",
        type: "Advanced Maternal Age - Donor Eggs",
        quote: "At 48, we were told it was impossible. With donor eggs and Santaan's expertise, we're now proud parents. Age is just a number when science meets compassion.",
        location: "Bangalore"
    },
    {
        image: "/assets/hero-neha-vikram-final.jpg",
        name: "Neha & Vikram*, 52",
        type: "Hope After 50 - Comprehensive IVF",
        quote: "Everyone said we were too old. But Santaan believed in us. Through advanced IVF protocols and donor support, our dream came true at 52.",
        location: "Bhubaneswar"
    }
];

export function SuccessStories() {
    return (
        <section id="success-stories" className="py-24 bg-white">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-16">
                    <span className="text-santaan-teal font-medium tracking-wide uppercase text-sm">Real Stories, Real Joy (Ages 30-55)</span>
                    <h2 className="text-3xl md:text-4xl font-playfair font-bold text-gray-900 mt-2 mb-4">
                        From "Impossible" to <span className="text-santaan-amber">"Parent"</span>
                    </h2>
                    <p className="text-black max-w-2xl mx-auto">
                        Every family we help create adds a new chapter to our story. Here are just a few of the 7,000+ journeys we've been honored to be part of.
                    </p>
                    <p className="text-gray-500 text-sm mt-2">*Names changed for privacy</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
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
