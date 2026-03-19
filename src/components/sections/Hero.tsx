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
                    Evidence-backed, research-led care
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

                <div className="flex flex-wrap items-center justify-center gap-2 mb-8 md:mb-10">
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-xs md:text-sm font-medium tracking-wide border border-white/20">
                        Odisha&apos;s only IVF chain*
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-xs md:text-sm font-medium tracking-wide border border-white/20">
                        IVF for Bharat
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-xs md:text-sm font-medium tracking-wide border border-white/20">
                        Active R&amp;D + innovation focus
                    </span>
                </div>

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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
                    <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-4 py-4 md:px-5 md:py-5 text-left">
                        <p className="text-2xl md:text-3xl font-playfair font-bold text-white leading-none">15K+</p>
                        <p className="mt-2 text-xs md:text-sm text-white/85 font-medium">Families supported*</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-4 py-4 md:px-5 md:py-5 text-left">
                        <p className="text-2xl md:text-3xl font-playfair font-bold text-white leading-none">15+</p>
                        <p className="mt-2 text-xs md:text-sm text-white/85 font-medium">National awards</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-4 py-4 md:px-5 md:py-5 text-left">
                        <p className="text-2xl md:text-3xl font-playfair font-bold text-white leading-none">0% EMI*</p>
                        <p className="mt-2 text-xs md:text-sm text-white/85 font-medium">On select plans</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-4 py-4 md:px-5 md:py-5 text-left">
                        <p className="text-2xl md:text-3xl font-playfair font-bold text-white leading-none">Odisha</p>
                        <p className="mt-2 text-xs md:text-sm text-white/85 font-medium">Only IVF chain*</p>
                    </div>
                </div>
                <p className="mt-4 text-[11px] md:text-xs text-white/70 max-w-4xl mx-auto">
                    *Figures are indicative and based on internal records. Family count is 15K+ and counting. “Only IVF chain” claim is based on publicly available information as of Mar 2026. EMI offered by partner financial institutions, subject to eligibility and terms. Medical outcomes vary by age, diagnosis and clinical factors.
                </p>
            </div>
        </section>
    );
}
