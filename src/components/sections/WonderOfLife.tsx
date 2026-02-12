"use client";

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Sparkles, Microscope, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

const journeySteps = [
    {
        title: "The Origin of Bira (The Sperm)",
        subtitle: "The Beginning",
        story: "Imagine a vast kingdom. Bira, our brave hero, doesn't start his journey alone. He begins with millions of others, like an army of tiny voyagers. They are full of energy, ready to swim. But this isn't just a swim; it's a marathon. To reach the destination, Bira needs to be shaped perfectly—strong tail for swimming, good head for direction. He carries the 'Prana' (life force) that will spark the future.",
        science: [
            { label: "Count (Quantity)", value: "Checking for enough 'voyagers'. Lower count just means we find a shortcut." },
            { label: "Motility (Energy)", value: "Progressive Motility—swimming straight and fast, not in circles." },
            { label: "Morphology (Shape)", value: "Oval head and long tail are the 'gear' needed to penetrate the egg." }
        ],
        denseScience: {
            headline: "The Great Migration",
            mainStat: "300 M",
            mainStatLabel: "Starting Voyagers",
            description: "In a single event, over <span class='text-santaan-amber font-bold'>300 million</span> biological competitors begin the race. Only <span class='text-white font-bold'>1 in a million</span> reach the destination. If Bira were human-sized, he would be swimming at <span class='text-santaan-teal font-bold'>100 mph</span> relative to his size.",
            details: [
                { value: "3 mm/min", label: "~ cheetah speed" },
                { value: "0.05 mm", label: "grain of sand" },
                { value: "48-72 hrs", label: "Survival Time" }
            ]
        },
        journeyMetaphor: {
            label: "The Voyage Scale",
            text: "A 18cm swim for a microscopic cell is equivalent to a human walking from Earth to the Moon.",
            icon: "🚀"
        },
        image: "/assets/metaphor_seed_bira_1770387137230.png",
        color: "bg-blue-50/10",
        borderColor: "border-blue-200/20"
    },
    {
        title: "The Awakening of Mani (The Egg)",
        subtitle: "The Awakening",
        story: "Now, let's look at Mani. She is the jewel of the family. Unlike Bira whom is made fresh, Mani has been waiting in the 'Royal Palace' (The Ovary) since you were a baby yourself! She is precious and rare. Every month, the body wakes up a few sleeping beauties, but only one—the strongest and most glowing—is chosen to step out into the world.",
        science: [
            { label: "Ovarian Reserve", value: "Using AMH to see how many 'sleeping beauties' remain in the vault." },
            { label: "Follicle Growth", value: "Tracking the growth to predict the perfect 'Mahurat' (moment) of release." },
            { label: "Quality", value: "Optimizing protocols to give Mani the energy (mitochondria) she needs." }
        ],
        denseScience: {
            headline: "The Chosen One",
            mainStat: "1 M",
            mainStatLabel: "Eggs at Birth",
            description: "A female is born with her entire lifetime supply of eggs. By puberty, only <span class='text-white font-bold'>300,000</span> remain. In a lifetime, only about <span class='text-santaan-amber font-bold'>400</span> (0.1%) will ever reach maturity. Mani is the survivor of a decades-long biological selection process.",
            details: [
                { value: "120 µm", label: "size of (.) dot" },
                { value: "24 hrs", label: "Peak Fertility" },
                { value: "XX", label: "Chromosomes" }
            ]
        },
        journeyMetaphor: {
            label: "The Royal Wait",
            text: "She waits in the vault for decades. Like a dormant star waiting for the perfect moment to go supernova.",
            icon: "✨"
        },
        image: "/assets/metaphor_moon_mani_1770387172927.png",
        color: "bg-amber-50/10",
        borderColor: "border-amber-200/20"
    },
    {
        title: "The Great Meeting (Fertilization)",
        subtitle: "The Union",
        story: "This is the moment of magic. Bira has traveled the long distance. Mani is waiting in the Jala-Patha (Tube). When they meet, it isn't a collision; it's a greeting. Bira gently knocks, and Mani decides to let him in. Once he enters, she creates a shield around herself. They merge, becoming one new life—a 'Bhruna' (Embryo).",
        science: [
            { label: "The Zona Pellucida", value: "The shell around the egg. Bira needs enzymes to dissolve a tiny hole to enter." },
            { label: "Fusion", value: "23 chromosomes from father + 23 from mother = 46 chromosomes (Human Blueprint)." },
            { label: "ICSI", value: "Our 'helping hand'—gently placing Bira inside Mani if the knocking is too faint." }
        ],
        denseScience: {
            headline: "The Spark of Life",
            mainStat: "23+23",
            mainStatLabel: "Perfect Harmony",
            description: "At the moment of fertilization, a <span class='text-santaan-amber font-bold'>Zinc Spark</span> is released. Two halves of a blueprint merge to create a unique human code. The egg surface instantly hardens to prevent any other sperm from entering—<span class='text-white font-bold'>Biologically Monogamous</span> at the cellular level.",
            details: [
                { value: "0.2 sec", label: "Reaction Time" },
                { value: "46", label: "Total Chromosomes" },
                { value: "Unique", label: "DNA Profile" }
            ]
        },
        journeyMetaphor: {
            label: "The Orbital Docking",
            text: "Like a space capsule docking with the station. A precise, 0.2 second lock-and-key connection.",
            icon: "🔗"
        },
        image: "/assets/metaphor_union_spark_1770387190705.png",
        color: "bg-purple-50/10",
        borderColor: "border-purple-200/20"
    },
    {
        title: "The Protected Nursery (The IVF Lab)",
        subtitle: "The Bloom",
        story: "Sometimes, the Jala-Patha is blocked. But today, we have the 'Surakhita Chara-shala' (Protected Nursery). Here, we provide Mani and Bira a safe, warm home outside the body. Our embryologists are the 'Master Gardeners' who watch over them night and day, feeding them nutrients until they grow into a strong sapling (Blastocyst).",
        science: [
            { label: "Culture Media", value: "Scientifically balanced liquids mimicking the mother's natural fluids." },
            { label: "Incubators", value: "maintaining 37°C and regulating gases like O2 and CO2 to match the womb." },
            { label: "Blastocyst Stage", value: "Growing to Day 5 allows us to choose the strongest 'sapling' for implantation." }
        ],
        denseScience: {
            headline: "The First 5 Days",
            mainStat: "100+",
            mainStatLabel: "Cells by Day 5",
            description: "From a single cell to a complex <span class='text-santaan-emerald font-bold'>Blastocyst</span> in just 120 hours. The outer cells will form the placenta (the support), while the inner cluster becomes the baby. Our incubators mimic the womb with <span class='text-white font-bold'>0.1% precision</span>.",
            details: [
                { value: "37.0°C", label: "Like the Womb" },
                { value: "pH 7.3", label: "Perfect Balance" },
                { value: "Day 5", label: "Transfer Ready" }
            ]
        },
        journeyMetaphor: {
            label: "The Bio-Dome",
            text: "A self-contained life support system. Like a Mars habitat protecting fragile life from the deep vacuum of space.",
            icon: "🛡️"
        },
        image: "/assets/metaphor_nursery_sapling_1770387240255.png",
        color: "bg-emerald-50/10",
        borderColor: "border-emerald-200/20"
    },
    {
        title: "The Hidden Influencers (The Environment)",
        subtitle: "The Ecosystem",
        story: "Imagine a garden. You have the perfect seed (Bira) and the perfect soil (Mani). But will it grow? That depends on the 'Prakriti' (Nature/Environment). The weather (Stress), the nutrients in the soil (Hormones), and the invisible helpers (Microbiome) all play a role. We don't just treat the seed; we nurture the entire garden.",
        science: [
            { label: "Hormones", value: "Progesterone & Estrogen are the 'weather'—they must be calm and balanced." },
            { label: "Endometrium", value: "The 'Soil'. Needs to be thick (Trilaminar) and receptive to welcome the sapling." },
            { label: "Microbiome", value: "Good bacteria (Lactobacillus) are the 'guardians' of the uterus." }
        ],
        denseScience: {
            headline: "The Fertile Ground",
            mainStat: "7-14 mm",
            mainStatLabel: "Ideal Soil Depth",
            description: "For the sapling to take root, the lining must be receptive. <span class='text-santaan-amber font-bold'>Stress (Cortisol)</span> acts like a drought, shrinking blood vessels. A balanced <span class='text-santaan-teal font-bold'>Microbiome</span> (>90% Lactobacillus) acts as natural fertilizer, preventing calm infection.",
            details: [
                { value: ">90%", label: "Good Bacteria" },
                { value: "Low", label: "Cortisol (Stress)" },
                { value: "Rich", label: "Blood Flow" }
            ]
        },
        journeyMetaphor: {
            label: "Terraforming",
            text: "Preparing the planet for life. Just as a farmer checks the pH and moisture of the soil before planting.",
            icon: "🌍"
        },
        image: "/assets/metaphor_ecosystem_influencers.png",
        color: "bg-orange-50/10",
        borderColor: "border-orange-200/20"
    },
    {
        title: "The Homecoming (Embryo Transfer)",
        subtitle: "The Return",
        story: "The sapling (Blastocyst) is ready. The soil (Endometrium) is ready. Now comes the most delicate moment—'Garbha-Adhana' (placing the seed in the womb). It is not surgery; it is a prayer. With a soft catheter, we gently guide Bira and Mani back home. No pain, just hope. The long journey outside is over. Now, the journey inside begins.",
        science: [
            { label: "Ultrasound Guidance", value: "Precision placement. We see exactly where the 'seed' is being planted." },
            { label: "Soft Catheters", value: "Flexible, atraumatic tubes that navigate the cervix without causing 'stress'." },
            { label: "Luteal Support", value: "Progesterone 'rain' to keep the soil moist and rich for the sapling to latch on." }
        ],
        denseScience: {
            headline: "Zero Trauma",
            mainStat: "~15 min",
            mainStatLabel: "Procedure Time",
            description: "The success of IVF largely depends on an <span class='text-santaan-emerald font-bold'>Atraumatic Transfer</span>. Using abdominal ultrasound, we deposit the embryo 1-2cm from the fundus. The procedure is <span class='text-white font-bold'>Painless</span> and requires no anesthesia. The embryo does not 'fall out'—it is held by surface tension in the endometrial fluid.",
            details: [
                { value: "Day 5", label: "Stage" },
                { value: "Guided", label: "Ultrasound" },
                { value: "0%", label: "Pain" }
            ]
        },
        journeyMetaphor: {
            label: "The Landing",
            text: "Like a lunar lander touching down on the surface. A gentle, controlled descent to the perfect landing site.",
            icon: "🛬"
        },
        image: "/assets/metaphor_moon_mani_1770387172927.png",
        color: "bg-rose-50/10",
        borderColor: "border-rose-200/20"
    },
];

export function WonderOfLife() {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-85%"]);

    return (
        <section ref={targetRef} className="relative h-[300vh] bg-santaan-teal text-white">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                <motion.div style={{ x }} className="flex gap-8 px-8 md:px-20">

                    {/* Intro Card */}
                    <div className="min-w-[85vw] md:min-w-[500px] h-[80vh] flex flex-col justify-center px-8 relative overflow-hidden rounded-3xl shrink-0">
                        <div className="absolute inset-0 opacity-20">
                            <Image
                                src="/assets/wonder-of-life-texture.png"
                                alt="Abstract texture of life"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="relative z-10">
                            <span className="text-santaan-sage uppercase tracking-widest text-sm mb-4 block">The Counselors Playbook</span>
                            <h2 className="text-5xl md:text-6xl font-playfair font-bold mb-6">
                                The Golden <br /> Harvest
                            </h2>
                            
                            {/* Sanskrit Verse */}
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-4 mb-6 max-w-lg">
                                <p className="font-playfair text-white text-base md:text-lg mb-2 italic tracking-wide leading-relaxed">
                                    ऋतुक्षेत्राम्बुबीजानां सामग्र्यादङ्कुरो यथा,<br/>
                                    तद्वत् सान्निध्यात् संतानः।
                                </p>
                                <p className="text-white/60 text-xs mb-2 font-light tracking-wide">
                                    Ṛtukṣetrāmbubījānāṃ sāmagryādaṅkuro yathā,<br/>
                                    tadvat sānnidhyāt santānaḥ.
                                </p>
                                <p className="text-white/80 text-sm font-medium leading-snug">
                                    &quot;Just as a sprout emerges when the season, soil, water, and seed are in perfect harmony, so does the child appear when all conditions are optimally met.&quot;
                                </p>
                                <p className="text-white/50 text-xs mt-2 italic">— Inspired by Sushruta Samhita</p>
                            </div>

                            <p className="text-xl text-gray-300 max-w-md italic">
                                &quot;Suna Chasa&quot;
                            </p>
                            <p className="text-lg text-gray-300 mt-4 max-w-md">
                                A journey through the dual layers of storytelling and science. Scroll to explore.
                            </p>
                        </div>
                    </div>

                    {journeySteps.map((step, index) => (
                        <JourneyCard key={index} step={step} />
                    ))}

                    {/* Closing Card */}
                    <div className="min-w-[85vw] md:min-w-[500px] h-[80vh] flex flex-col justify-center items-center text-center px-8 shrink-0 bg-santaan-amber text-white rounded-3xl">
                        <h3 className="text-4xl font-playfair font-bold mb-6">Your Harvest Awaits</h3>
                        <p className="text-xl mb-8 opacity-90">Every journey is unique. Let us guide yours.</p>
                        <a href="#santaan-signal">
                            <button className="bg-white text-santaan-amber px-8 py-3 rounded-full font-bold hover:bg-opacity-90 transition-colors">
                                Start Assessment
                            </button>
                        </a>
                    </div>

                </motion.div>
            </div>
        </section>
    );
}

function JourneyCard({ step }: { step: typeof journeySteps[0] }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className={`relative h-[80vh] w-[90vw] md:w-[550px] rounded-3xl overflow-hidden backdrop-blur-md border ${step.borderColor} transition-all shrink-0 bg-white/5 group`}
        >
            {/* Background Texture/Gradient */}
            <div className={`absolute inset-0 opacity-10 ${step.color} transition-opacity duration-500`} />

            {/* Main Content - Story Layer (Always Visible) */}
            <div className="relative z-10 h-full flex flex-col p-8">
                {/* Header */}
                <div className="mb-6">
                    <span className="text-santaan-amber text-xs uppercase tracking-widest font-semibold">{step.subtitle}</span>
                    <h3 className="text-4xl md:text-5xl font-playfair font-bold mt-2 leading-tight text-white">{step.title}</h3>
                </div>

                {/* Story Text */}
                <div className="relative">
                    <div className="flex items-center gap-2 mb-4 text-santaan-sage opacity-80">
                        <Sparkles className="w-5 h-5" />
                        <span className="font-bold text-sm uppercase tracking-wider">The Story</span>
                    </div>
                    <p className="text-xl md:text-2xl text-gray-100 leading-relaxed font-light font-playfair italic">
                        &quot;{step.story}&quot;
                    </p>
                </div>
            </div>

            {/* Science Drawer (Slide Up) */}
            <motion.div
                initial={false}
                animate={{ y: isOpen ? "0%" : "calc(100% - 64px)" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute inset-x-0 bottom-0 z-20 bg-santaan-teal/95 backdrop-blur-xl border-t border-white/20 rounded-t-3xl shadow-2xl flex flex-col h-[85%]"
            >
                {/* Drawer Handle / Header */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full h-16 flex items-center justify-between px-8 hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-santaan-amber/20 rounded-lg">
                            <Microscope className="w-5 h-5 text-santaan-amber" />
                        </div>
                        <span className="font-bold text-sm tracking-wider uppercase text-white">Science Deep Dive</span>
                    </div>
                    {isOpen ? (
                        <ChevronDown className="w-5 h-5 text-santaan-amber animate-bounce" />
                    ) : (
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                            <span className="text-xs text-white/70 uppercase tracking-widest font-semibold">Unlock Science</span>
                            <ChevronUp className="w-4 h-4 text-white/70" />
                        </div>
                    )}
                </button>

                {/* Drawer Content - The Deep Dive */}
                <div className="p-4 pt-6 overflow-y-auto h-full custom-scrollbar">

                    {/* Cinematic Header Layout (Tight) */}
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        {/* Left: The Visual (Immersive & Compact + Journey Metaphor) */}
                        <div className="w-full md:w-5/12 shrink-0 flex flex-col gap-3">
                            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-lg flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500">
                                {/* Spotlight Effect */}
                                <div className="absolute inset-0 bg-radial-gradient from-white/20 to-transparent opacity-50" />
                                {step.image && (
                                    <Image
                                        src={step.image}
                                        alt={`${step.title} Infographic`}
                                        fill
                                        className="object-contain p-4 drop-shadow-xl"
                                    />
                                )}
                            </div>

                            {/* --- NEW JOURNEY METAPHOR BLOCK --- */}
                            {step.journeyMetaphor && (
                                <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex gap-3 items-start">
                                    <div className="text-xl pt-0.5">{step.journeyMetaphor.icon}</div>
                                    <div>
                                        <h4 className="text-[10px] text-santaan-amber uppercase tracking-widest font-bold mb-1">{step.journeyMetaphor.label}</h4>
                                        <p className="text-xs text-white/80 leading-snug">{step.journeyMetaphor.text}</p>
                                    </div>
                                </div>
                            )}
                            {/* ---------------------------------- */}
                        </div>

                        {/* Right: The Narrative (Zero wasted space) */}
                        <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="h-px w-6 bg-santaan-gold/50" />
                                    <h3 className="text-santaan-sage font-mono text-[10px] tracking-[0.25em] uppercase">Scientific Context</h3>
                                </div>
                                <h2 className="text-3xl md:text-4xl text-white font-serif italic leading-none mb-3">
                                    <span className="text-santaan-gold">{step.denseScience?.headline.split(' ')[0]}</span>{' '}
                                    <span className="opacity-90">{step.denseScience?.headline.split(' ').slice(1).join(' ')}</span>
                                </h2>

                                {/* Dense Text Block - Cinematic Caption */}
                                <div className="relative pl-4 border-l-2 border-santaan-gold/30">
                                    <p
                                        className="text-white/80 leading-relaxed text-xs md:text-sm font-light"
                                        dangerouslySetInnerHTML={{ __html: step.denseScience?.description || "" }}
                                    />
                                </div>
                            </div>

                            {/* Key Stats - Flight Deck */}
                            <div className="grid grid-cols-3 gap-2 mt-4">
                                <div className="p-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                                    <div className="text-xl md:text-2xl font-serif text-white leading-none mb-0.5">{step.denseScience?.mainStat}</div>
                                    <div className="text-[9px] text-white/40 uppercase tracking-widest truncate">{step.denseScience?.mainStatLabel}</div>
                                </div>
                                {step.denseScience?.details.slice(0, 2).map((detail, idx) => (
                                    <div key={idx} className="p-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm flex flex-col justify-center">
                                        <div className="text-sm md:text-base font-bold text-santaan-sage leading-none mb-0.5">{detail.value}</div>
                                        <div className="text-[9px] text-white/40 uppercase tracking-widest truncate">{detail.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Tight Integrated Divider */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-4" />

                    {/* The Deep Specs (Grid - Compact) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {step.science.map((item, i) => (
                            <div key={i} className="bg-black/20 hover:bg-white/5 rounded-lg p-2 border border-white/5 flex items-start gap-3 transition-colors duration-300">
                                <div className="w-0.5 h-full bg-santaan-amber/40" />
                                <div>
                                    <span className="block text-[9px] font-bold text-santaan-sage uppercase tracking-wider mb-0.5">{item.label}</span>
                                    <span className="block text-xs text-white/90 font-medium leading-tight">{item.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 text-center opacity-30 hover:opacity-100 transition-opacity duration-500">
                        <span className="flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.2em] text-white">
                            <span className="w-1 h-1 bg-santaan-gold rounded-full animate-pulse" />
                            Verified Biological Data
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
