"use client";

import { motion } from 'framer-motion';
import { User } from 'lucide-react';

const doctors = [
    {
        name: "Dr. Satish Prasad Rath",
        role: "Founder & Head of Innovation",
        specialty: "Clinical Scientist & Fertility Tech",
        image: null // Placeholder
    },
    {
        name: "Dr. Deepika KN Padhi",
        role: "Clinical Director",
        specialty: "Chief Fertility Consultant",
        image: null
    },
    {
        name: "Dr. Kaninika Panda",
        role: "Head, Santaan Academy",
        specialty: "Gynaecologist & Embryologist",
        image: null
    },
    {
        name: "Dr. Sakshi Lalwani",
        role: "Fertility Specialist",
        specialty: "Reproductive Medicine",
        image: null
    }
];

export function Doctors() {
    return (
        <section className="py-24 bg-[#E6F0E6]/30">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-16">
                    <span className="text-santaan-teal font-medium tracking-wide uppercase text-sm">Our Expertise</span>
                    <h2 className="text-3xl md:text-4xl font-playfair font-bold text-gray-900 mt-2 mb-4">
                        Meet the Minds Behind the <span className="text-santaan-amber">Miracles</span>
                    </h2>
                    <p className="text-black max-w-2xl mx-auto">
                        A team of award-winning scientists, clinicians, and embryologists dedicated to turning your hope into reality.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {doctors.map((doc, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-all border border-transparent hover:border-santaan-teal/20"
                        >
                            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-santaan-sage/20 flex items-center justify-center text-santaan-teal">
                                <User className="w-10 h-10" />
                            </div>
                            <h3 className="font-playfair font-bold text-lg text-gray-900 mb-1">{doc.name}</h3>
                            <p className="text-santaan-teal text-sm font-medium mb-2">{doc.role}</p>
                            <p className="text-xs text-gray-500">{doc.specialty}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
