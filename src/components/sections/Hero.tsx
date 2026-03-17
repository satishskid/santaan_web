import { Button } from '@/components/ui/Button';
import { ArrowRight, BookOpen } from 'lucide-react';
import Image from 'next/image';

export function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 md:pt-28 bg-gradient-to-br from-santaan-cream via-[#E6F0E6] to-[#FDF6F0]">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-santaan-teal/90 via-santaan-teal/60 to-transparent mix-blend-multiply z-10" />
                <div className="absolute inset-0">
                    <Image
                        src="/assets/hero-family.png"
                        alt="Happy family celebrating parenthood"
                        fill
                        sizes="100vw"
                        className="object-cover"
                        priority
                        quality={70}
                    />
                </div>
            </div>

            <div className="container relative z-10 px-4 md:px-6 text-center max-w-4xl mx-auto">
                <div className="mb-8 md:mb-10 mt-10 md:mt-12">
                    <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 md:px-8 md:py-6 shadow-xl max-w-3xl mx-auto">
                        <p className="font-playfair text-white text-lg md:text-xl mb-2 italic tracking-wide">
                            संतानः वंशस्य सातत्यम्, जीवनस्य समृद्धिः, प्रीतेः स्वरूपम्।
                        </p>
                        <p className="text-white/70 text-xs md:text-sm mb-1 font-light tracking-wider">
                            Santānaḥ vaṃśasya sātatyam, jīvanasya samṛddhiḥ, prīteḥ svarūpam.
                        </p>
                        <p className="text-white/90 text-sm md:text-base font-medium">
                            &quot;Santaan is the continuity of lineage, the prosperity of life, and the embodiment of love.&quot;
                        </p>
                    </div>
                </div>

                <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-sm font-medium tracking-wide border border-white/20 shadow-sm">
                    Evidence-backed care
                </span>

                <h1 className="text-3xl md:text-5xl font-playfair font-bold text-white mb-3 leading-tight drop-shadow-md">
                    Evidence-Driven IVF & Fertility Care in Bhubaneswar, Berhampur and Bangalore
                </h1>

                <p className="text-2xl md:text-4xl font-playfair font-bold text-white mb-6 leading-tight drop-shadow-md">
                    Where Science Meets <span className="text-santaan-amber">Hope</span>
                </p>

                <p className="text-lg md:text-xl text-white/90 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-medium">
                    Advanced diagnostics, compassionate specialists, and personalized treatment pathways for your fertility journey.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 md:mb-16">
                    <a href="#santaan-signal" aria-label="Begin your journey: take the Santaan Signal assessment">
                        <Button
                            size="lg"
                            className="group w-full sm:w-auto bg-santaan-amber hover:bg-[#E08E45] border-none shadow-lg hover:shadow-xl transition-all"
                        >
                            Begin Your Journey
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </a>

                    <a href="#insights" aria-label="Read today's fertility insight">
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

                <div className="absolute bottom-10 left-0 right-0 hidden md:flex justify-center gap-12 text-sm text-white/80 font-medium">
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
                </div>
            </div>
        </section>
    );
}
