"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, Heart, Weight, Cigarette, Brain, Moon, Activity, CheckCircle, Info, RefreshCcw, ArrowRight, Droplet, Zap, Shield, Pill, Stethoscope, Beaker } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Factor {
    id: string;
    label: string;
    icon: LucideIcon;
    type: 'select' | 'toggle';
    options?: { value: string; label: string }[];
    riskWeight: number;
    info: string;
}

interface FactorValue {
    factorId: string;
    value: string | boolean;
    riskPoints: number;
}

const factors: Factor[] = [
    {
        id: 'female-age',
        label: 'Female Age',
        icon: User,
        type: 'select',
        options: [
            { value: 'none', label: 'Not applicable' },
            { value: '<30', label: 'Under 30' },
            { value: '30-34', label: '30-34' },
            { value: '35-37', label: '35-37' },
            { value: '38-40', label: '38-40' },
            { value: '41-42', label: '41-42' },
            { value: '43+', label: '43 or older' }
        ],
        riskWeight: 1,
        info: 'Female age is the strongest predictor of fertility. Egg quality and quantity decline naturally with age, especially after 35.'
    },
    {
        id: 'male-age',
        label: 'Male Age',
        icon: Users,
        type: 'select',
        options: [
            { value: 'none', label: 'Not applicable' },
            { value: '<40', label: 'Under 40' },
            { value: '40-45', label: '40-45' },
            { value: '45-50', label: '45-50' },
            { value: '50-55', label: '50-55' },
            { value: '55+', label: '55 or older' }
        ],
        riskWeight: 1,
        info: 'Male age affects sperm quality, DNA fragmentation, and can impact pregnancy outcomes. Quality declines gradually after 40.'
    },
    {
        id: 'trying-duration',
        label: 'Trying Duration',
        icon: Moon,
        type: 'select',
        options: [
            { value: '<6m', label: 'Less than 6 months' },
            { value: '6-12m', label: '6-12 months' },
            { value: '12-24m', label: '1-2 years' },
            { value: '24m+', label: 'Over 2 years' }
        ],
        riskWeight: 1,
        info: 'If under 35 and trying for 12+ months, or 35+ and trying for 6+ months, fertility evaluation is recommended per ASRM guidelines.'
    },
    {
        id: 'pcos',
        label: 'PCOS/PCOD',
        icon: Activity,
        type: 'toggle',
        riskWeight: 2,
        info: 'Polycystic ovary syndrome affects 8-13% of reproductive-aged women, impacting ovulation and hormone balance. Highly treatable with medication.'
    },
    {
        id: 'endometriosis',
        label: 'Endometriosis',
        icon: Droplet,
        type: 'toggle',
        riskWeight: 2,
        info: 'Endometriosis affects 10-15% of women and can impact egg quality, tubal function, and implantation. Treatment options include surgery and IVF.'
    },
    {
        id: 'thyroid',
        label: 'Thyroid Disorder',
        icon: Zap,
        type: 'toggle',
        riskWeight: 1.5,
        info: 'Thyroid disorders (hypo/hyperthyroidism) affect reproductive hormones and pregnancy outcomes. Usually manageable with medication.'
    },
    {
        id: 'diabetes',
        label: 'Diabetes',
        icon: Beaker,
        type: 'toggle',
        riskWeight: 1.5,
        info: 'Diabetes can affect fertility in both men and women by impacting hormone levels and reproductive function. Good glycemic control improves outcomes.'
    },
    {
        id: 'bmi',
        label: 'BMI Status',
        icon: Weight,
        type: 'select',
        options: [
            { value: 'normal', label: 'Normal (18.5-24.9)' },
            { value: 'underweight', label: 'Underweight (<18.5)' },
            { value: 'overweight', label: 'Overweight (25-29.9)' },
            { value: 'obese', label: 'Obese (30+)' }
        ],
        riskWeight: 1,
        info: 'BMI outside normal range can affect hormone production, ovulation, and IVF success rates. Optimal BMI is 18.5-24.9 for fertility.'
    },
    {
        id: 'smoking',
        label: 'Smoking/Tobacco',
        icon: Cigarette,
        type: 'toggle',
        riskWeight: 2,
        info: 'Smoking accelerates egg depletion by 1-4 years, reduces sperm quality, and increases miscarriage risk by 2-fold.'
    },
    {
        id: 'alcohol',
        label: 'Regular Alcohol',
        icon: Shield,
        type: 'toggle',
        riskWeight: 1,
        info: 'Regular heavy alcohol consumption (>7 drinks/week) can affect ovulation, sperm quality, and early pregnancy development.'
    },
    {
        id: 'stress',
        label: 'High Chronic Stress',
        icon: Brain,
        type: 'toggle',
        riskWeight: 1,
        info: 'Chronic stress elevates cortisol, which can disrupt GnRH and affect ovulation and sperm production. Stress management improves outcomes.'
    },
    {
        id: 'irregular-cycles',
        label: 'Irregular Periods',
        icon: Heart,
        type: 'toggle',
        riskWeight: 2,
        info: 'Irregular cycles (>35 days or <21 days) often indicate anovulation or hormonal imbalances. Treatable with medications like Clomid or Letrozole.'
    },
    {
        id: 'previous-pregnancy',
        label: 'Previous Pregnancy Loss',
        icon: Pill,
        type: 'toggle',
        riskWeight: 1.5,
        info: 'Recurrent pregnancy loss (2+ miscarriages) may indicate chromosomal, anatomical, or immunological factors requiring evaluation.'
    },
    {
        id: 'std-history',
        label: 'STI/PID History',
        icon: Stethoscope,
        type: 'toggle',
        riskWeight: 1.5,
        info: 'History of sexually transmitted infections or pelvic inflammatory disease can cause tubal damage. Treatable with surgery or IVF.'
    }
];

const calculateRiskScore = (values: FactorValue[]): number => {
    let score = 0;

    values.forEach(v => {
        const factor = factors.find(f => f.id === v.factorId);
        if (!factor) return;

        if (factor.type === 'toggle' && v.value === true) {
            score += v.riskPoints;
        } else if (factor.type === 'select' && v.value !== 'none' && v.value !== '<6m' && v.value !== 'normal' && v.value !== '<30' && v.value !== '<40') {
            score += v.riskPoints;
        }
    });

    return score;
};

const getRiskPoints = (factorId: string, value: string | boolean): number => {
    const factor = factors.find(f => f.id === factorId);
    if (!factor) return 0;

    if (factor.type === 'toggle') {
        return value === true ? factor.riskWeight : 0;
    }

    // Age-based scoring
    if (factorId === 'female-age') {
        if (value === '43+') return 5;
        if (value === '41-42') return 4;
        if (value === '38-40') return 3;
        if (value === '35-37') return 2;
        if (value === '30-34') return 1;
        return 0;
    }

    if (factorId === 'male-age') {
        if (value === '55+') return 2.5;
        if (value === '50-55') return 2;
        if (value === '45-50') return 1.5;
        if (value === '40-45') return 1;
        return 0;
    }

    if (factorId === 'trying-duration') {
        if (value === '24m+') return 3;
        if (value === '12-24m') return 2;
        if (value === '6-12m') return 1;
        return 0;
    }

    if (factorId === 'bmi') {
        if (value === 'obese') return 2;
        if (value === 'overweight' || value === 'underweight') return 1;
        return 0;
    }

    return factor.riskWeight;
};

const getReadinessZone = (score: number): { zone: string; color: string; bgColor: string; message: string; recommendation: string } => {
    if (score <= 3) {
        return {
            zone: 'Optimal Zone - Excellent Readiness',
            color: 'text-santaan-teal',
            bgColor: 'bg-santaan-teal',
            message: 'Your fertility indicators look very favorable. You have excellent readiness for conception.',
            recommendation: 'Continue healthy habits and track your cycle. If not conceiving within expected timeframes (12 months if under 35, 6 months if 35+), schedule a consultation for optimization.'
        };
    } else if (score <= 6) {
        return {
            zone: 'Good Zone - Minor Considerations',
            color: 'text-blue-600',
            bgColor: 'bg-blue-500',
            message: 'Some factors may influence your timeline. A proactive consultation can help optimize your fertility journey.',
            recommendation: 'Consider scheduling a fertility wellness check to understand your specific situation and create a personalized plan.'
        };
    } else if (score <= 10) {
        return {
            zone: 'Action Zone - Professional Guidance Recommended',
            color: 'text-purple-600',
            bgColor: 'bg-purple-500',
            message: 'Multiple factors suggest you would benefit from professional fertility guidance to maximize your chances.',
            recommendation: 'We recommend scheduling a comprehensive fertility evaluation to discuss personalized treatment options and optimize outcomes.'
        };
    } else {
        return {
            zone: 'Priority Zone - Specialist Evaluation Important',
            color: 'text-amber-600',
            bgColor: 'bg-santaan-amber',
            message: 'Your profile indicates time-sensitive factors. Early specialist consultation is valuable to explore all available pathways.',
            recommendation: 'Book a comprehensive fertility assessment soon. Many factors are highly treatable, and early intervention improves success rates significantly.'
        };
    }
};

export function FertilityReadinessAssessment() {
    const [selectedFactors, setSelectedFactors] = useState<FactorValue[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [hoveredFactor, setHoveredFactor] = useState<string | null>(null);

    const handleFactorChange = (factorId: string, value: string | boolean) => {
        const riskPoints = getRiskPoints(factorId, value);

        setSelectedFactors(prev => {
            const existing = prev.find(f => f.factorId === factorId);
            if (existing) {
                return prev.map(f =>
                    f.factorId === factorId
                        ? { ...f, value, riskPoints }
                        : f
                );
            }
            return [...prev, { factorId, value, riskPoints }];
        });
    };

    const handleReset = () => {
        setSelectedFactors([]);
        setShowResults(false);
    };

    const handleCalculate = () => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'calculate', {
                event_category: 'assessment',
                event_label: 'fertility_readiness_calculated',
                value: calculateRiskScore(selectedFactors)
            });
        }
        setShowResults(true);
    };

    const riskScore = calculateRiskScore(selectedFactors);
    const readiness = getReadinessZone(riskScore);

    return (
        <section id="santaan-signal" className="py-20 md:py-28 bg-linear-to-br from-white via-santaan-cream/30 to-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-20 right-0 w-96 h-96 bg-santaan-sage/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-0 w-96 h-96 bg-santaan-teal/5 rounded-full blur-3xl" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-12 max-w-3xl mx-auto">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 rounded-full bg-santaan-teal/10 text-santaan-teal font-semibold uppercase tracking-wider text-xs mb-4"
                    >
                        Interactive Assessment
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-playfair font-bold text-gray-900 mb-4"
                    >
                        Check Your <span className="text-santaan-amber">Fertility Readiness</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-gray-600 leading-relaxed"
                    >
                        Click on the factors below to see how they impact your fertility readiness. This is educational—always consult with a specialist for personalized guidance.
                    </motion.p>
                </div>

                {/* Factor Bubbles Grid */}
                <div className="max-w-6xl mx-auto mb-12">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {factors.map((factor, index) => {
                            const Icon = factor.icon;
                            const isSelected = selectedFactors.some(f => f.factorId === factor.id && (
                                (factor.type === 'toggle' && f.value === true) ||
                                (factor.type === 'select' && f.value !== 'none' && f.value !== '')
                            ));

                            return (
                                <motion.div
                                    key={factor.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05 }}
                                    className="relative"
                                >
                                    {/* Factor Card */}
                                    <div
                                        className={`relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${isSelected
                                            ? 'bg-santaan-teal text-white border-santaan-teal shadow-lg'
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-santaan-teal/50 hover:shadow-md'
                                            }`}
                                        onMouseEnter={() => setHoveredFactor(factor.id)}
                                        onMouseLeave={() => setHoveredFactor(null)}
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <div className={`w-12 h-12 rounded-full mb-3 flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-santaan-teal/10'
                                                }`}>
                                                <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-santaan-teal'}`} />
                                            </div>
                                            <h3 className="text-sm font-bold mb-2">{factor.label}</h3>

                                            {/* Toggle or Select */}
                                            {factor.type === 'toggle' ? (
                                                <button
                                                    onClick={() => {
                                                        const current = selectedFactors.find(f => f.factorId === factor.id);
                                                        handleFactorChange(factor.id, !current?.value);
                                                    }}
                                                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${isSelected
                                                        ? 'bg-white text-santaan-teal'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-santaan-teal/10'
                                                        }`}
                                                >
                                                    {isSelected ? 'Yes' : 'Click to select'}
                                                </button>
                                            ) : (
                                                <select
                                                    value={selectedFactors.find(f => f.factorId === factor.id)?.value as string || 'none'}
                                                    onChange={(e) => handleFactorChange(factor.id, e.target.value)}
                                                    className={`text-xs w-full px-2 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-santaan-teal ${isSelected
                                                        ? 'bg-white text-gray-900 border-white'
                                                        : 'bg-white text-gray-700 border-gray-200'
                                                        }`}
                                                >
                                                    {factor.options?.map(opt => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>

                                        {/* Info Tooltip */}
                                        <AnimatePresence>
                                            {hoveredFactor === factor.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full z-20 w-64 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-xl"
                                                >
                                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                                                    <div className="flex items-start gap-2">
                                                        <Info className="w-3 h-3 shrink-0 mt-0.5" />
                                                        <p className="leading-snug">{factor.info}</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 mb-12">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCalculate}
                        className="px-8 py-3 bg-santaan-amber hover:bg-santaan-amber/90 text-white font-semibold rounded-full shadow-lg flex items-center gap-2 transition-colors"
                    >
                        Calculate My Readiness
                        <ArrowRight className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleReset}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-full flex items-center gap-2 transition-colors"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Reset
                    </motion.button>
                </div>

                {/* Results Panel */}
                <AnimatePresence>
                    {showResults && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                                {/* Score Header */}
                                <div className={`p-8 text-white ${readiness.bgColor}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-2xl font-bold mb-1">Your Readiness Zone</h3>
                                            <p className="text-white/90 text-lg">{readiness.zone}</p>
                                        </div>
                                        <div className="text-5xl font-bold opacity-90">{riskScore}</div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((riskScore / 15) * 100, 100)}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-white/90"
                                        />
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="p-8">
                                    <div className="flex items-start gap-3 mb-6">
                                        <CheckCircle className={`w-6 h-6 ${readiness.color} shrink-0 mt-1`} />
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-900 mb-2">What This Means</h4>
                                            <p className="text-gray-700 leading-relaxed mb-4">{readiness.message}</p>
                                            <p className="text-gray-600 leading-relaxed"><strong>Recommendation:</strong> {readiness.recommendation}</p>
                                        </div>
                                    </div>

                                    {/* Selected Factors Summary */}
                                    {selectedFactors.filter(f =>
                                        (factors.find(factor => factor.id === f.factorId)?.type === 'toggle' && f.value === true) ||
                                        (factors.find(factor => factor.id === f.factorId)?.type === 'select' && f.value !== 'none')
                                    ).length > 0 && (
                                            <div className="border-t border-gray-100 pt-6">
                                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                                    Factors Considered
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedFactors
                                                        .filter(f =>
                                                            (factors.find(factor => factor.id === f.factorId)?.type === 'toggle' && f.value === true) ||
                                                            (factors.find(factor => factor.id === f.factorId)?.type === 'select' && f.value !== 'none')
                                                        )
                                                        .map(f => {
                                                            const factor = factors.find(factor => factor.id === f.factorId);
                                                            if (!factor) return null;

                                                            return (
                                                                <span
                                                                    key={f.factorId}
                                                                    className="px-3 py-1 bg-santaan-teal/10 text-santaan-teal text-sm font-medium rounded-full"
                                                                >
                                                                    {factor.label}
                                                                    {factor.type === 'select' && f.value !== 'none' && `: ${factor.options?.find(o => o.value === f.value)?.label}`}
                                                                </span>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        )}
                                </div>

                                {/* CTA Footer */}
                                <div className="p-6 bg-linear-to-r from-santaan-teal/5 to-santaan-sage/10 border-t border-gray-100">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                        <p className="text-sm text-gray-600">
                                            Ready to take the next step? Speak with our fertility specialists.
                                        </p>
                                        <a href="tel:+919337326896">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="px-6 py-2.5 bg-santaan-teal hover:bg-santaan-teal/90 text-white font-semibold rounded-full shadow-md transition-colors"
                                                onClick={() => {
                                                    if (typeof window !== 'undefined' && (window as any).gtag) {
                                                        (window as any).gtag('event', 'click', {
                                                            event_category: 'conversion',
                                                            event_label: 'assessment_result_book_consultation'
                                                        });
                                                    }
                                                }}
                                            >
                                                Book Consultation
                                            </motion.button>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Disclaimer */}
                <div className="mt-12 text-center max-w-3xl mx-auto">
                    <div className="flex items-start gap-2 justify-center text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <p className="text-left">
                            <strong>Educational Tool:</strong> This assessment is for informational purposes based on general scientific principles.
                            It does not constitute medical advice. Individual fertility is complex and requires professional evaluation.
                            Please consult with a fertility specialist for accurate diagnosis and personalized treatment options.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
