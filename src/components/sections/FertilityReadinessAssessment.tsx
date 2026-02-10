"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, Heart, Weight, Cigarette, Brain, Moon, Activity, AlertTriangle, CheckCircle, Info, RefreshCcw, ArrowRight } from 'lucide-react';
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
            { value: '41+', label: '41 or older' }
        ],
        riskWeight: 1,
        info: 'Female age is the strongest predictor of fertility. Egg quality and quantity decline naturally with age.'
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
            { value: '50+', label: '50 or older' }
        ],
        riskWeight: 1,
        info: 'Male age affects sperm quality, DNA fragmentation, and can impact pregnancy outcomes.'
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
        info: 'If under 35 and trying for 12+ months, or 35+ and trying for 6+ months, evaluation is recommended.'
    },
    {
        id: 'pcos',
        label: 'PCOS/PCOD',
        icon: Activity,
        type: 'toggle',
        riskWeight: 2,
        info: 'Polycystic ovary syndrome affects ovulation and hormone balance, but is highly treatable.'
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
        info: 'Both underweight and overweight can affect hormone production and ovulation.'
    },
    {
        id: 'smoking',
        label: 'Smoking',
        icon: Cigarette,
        type: 'toggle',
        riskWeight: 2,
        info: 'Smoking accelerates egg loss, reduces sperm quality, and increases miscarriage risk.'
    },
    {
        id: 'stress',
        label: 'High Stress',
        icon: Brain,
        type: 'toggle',
        riskWeight: 1,
        info: 'Chronic stress can disrupt hormones and affect reproductive function in both partners.'
    },
    {
        id: 'irregular-cycles',
        label: 'Irregular Periods',
        icon: Heart,
        type: 'toggle',
        riskWeight: 2,
        info: 'Irregular cycles may indicate ovulation issues, but are often treatable with medication.'
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
        if (value === '41+') return 4;
        if (value === '38-40') return 3;
        if (value === '35-37') return 2;
        if (value === '30-34') return 1;
        return 0;
    }

    if (factorId === 'male-age') {
        if (value === '50+') return 2;
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

const getReadinessZone = (score: number): { zone: string; color: string; message: string; recommendation: string } => {
    if (score <= 2) {
        return {
            zone: 'Green Zone - Good Readiness',
            color: 'bg-green-500',
            message: 'Your fertility indicators suggest good readiness. Keep monitoring your health and timing.',
            recommendation: 'Continue healthy habits. If not conceiving within expected timeframes, consult a specialist.'
        };
    } else if (score <= 5) {
        return {
            zone: 'Yellow Zone - Moderate Factors',
            color: 'bg-yellow-500',
            message: 'Some factors may impact your fertility timeline. A consultation can help optimize your chances.',
            recommendation: 'Consider scheduling a fertility assessment to understand your specific situation better.'
        };
    } else if (score <= 8) {
        return {
            zone: 'Orange Zone - Multiple Factors',
            color: 'bg-orange-500',
            message: 'Multiple factors suggest you may benefit from medical guidance sooner rather than later.',
            recommendation: 'We recommend consulting with a fertility specialist to discuss personalized options.'
        };
    } else {
        return {
            zone: 'Red Zone - Immediate Consultation',
            color: 'bg-red-500',
            message: 'Your profile suggests time-sensitive factors. Professional evaluation is strongly recommended.',
            recommendation: 'Schedule a comprehensive fertility evaluation to explore all available pathways.'
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
                <div className="max-w-5xl mx-auto mb-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
                                        className={`relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                                            isSelected
                                                ? 'bg-santaan-teal text-white border-santaan-teal shadow-lg'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-santaan-teal/50 hover:shadow-md'
                                        }`}
                                        onMouseEnter={() => setHoveredFactor(factor.id)}
                                        onMouseLeave={() => setHoveredFactor(null)}
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <div className={`w-12 h-12 rounded-full mb-3 flex items-center justify-center ${
                                                isSelected ? 'bg-white/20' : 'bg-santaan-teal/10'
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
                                                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                                                        isSelected
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
                                                    className={`text-xs w-full px-2 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-santaan-teal ${
                                                        isSelected
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
                                <div className={`p-8 text-white ${readiness.color}`}>
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
                                            animate={{ width: `${Math.min((riskScore / 12) * 100, 100)}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-white/90"
                                        />
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="p-8">
                                    <div className="flex items-start gap-3 mb-6">
                                        {riskScore <= 2 ? (
                                            <CheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                                        ) : (
                                            <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0 mt-1" />
                                        )}
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
