"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Eye, BarChart2, Share2, Award } from 'lucide-react';

export function GrowthDashboard() {
    const [metrics, setMetrics] = useState({
        websiteVisits: 0,
        instagramReach: 0,
        linkedinImpressions: 0,
        youtubeViews: 0
    });

    const [score, setScore] = useState(0);

    const calculateScore = () => {
        // Algorithm:
        // Visits * 1 (High intent)
        // Reach * 0.1 (Awareness)
        // Views * 0.5 (Engagement)
        // Impressions * 0.2 (Professional reach)
        const newScore = Math.round(
            (metrics.websiteVisits * 1) +
            (metrics.instagramReach * 0.1) +
            (metrics.linkedinImpressions * 0.2) +
            (metrics.youtubeViews * 0.5)
        );
        setScore(newScore);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMetrics({
            ...metrics,
            [e.target.name]: Number(e.target.value)
        });
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-santaan-teal/10 p-3 rounded-full">
                    <BarChart2 className="w-6 h-6 text-santaan-teal" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Santaan Growth Sync</h2>
                    <p className="text-gray-500 text-sm">Track your specialized patient conversion score</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <h3 className="font-bold text-santaan-teal flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Weekly Inputs
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Website Visits</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    name="websiteVisits"
                                    value={metrics.websiteVisits || ''}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-santaan-teal/20 focus:border-santaan-teal outline-none transition-all"
                                    placeholder="e.g. 1200"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Reach</label>
                            <div className="relative">
                                <Share2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    name="instagramReach"
                                    value={metrics.instagramReach || ''}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-santaan-teal/20 focus:border-santaan-teal outline-none transition-all"
                                    placeholder="e.g. 5000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Impressions</label>
                            <div className="relative">
                                <BarChart2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    name="linkedinImpressions"
                                    value={metrics.linkedinImpressions || ''}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-santaan-teal/20 focus:border-santaan-teal outline-none transition-all"
                                    placeholder="e.g. 800"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Views</label>
                            <div className="relative">
                                <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    name="youtubeViews"
                                    value={metrics.youtubeViews || ''}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-santaan-teal/20 focus:border-santaan-teal outline-none transition-all"
                                    placeholder="e.g. 300"
                                />
                            </div>
                        </div>

                        <button
                            onClick={calculateScore}
                            className="w-full bg-santaan-teal text-white font-bold py-3 rounded-xl hover:bg-santaan-teal/90 transition-transform active:scale-95"
                        >
                            Calculate Score
                        </button>
                    </div>
                </div>

                {/* Result Section */}
                <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-gray-100">
                    <div className="mb-4 bg-white p-4 rounded-full shadow-sm">
                        <Award className="w-12 h-12 text-santaan-amber" />
                    </div>
                    <h3 className="text-gray-500 font-medium mb-2 uppercase tracking-widest text-xs">Your Santaan Score</h3>
                    <motion.div
                        key={score}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-6xl font-playfair font-bold text-santaan-teal mb-4"
                    >
                        {score}
                    </motion.div>

                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-6">
                        <motion.div
                            className="h-full bg-gradient-to-r from-santaan-sage to-santaan-teal"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((score / 5000) * 100, 100)}%` }}
                            transition={{ duration: 1 }}
                        />
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed">
                        {score > 1000 ? "Use 'High Conversion' posts. Your audience is engaged and ready." : "Focus on 'Awareness' posts. Expand your reach."}
                    </p>
                </div>
            </div>
        </div>
    );
}
