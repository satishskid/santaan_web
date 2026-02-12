"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, HelpCircle, RefreshCcw, Sprout, Activity, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useJourney } from '@/context/JourneyContext';
import { useSession, signIn } from 'next-auth/react';
import { SeminarRegistration } from '@/components/features/SeminarRegistration';

// --- Types ---
type SignalType = 'green' | 'yellow' | 'red';
type Gender = 'female' | 'male' | 'couple';

// --- Data & Logic ---

const MEDICAL_CONDITIONS = [
    { id: 'pcos', label: 'PCOS / PCOD', weight: 2 },
    { id: 'endo', label: 'Endometriosis', weight: 2 },
    { id: 'thyroid', label: 'Thyroid Issues', weight: 1 },
    { id: 'irregular', label: 'Irregular Periods', weight: 2 },
    { id: 'diabetes', label: 'Diabetes', weight: 1 },
    { id: 'none', label: 'None of the above', weight: 0 },
];

export function SantaanSignal() {
    // --- State ---
    const [step, setStep] = useState(0);
    const [age, setAge] = useState<number>(28);
    const [duration, setDuration] = useState<string>('under-6m');
    const [bmiDetails, setBmiDetails] = useState({ height: 160, weight: 60 }); // cm, kg
    const [conditions, setConditions] = useState<string[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [isSeminarOpen, setIsSeminarOpen] = useState(false);

    const { setSignal } = useJourney();
    const { data: session } = useSession();

    // --- Helpers ---
    const calculateBMI = () => {
        const heightM = bmiDetails.height / 100;
        return (bmiDetails.weight / (heightM * heightM)).toFixed(1);
    };

    const getBMIStatus = (bmi: number) => {
        if (bmi < 18.5) return { status: 'Underweight', score: 1 };
        if (bmi < 25) return { status: 'Normal', score: 0 };
        if (bmi < 30) return { status: 'Overweight', score: 1 };
        return { status: 'Obese', score: 2 };
    };

    // --- Scoring Engine ---
    const calculateSignal = (): { signal: SignalType, score: number, insights: string[] } => {
        let score = 0;
        const insights: string[] = [];

        // 1. Age Factor (The Biological Clock)
        if (age >= 35) {
            score += 3;
            insights.push("Age is a significant factor. Fertility naturally declines faster after 35.");
        } else if (age >= 30) {
            score += 1;
            insights.push("You are in the 'Golden Harvest' period, but it's good to be proactive.");
        }

        // 2. Duration Factor
        if (duration === 'over-1y') {
            score += 2;
            insights.push("Trying for over a year usually warrants a consultation with a specialist.");
        } else if (duration === '6m-1y' && age >= 35) {
            score += 2; // Accelerated timeline for 35+
            insights.push("At 35+, we recommend checking in after 6 months of trying.");
        }

        // 3. BMI Factor
        const bmi = parseFloat(calculateBMI());
        const bmiStatus = getBMIStatus(bmi);
        score += bmiStatus.score;
        if (bmiStatus.score > 0) {
            insights.push(`Your BMI indicates you are ${bmiStatus.status}, which can affect hormonal balance.`);
        }

        // 4. Medical History
        conditions.forEach(c => {
            const cond = MEDICAL_CONDITIONS.find(mc => mc.id === c);
            if (cond) score += cond.weight;
        });
        if (conditions.includes('pcos') || conditions.includes('endo') || conditions.includes('irregular')) {
            insights.push("Reported medical conditions may directly impact ovulation or conception.");
        }

        // Determine Signal
        let signal: SignalType = 'green';
        if (score >= 4) signal = 'red';
        else if (score >= 2) signal = 'yellow';

        return { signal, score, insights };
    };

    const handleComplete = () => {
        const result = calculateSignal();
        setSignal(result.signal);
        setShowResult(true);
    };

    // --- Render Helpers ---
    const updateCondition = (id: string) => {
        if (id === 'none') {
            setConditions(['none']);
        } else {
            let newConds = conditions.includes('none') ? [] : [...conditions];
            if (newConds.includes(id)) {
                newConds = newConds.filter(c => c !== id);
            } else {
                newConds.push(id);
            }
            setConditions(newConds);
        }
    };

    const resultData = calculateSignal();

    const getResultDisplay = (signal: SignalType) => {
        switch (signal) {
            case 'green':
                return {
                    color: "text-emerald-500",
                    bg: "bg-emerald-50",
                    border: "border-emerald-200",
                    icon: <CheckCircle className="w-16 h-16 text-emerald-500" />,
                    title: "Sabuja Sanket (Nature is Flowing)",
                    message: "Your fertility profile looks healthy! Keep up the good lifestyle.",
                    advice: "Continue a healthy lifestyle. No immediate medical intervention needed."
                };
            case 'yellow':
                return {
                    color: "text-amber-500",
                    bg: "bg-amber-50",
                    border: "border-amber-200",
                    icon: <HelpCircle className="w-16 h-16 text-amber-500" />,
                    title: "Haladia Sanket (Needs Attention)",
                    message: "There are some factors that might need optimization for a smoother journey.",
                    advice: "A consultation can help address minor hurdles early on."
                };
            case 'red':
                return {
                    color: "text-rose-500",
                    bg: "bg-rose-50",
                    border: "border-rose-200",
                    icon: <AlertCircle className="w-16 h-16 text-rose-500" />,
                    title: "Nali Sanket (Priority Care)",
                    message: "Ideally, we should not wait. Some factors suggest that seeing a specialist now would be beneficial.",
                    advice: "Science can help bypass these hurdles. Let's not lose more precious time."
                };
        }
    };

    const resultDisplay = getResultDisplay(resultData.signal);

    const restart = () => {
        setStep(0);
        setAge(28);
        setDuration('under-6m');
        setConditions([]);
        setShowResult(false);
    };

    return (
        <section className="py-24 bg-santaan-cream relative overflow-hidden" id="santaan-signal">
            {/* Background elements */}
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-santaan-sage/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm mb-4">
                            <Activity className="w-4 h-4 text-santaan-sage" />
                            <span className="text-xs font-bold uppercase tracking-widest text-santaan-teal">Fertility Assessment</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-playfair font-bold text-santaan-teal mb-3">
                            Check Your Santaan Signal
                        </h2>
                        <p className="text-gray-500 max-w-lg mx-auto">
                            A medically-grounded assessment to understand your fertility potential and get personalized guidance.
                        </p>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
                        <div className="h-2 bg-gradient-to-r from-santaan-sage to-santaan-amber w-full shrink-0" />

                        <div className="p-8 md:p-10 flex-grow flex flex-col">
                            <AnimatePresence mode="wait">
                                {!showResult ? (
                                    <motion.div
                                        key="questions"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex flex-col h-full"
                                    >
                                        {/* Progress Bar */}
                                        <div className="mb-8">
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-santaan-teal transition-all duration-500 ease-out"
                                                    style={{ width: `${((step + 1) / 4) * 100}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-right text-gray-400 mt-2">Step {step + 1} of 4</p>
                                        </div>

                                        {/* Steps */}
                                        <div className="flex-grow">
                                            {step === 0 && (
                                                <div className="space-y-6">
                                                    <h3 className="text-2xl font-bold text-gray-800">First, tell us a bit about yourself.</h3>
                                                    <div className="space-y-4">
                                                        <label className="block text-sm font-medium text-gray-600">Age of Mother-to-be</label>
                                                        <div className="flex items-center gap-4">
                                                            <input
                                                                type="range"
                                                                min="20" max="50"
                                                                value={age}
                                                                onChange={(e) => setAge(parseInt(e.target.value))}
                                                                className="w-full accent-santaan-teal h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                            />
                                                            <div className="w-16 h-12 bg-gray-50 rounded-lg flex items-center justify-center font-bold text-xl text-santaan-teal border border-gray-200">
                                                                {age}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-400">Age is the single most important factor affecting fertility.</p>
                                                    </div>
                                                </div>
                                            )}

                                            {step === 1 && (
                                                <div className="space-y-6">
                                                    <h3 className="text-2xl font-bold text-gray-800">How long have you been trying?</h3>
                                                    <div className="grid gap-3">
                                                        {[
                                                            { id: 'under-6m', label: 'Less than 6 months', desc: "Just started the journey" },
                                                            { id: '6m-1y', label: '6 months to 1 year', desc: "Trying for a while" },
                                                            { id: 'over-1y', label: 'More than 1 year', desc: "It's been quite sometime" }
                                                        ].map((opt) => (
                                                            <button
                                                                key={opt.id}
                                                                onClick={() => setDuration(opt.id)}
                                                                className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${duration === opt.id ? 'border-santaan-teal bg-santaan-sage/5' : 'border-gray-100 hover:border-gray-200'}`}
                                                            >
                                                                <div className="relative z-10">
                                                                    <div className="font-bold text-gray-800">{opt.label}</div>
                                                                    <div className="text-sm text-gray-500">{opt.desc}</div>
                                                                </div>
                                                                {duration === opt.id && (
                                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-santaan-teal">
                                                                        <CheckCircle className="w-6 h-6" />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {step === 2 && (
                                                <div className="space-y-6">
                                                    <h3 className="text-2xl font-bold text-gray-800">Let's check your BMI.</h3>
                                                    <p className="text-sm text-gray-500">Body weight can influence hormonal balance significantly.</p>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-600 mb-2">Height (cm)</label>
                                                            <input
                                                                type="number"
                                                                value={bmiDetails.height}
                                                                onChange={(e) => setBmiDetails({ ...bmiDetails, height: parseInt(e.target.value) })}
                                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-santaan-teal/20"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-600 mb-2">Weight (kg)</label>
                                                            <input
                                                                type="number"
                                                                value={bmiDetails.weight}
                                                                onChange={(e) => setBmiDetails({ ...bmiDetails, weight: parseInt(e.target.value) })}
                                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-santaan-teal/20"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-600">Your Calculated BMI:</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl font-bold text-gray-800">{calculateBMI()}</span>
                                                            <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${getBMIStatus(parseFloat(calculateBMI())).score > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                                                {getBMIStatus(parseFloat(calculateBMI())).status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {step === 3 && (
                                                <div className="space-y-6">
                                                    <h3 className="text-2xl font-bold text-gray-800">Any known history?</h3>
                                                    <p className="text-sm text-gray-500">Select all that apply to you.</p>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        {MEDICAL_CONDITIONS.map((cond) => (
                                                            <button
                                                                key={cond.id}
                                                                onClick={() => updateCondition(cond.id)}
                                                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${conditions.includes(cond.id) ? 'bg-santaan-teal text-white border-santaan-teal' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                                                            >
                                                                {cond.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Navigation Buttons */}
                                        <div className="mt-8 flex gap-3">
                                            {step > 0 && (
                                                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                                                    Back
                                                </Button>
                                            )}
                                            <Button
                                                className="flex-[2] bg-santaan-teal hover:bg-santaan-teal/90"
                                                onClick={() => {
                                                    if (step < 3) setStep(step + 1);
                                                    else handleComplete();
                                                }}
                                            >
                                                {step === 3 ? 'Reveal My Signal' : 'Next Step'}
                                            </Button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="result"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="h-full flex flex-col items-center text-center relative"
                                    >
                                        {!session ? (
                                            // Gated View
                                            <div className="w-full h-full flex flex-col items-center justify-center pt-8">
                                                <div className="filter blur-md opacity-50 select-none pointer-events-none w-full flex flex-col items-center">
                                                    <div className={`w-28 h-28 rounded-full ${resultDisplay.bg} flex items-center justify-center mb-6 ring-4 ring-white shadow-lg`}>
                                                        {resultDisplay.icon}
                                                    </div>
                                                    <h3 className="text-3xl font-playfair font-bold text-gray-900 mb-4">
                                                        {resultDisplay.title}
                                                    </h3>
                                                    <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                                                        {resultDisplay.message}
                                                    </p>
                                                </div>

                                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-3xl">
                                                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 border border-gray-100 text-center">
                                                        <div className="w-16 h-16 bg-santaan-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                            <Lock className="w-8 h-8 text-santaan-teal" />
                                                        </div>
                                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Unlock Your Report</h3>
                                                        <p className="text-gray-500 mb-6 text-sm">
                                                            Sign in to view your detailed fertility signal, personalized insights, and gardener&apos;s advice.
                                                        </p>
                                                        <Button
                                                            onClick={() => signIn('google')}
                                                            className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 mb-3"
                                                        >
                                                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                                                            Sign in with Google
                                                        </Button>
                                                        <p className="text-[10px] text-gray-400">
                                                            We ensure your data privacy.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            // Authenticated View (Existing Result UI)
                                            <>
                                                <div className={`w-28 h-28 rounded-full ${resultDisplay.bg} flex items-center justify-center mb-6 ring-4 ring-white shadow-lg`}>
                                                    {resultDisplay.icon}
                                                </div>

                                                <div className={`text-sm font-bold uppercase tracking-widest mb-3 px-4 py-1 rounded-full ${resultDisplay.bg} ${resultDisplay.color}`}>
                                                    {resultData.signal.toUpperCase()} SIGNAL
                                                </div>

                                                <h3 className="text-3xl font-playfair font-bold text-gray-900 mb-4">
                                                    {resultDisplay.title}
                                                </h3>

                                                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                                                    {resultDisplay.message}
                                                </p>

                                                {/* Insights Box */}
                                                <div className="w-full bg-gray-50 rounded-2xl p-6 text-left mb-6 border border-gray-100">
                                                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                                                        <Sprout className="w-4 h-4 text-santaan-sage" />
                                                        Why this result?
                                                    </h4>
                                                    <ul className="space-y-3">
                                                        {resultData.insights.length > 0 ? resultData.insights.map((insight, idx) => (
                                                            <li key={idx} className="flex gap-3 text-sm text-gray-600">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-santaan-amber mt-1.5 shrink-0" />
                                                                {insight}
                                                            </li>
                                                        )) : (
                                                            <li className="flex gap-3 text-sm text-gray-600">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                                                All primary indicators look positive and healthy.
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>

                                                {/* Seminar CTA */}
                                                <div className="w-full bg-orange-50/50 border border-orange-100 p-5 rounded-xl text-left mb-8">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                                                                <Calendar className="w-4 h-4 text-orange-500" />
                                                                Upcoming Specialist Seminar
                                                            </h4>
                                                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                                                Join Dr. Satish live to discuss your score of <span className="font-bold">{resultData.score}</span>. Get answers in a private, anonymous session.
                                                            </p>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            className="bg-white text-orange-600 border border-orange-200 hover:bg-orange-50 shadow-sm whitespace-nowrap"
                                                            onClick={() => setIsSeminarOpen(true)}
                                                        >
                                                            Register Free
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-3 w-full max-w-xs">
                                                    <Button size="lg" className="w-full bg-santaan-teal hover:bg-santaan-teal/90 shadow-lg shadow-santaan-teal/20">
                                                        Discuss with an Expert
                                                    </Button>
                                                    <button
                                                        onClick={restart}
                                                        className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-santaan-teal transition-colors py-2"
                                                    >
                                                        <RefreshCcw className="w-3 h-3" />
                                                        Start Over
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            <SeminarRegistration
                isOpen={isSeminarOpen}
                onClose={() => setIsSeminarOpen(false)}
                score={resultData.score}
                signal={resultData.signal.charAt(0).toUpperCase() + resultData.signal.slice(1) as 'Green' | 'Yellow' | 'Red'}
                initialData={{
                    name: session?.user?.name || '',
                    email: session?.user?.email || ''
                }}
            />
        </section>
    );
}
