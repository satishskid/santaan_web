"use client";

import { useJourney } from '@/context/JourneyContext';
import { Button } from '@/components/ui/Button';
import { Sprout, CheckCircle, AlertCircle, Video, Stethoscope, FileText, ArrowRight, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export function ProfileContent() {
    const { signal } = useJourney();

    const renderOffers = () => {
        if (!signal) {
            return (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <p className="text-gray-500 mb-4">You haven&apos;t taken the full clinical assessment yet.</p>
                    <Link href="/#assessment">
                        <Button className="w-full">Start Assessment</Button>
                    </Link>
                </div>
            );
        }

        if (signal === 'green') {
            return (
                <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <h4 className="font-bold text-emerald-800 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Green Signal: Nature is Flowing
                        </h4>
                        <p className="text-sm text-emerald-700 mt-1">Your fertility health looks great. Maintain it with our wellness resources.</p>
                    </div>
                    <OfferCard
                        title="Pre-Conception Yoga Class"
                        description="Optimize your flow with our specialized yoga sessions."
                        icon={Video}
                        color="emerald"
                    />
                    <OfferCard
                        title="Nutritional Guide for Couples"
                        description="Download our expert diet plan for healthy conception."
                        icon={FileText}
                        color="emerald"
                    />
                </div>
            )
        }

        if (signal === 'yellow') {
            return (
                <div className="space-y-4">
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <h4 className="font-bold text-amber-800 flex items-center gap-2">
                            <HelpCircle className="w-4 h-4" /> Yellow Signal: Needs a Little Care
                        </h4>
                        <p className="text-sm text-amber-700 mt-1">A minor hurdle might be present. Let&apos;s clear the path with expert guidance.</p>
                    </div>
                    <OfferCard
                        title="30-Min Tele-Consult"
                        description="Speak with a Senior Nurse to understand your timeline."
                        icon={Stethoscope}
                        color="amber"
                    />
                    <OfferCard
                        title="Fertility 101 Webinar"
                        description="Join our next live session to get your questions answered."
                        icon={Video}
                        color="amber"
                    />
                </div>
            )
        }

        if (signal === 'red') {
            return (
                <div className="space-y-4">
                    <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                        <h4 className="font-bold text-rose-800 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Red Signal: Priority Care
                        </h4>
                        <p className="text-sm text-rose-700 mt-1">Time is of the essence. We recommend seeing a specialist immediately.</p>
                    </div>
                    <OfferCard
                        title="Priority IVF Consultation"
                        description="Skip the queue and meet Dr. Satish today."
                        icon={Stethoscope}
                        color="rose"
                        highlight
                    />
                    <OfferCard
                        title="Success Rate Calculator"
                        description="Understand your chances with our scientific model."
                        icon={FileText}
                        color="rose"
                    />
                </div>
            )
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-santaan-teal/10 p-2 rounded-full">
                    <Sprout className="w-5 h-5 text-santaan-teal" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Your Personalized Offers</h3>
            </div>
            {renderOffers()}
        </div>
    );
}

interface OfferCardProps {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: 'emerald' | 'amber' | 'rose';
    highlight?: boolean;
}

function OfferCard({ title, description, icon: Icon, color, highlight = false }: OfferCardProps) {
    const colorClasses = {
        emerald: 'bg-emerald-100 text-emerald-600',
        amber: 'bg-amber-100 text-amber-600',
        rose: 'bg-rose-100 text-rose-600',
    };

    return (
        <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer ${highlight ? 'bg-white border-2 border-santaan-teal shadow-sm' : 'bg-white border-gray-100'}`}>
            <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-gray-800">{title}</h4>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
            <div className="self-center">
                <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
        </div>
    )
}