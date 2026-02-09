"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { User } from 'lucide-react';

const management = [
    {
        name: "Dr. Satish",
        role: "Founder & Head R&D",
        specialty: "Clinical Scientist & Fertility Tech",
        image: "https://static.wixstatic.com/media/fd2a61_76a58758207f474c986ee0611950f9ac~mv2.jpg/v1/crop/x_90,y_0,w_224,h_418/fill/w_227,h_427,al_c,lg_1,q_80,enc_avif,quality_auto/SatishRath.jpg"
    },
    {
        name: "Raghab",
        role: "CEO",
        specialty: "Head Femtech Accelerator & Incubator",
        image: "https://static.wixstatic.com/media/fd2a61_67db601f16c0438bbe0e4706d718c15f~mv2.jpg/v1/crop/x_438,y_0,w_2195,h_4096/fill/w_227,h_427,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/raghab.jpg"
    }
];

const doctors = [
    {
        name: "Dr. Deepika KN Padhi",
        role: "Center Head Berhampur",
        specialty: "Clinical Director",
        image: "https://static.wixstatic.com/media/fd2a61_589f6721d1af451d907bc74cd23fef5e~mv2.jpeg/v1/crop/x_428,y_135,w_1041,h_1942/fill/w_227,h_427,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/B22ADF58-293A-42C2-9AA8-534D93464369.jpeg"
    },
    {
        name: "Dr. Kaninika Panda",
        role: "Center Head Bhubaneswar",
        specialty: "Head Santaan Academy & Quality",
        image: "https://static.wixstatic.com/media/fd2a61_55ca1c808b8a44a58099994d3cf32e00~mv2.jpg/v1/crop/x_412,y_0,w_456,h_850/fill/w_227,h_427,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/IMG-20210726-WA0028.jpg"
    },
    {
        name: "Dr. Sakshi",
        role: "Center Head Bangalore",
        specialty: "Reproductive Medicine",
        image: "https://static.wixstatic.com/media/8b6a24_e67b9b008cac4e038128fc4f0884b7ec~mv2.jpg/v1/crop/x_45,y_0,w_504,h_940/fill/w_227,h_427,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Dr%20Sakshi%20Lalwani_edited.jpg"
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

                {/* Clinical Doctors */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {doctors.map((doc, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-all border border-transparent hover:border-santaan-teal/20"
                        >
                            {doc.image ? (
                                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-santaan-sage/20 ring-2 ring-white shadow-sm">
                                    <img src={doc.image} alt={doc.name} className="w-full h-full object-cover object-[50%_20%]" />
                                </div>
                            ) : (
                                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-santaan-sage/20 flex items-center justify-center text-santaan-teal">
                                    <User className="w-10 h-10" />
                                </div>
                            )}
                            <h3 className="font-playfair font-bold text-lg text-gray-900 mb-1">{doc.name}</h3>
                            <p className="text-santaan-teal text-sm font-medium mb-2">{doc.role}</p>
                            <p className="text-xs text-gray-500">{doc.specialty}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Divider */}
                <div className="max-w-3xl mx-auto mb-12">
                    <div className="h-px bg-linear-to-r from-transparent via-santaan-teal/30 to-transparent"></div>
                </div>

                {/* Management Layer */}
                <div className="max-w-3xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-6">
                        {management.map((member, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-linear-to-br from-santaan-teal/5 to-santaan-amber/5 p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-all border-2 border-santaan-teal/20"
                            >
                                {member.image ? (
                                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-white shadow-md ring-2 ring-white">
                                        <img src={member.image} alt={member.name} className="w-full h-full object-cover object-[50%_20%]" />
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white flex items-center justify-center text-santaan-teal shadow-md">
                                        <User className="w-10 h-10" />
                                    </div>
                                )}
                                <h3 className="font-playfair font-bold text-lg text-gray-900 mb-1">{member.name}</h3>
                                <p className="text-santaan-teal text-sm font-medium mb-2">{member.role}</p>
                                <p className="text-xs text-gray-500">{member.specialty}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
