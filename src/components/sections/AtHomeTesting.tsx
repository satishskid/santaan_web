'use client';

import { Phone, Home, TestTube, Video, Clock, Lock, CheckCircle2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AtHomeTesting() {
    const handleBookCall = async () => {
        // Track in CRM
        if (typeof window !== 'undefined') {
            try {
                // Get UTM data from localStorage
                const utmData = {
                    intent: 'at_home_fertility_test',
                    phone: '+918971234567',
                    utmSource: localStorage.getItem('utm_source') || 'direct',
                    utmMedium: localStorage.getItem('utm_medium') || 'website',
                    utmCampaign: localStorage.getItem('utm_campaign') || 'home_testing',
                };
                
                // Track call intent
                await fetch('/api/track-call', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(utmData)
                });
            } catch (error) {
                console.error('Failed to track call:', error);
            }
            
            // Initiate phone call
            window.location.href = 'tel:+918971234567';
        }
    };

    return (
        <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                        <Lock className="w-4 h-4" />
                        Private & Discreet
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Fertility Testing at <span className="text-purple-600">Your Home</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        For busy professionals and privacy-conscious individuals: Comprehensive fertility assessment 
                        without visiting a clinic. Our trained executives come to you.
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
                    {/* Left: Benefits */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose At-Home Testing?</h3>
                        
                        <div className="space-y-4">
                            <div className="flex gap-4 items-start bg-white p-5 rounded-xl shadow-sm border border-purple-100">
                                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Fits Your Busy Schedule</h4>
                                    <p className="text-sm text-gray-600">
                                        No need to take time off work or rearrange meetings. Choose a slot that works for you—early morning, evening, or weekends.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start bg-white p-5 rounded-xl shadow-sm border border-purple-100">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Home className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Comfort & Privacy</h4>
                                    <p className="text-sm text-gray-600">
                                        Produce samples in the privacy and comfort of your own home. No clinic waiting rooms, no awkward moments. Complete discretion guaranteed.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start bg-white p-5 rounded-xl shadow-sm border border-purple-100">
                                <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                                    <Lock className="w-6 h-6 text-teal-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">100% Confidential</h4>
                                    <p className="text-sm text-gray-600">
                                        Your fertility journey is personal. Our trained professionals maintain strict confidentiality. All samples handled with medical-grade care.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start bg-white p-5 rounded-xl shadow-sm border border-purple-100">
                                <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <TestTube className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Comprehensive Testing</h4>
                                    <p className="text-sm text-gray-600">
                                        Complete fertility panel including hormonal profile, AMH, semen analysis, and more. Same lab-grade accuracy as clinic tests.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: How It Works */}
                    <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-8 rounded-2xl text-white">
                        <h3 className="text-2xl font-bold mb-6">How It Works</h3>
                        
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                                    1
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Book Your Slot</h4>
                                    <p className="text-sm text-purple-100">
                                        Call us to schedule a convenient time. Morning, evening, or weekend—we adapt to your calendar.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                                    2
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Home Visit</h4>
                                    <p className="text-sm text-purple-100">
                                        Our trained Santaan executive visits your home with sterile collection kits and proper documentation.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                                    3
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Sample Collection</h4>
                                    <p className="text-sm text-purple-100">
                                        Provide samples in your private space. Blood samples collected by trained phlebotomist. All samples handled professionally.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                                    4
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Lab Analysis</h4>
                                    <p className="text-sm text-purple-100">
                                        Samples rushed to NABL-accredited labs. Results ready in 24-48 hours with detailed analysis.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                                    5
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Teleconsultation</h4>
                                    <p className="text-sm text-purple-100">
                                        Video consultation with fertility specialist to review results and discuss personalized treatment plan.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Why Biological Parameters Matter */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12 mb-12">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Video className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Why Complete Testing Before Teleconsultation?
                            </h3>
                            <p className="text-gray-600">
                                For a truly effective virtual consultation, your doctor needs comprehensive biological data
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex gap-3 items-start">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Accurate Diagnosis</h4>
                                <p className="text-sm text-gray-600">
                                    Hormonal levels, AMH, thyroid, and metabolic markers reveal underlying conditions that symptoms alone cannot identify.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-start">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Personalized Treatment</h4>
                                <p className="text-sm text-gray-600">
                                    Data-driven protocols tailored to your unique biological profile—not generic advice.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-start">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Save Time & Money</h4>
                                <p className="text-sm text-gray-600">
                                    Avoid multiple consultations and trial-and-error approaches. Get the right treatment plan from day one.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-start">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Track Progress</h4>
                                <p className="text-sm text-gray-600">
                                    Baseline parameters establish measurable benchmarks to monitor treatment effectiveness over time.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-start">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Evidence-Based Decisions</h4>
                                <p className="text-sm text-gray-600">
                                    Scientific data eliminates guesswork. Your specialist can confidently recommend IVF, IUI, or lifestyle modifications.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-start">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Partner Assessment</h4>
                                <p className="text-sm text-gray-600">
                                    Simultaneous testing for both partners provides complete fertility picture, crucial for success planning.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-white rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-700">
                            <strong className="text-gray-900">Clinical Note:</strong> Teleconsultations without lab parameters 
                            can only provide general guidance. Comprehensive testing enables your doctor to make precise medical 
                            decisions equivalent to in-person consultations—making virtual care as effective as clinic visits.
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                    <Calendar className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Ready to Start Your Journey?
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                        Book your at-home fertility test today. Our team will reach out within 2 hours 
                        to schedule a convenient time for sample collection.
                    </p>
                    
                    <Button
                        onClick={handleBookCall}
                        className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-3"
                    >
                        <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        Call Now: +91 897 123 4567
                    </Button>
                    
                    <p className="text-sm text-gray-500 mt-4">
                        Available 24/7 • No obligation • Free consultation
                    </p>
                </div>
            </div>
        </section>
    );
}
