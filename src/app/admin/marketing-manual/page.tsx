import Link from 'next/link';
import { ArrowLeft, BookOpen, BarChart2, MousePointer, ExternalLink, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function MarketingManualPage() {
    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                            <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                                Training Resource
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Marketing Manager's Manual & SLA</h1>
                        <p className="text-gray-500 mt-1">
                            Your guide to using `santaan-web` as a high-performance engine for lead generation.
                        </p>
                    </div>
                </div>

                {/* Content Cards */}
                <div className="grid gap-6">

                    {/* Section 1: Analytics */}
                    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                            <div className="p-2 bg-blue-100/50 rounded-lg">
                                <BarChart2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">1. Tracking Success (Analytics)</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-gray-600">
                                We have instrumented the website to track specific user actions. You can view these in your Google Analytics dashboard under <strong>Reports {'>'} Engagement {'>'} Events</strong>.
                            </p>

                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3">Event Name</th>
                                            <th className="px-4 py-3">Category</th>
                                            <th className="px-4 py-3">Label Example</th>
                                            <th className="px-4 py-3">What it Means</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-mono text-xs text-blue-600">click</td>
                                            <td className="px-4 py-3">engagement</td>
                                            <td className="px-4 py-3 text-gray-500">header_cta_book_consultation</td>
                                            <td className="px-4 py-3 font-medium text-green-700">High Intent: User clicked "Book Consultation"</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-mono text-xs text-blue-600">click</td>
                                            <td className="px-4 py-3">conversion</td>
                                            <td className="px-4 py-3 text-gray-500">assessment_result_book_consultation</td>
                                            <td className="px-4 py-3 font-medium text-green-700">Very High Intent: Completed assessment & booked</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-mono text-xs text-blue-600">click</td>
                                            <td className="px-4 py-3">contact</td>
                                            <td className="px-4 py-3 text-gray-500">header_phone_Bhubaneswar...</td>
                                            <td className="px-4 py-3">User clicked a phone number to call</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-mono text-xs text-blue-600">sign_up</td>
                                            <td className="px-4 py-3">engagement</td>
                                            <td className="px-4 py-3 text-gray-500">newsletter_subscription</td>
                                            <td className="px-4 py-3">User subscribed to newsletter</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-lg flex gap-3 items-start">
                                <MousePointer className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    <strong>Optimization Tip:</strong> High Intent leads come from the Assessment and Header CTA. Prioritize optimizing pages that lead to these clicks. Mobile users favor the "Phone Click".
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Attribution */}
                    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                            <div className="p-2 bg-purple-100/50 rounded-lg">
                                <ExternalLink className="w-5 h-5 text-purple-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">2. Campaign Tracking (UTM Strategy)</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-gray-600">
                                To know <em>where</em> your traffic is coming from, you <strong>must</strong> use UTM parameters on all external links. The website automatically captures these and attaches them to leads.
                            </p>

                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs break-all">
                                https://santaan.in/?utm_source=instagram&utm_medium=bio&utm_campaign=brand_awareness
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <h4 className="font-semibold text-sm mb-2">Facebook Ad Example</h4>
                                    <div className="text-xs text-gray-500 break-all">
                                        .../ivf-treatment?utm_source=facebook&utm_medium=cpc&utm_campaign=ivf_promo_q1
                                    </div>
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <h4 className="font-semibold text-sm mb-2">Email Blast Example</h4>
                                    <div className="text-xs text-gray-500 break-all">
                                        .../blog/myth-busting?utm_source=newsletter&utm_medium=email&utm_campaign=january_wellness
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: SLA */}
                    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                            <div className="p-2 bg-emerald-100/50 rounded-lg">
                                <Shield className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">3. Service Level Agreement (SLA)</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold mb-3 text-gray-900">Infrastructure</h3>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            Platform: Netlify Global Edge
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            Uptime: 99.99%
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-3 text-gray-900">Support Turnaround</h3>
                                    <ul className="space-y-3">
                                        <li className="flex justify-between text-sm py-1 border-b border-gray-100">
                                            <span className="text-red-600 font-medium">Critical Bug</span>
                                            <span className="font-bold">{'<'} 4 Hours</span>
                                        </li>
                                        <li className="flex justify-between text-sm py-1 border-b border-gray-100">
                                            <span className="text-gray-700">Content Update</span>
                                            <span className="font-bold">24 Hours</span>
                                        </li>
                                        <li className="flex justify-between text-sm py-1 border-b border-gray-100">
                                            <span className="text-gray-700">New Feature</span>
                                            <span className="font-bold">3-5 Days</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
