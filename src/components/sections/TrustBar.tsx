"use client";

import { motion } from 'framer-motion';

const stats = [
    { label: "Families Created", value: "7,000+" },
    { label: "Success Rate", value: "78%" },
    { label: "Years of Excellence", value: "15+" },
    { label: "State-of-Art Centers", value: "4" },
];

export function TrustBar() {
    return (
        <section className="py-8 bg-white border-b border-gray-100">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div className="text-3xl md:text-4xl font-playfair font-bold text-santaan-teal mb-1">
                                {stat.value}
                            </div>
                            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
