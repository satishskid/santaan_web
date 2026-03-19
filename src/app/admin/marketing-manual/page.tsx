import Link from 'next/link';
import { ArrowLeft, BarChart2, MousePointer, ExternalLink, Shield, Clock3, Link2, Megaphone } from 'lucide-react';

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
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Marketing Manager&apos;s Manual & SLA</h1>
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
                                            <td className="px-4 py-3 font-medium text-green-700">High Intent: User clicked &quot;Book Consultation&quot;</td>
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
                                    <strong>Optimization Tip:</strong> High Intent leads come from the Assessment and Header CTA. Prioritize optimizing pages that lead to these clicks. Mobile users favor the &quot;Phone Click&quot;.
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
                                https://santaan.in/landing-page?utm_source=meta&utm_medium=paid_social&utm_campaign=ivf_bhubaneswar_q2&utm_content=reel_a&utm_term=female_fertility&center=bhubaneswar&asset=tv_qr_001
                            </div>

                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                                <strong>Mandatory for every ad link and QR code:</strong> <code className="font-mono">utm_source</code>, <code className="font-mono">utm_medium</code>, <code className="font-mono">utm_campaign</code>, <code className="font-mono">center</code>, <code className="font-mono">asset</code>.
                                Missing fields are auto-filled as <code className="font-mono">direct / website / always_on</code> and reported as unattributed quality.
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <h4 className="font-semibold text-sm mb-2">Facebook Ad Example</h4>
                                    <div className="text-xs text-gray-500 break-all">
                                        .../ivf-clinic-bhubaneswar?utm_source=facebook&utm_medium=cpc&utm_campaign=ivf_bhubaneswar_q2&utm_content=creative_3&utm_term=ivf_couples&center=bhubaneswar&asset=fb_adset3_creative3
                                    </div>
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <h4 className="font-semibold text-sm mb-2">TV/OOH QR Example</h4>
                                    <div className="text-xs text-gray-500 break-all">
                                        .../at-home-fertility-testing?utm_source=tv&utm_medium=qr&utm_campaign=brand_hope_feb&utm_content=tvc_20s&utm_term=prime_time&center=berhampur&asset=tv_qr_slide_04
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-gray-200 p-4">
                                <h4 className="font-semibold text-sm mb-2 text-gray-900">Naming Convention (Enforced)</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li><code className="font-mono">utm_campaign</code>: <code className="font-mono">service_city_month</code> (example: <code className="font-mono">ivf_bhubaneswar_march</code>)</li>
                                    <li><code className="font-mono">center</code>: <code className="font-mono">bhubaneswar | berhampur | bangalore</code></li>
                                    <li><code className="font-mono">asset</code>: exact creative id from media plan (example: <code className="font-mono">meta_reel_07</code>)</li>
                                </ul>
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

                    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <Clock3 className="w-5 h-5 text-slate-700" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">4. Daily Roles & Routine (My Day)</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
                                The only rule: no WhatsApp reports or spreadsheets. Every team member updates CRM and Ops Inputs, and CEO sees the truth in the dashboard.
                            </div>

                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3">Role</th>
                                            <th className="px-4 py-3">Time</th>
                                            <th className="px-4 py-3">Daily Task</th>
                                            <th className="px-4 py-3">Where in CRM</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-semibold text-gray-900">CEO / CRM Ops Admin</td>
                                            <td className="px-4 py-3 font-mono text-xs text-gray-700">09:30 AM</td>
                                            <td className="px-4 py-3 text-gray-700">Review CEO metrics, wiring health, and assign today&apos;s priorities</td>
                                            <td className="px-4 py-3 text-gray-600">CEO Command + Daily Command</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-semibold text-gray-900">CEO / CRM Ops Admin</td>
                                            <td className="px-4 py-3 font-mono text-xs text-gray-700">09:00 PM</td>
                                            <td className="px-4 py-3 text-gray-700">Close compliance, leaks, and daily action sheet</td>
                                            <td className="px-4 py-3 text-gray-600">CEO Command + Ops Workboard</td>
                                        </tr>

                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-semibold text-gray-900">Agency Ops / Marketing Manager / Performance Marketer</td>
                                            <td className="px-4 py-3 font-mono text-xs text-gray-700">11:00 AM</td>
                                            <td className="px-4 py-3 text-gray-700">Submit daily campaign spend and lead metrics</td>
                                            <td className="px-4 py-3 text-gray-600">Ops Inputs → Agency</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-semibold text-gray-900">Agency Ops / Marketing Manager / Performance Marketer</td>
                                            <td className="px-4 py-3 font-mono text-xs text-gray-700">03:00 PM</td>
                                            <td className="px-4 py-3 text-gray-700">Flag underperformers and add corrective note</td>
                                            <td className="px-4 py-3 text-gray-600">Ops Inputs → Agency (notes)</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-semibold text-gray-900">Agency Ops / Marketing Manager / Performance Marketer</td>
                                            <td className="px-4 py-3 font-mono text-xs text-gray-700">08:30 PM</td>
                                            <td className="px-4 py-3 text-gray-700">Log TV blocks with QR/IVR/keyword tracking</td>
                                            <td className="px-4 py-3 text-gray-600">Ops Inputs → TV Ads</td>
                                        </tr>

                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-semibold text-gray-900">IVR Manager / Telecaller Manager / Telecaller</td>
                                            <td className="px-4 py-3 font-mono text-xs text-gray-700">11:00 AM</td>
                                            <td className="px-4 py-3 text-gray-700">Sync cycle A: update hot leads, owner and follow-ups</td>
                                            <td className="px-4 py-3 text-gray-600">Contacts + Follow-ups tab</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-semibold text-gray-900">IVR Manager / Telecaller Manager / Telecaller</td>
                                            <td className="px-4 py-3 font-mono text-xs text-gray-700">03:00 PM</td>
                                            <td className="px-4 py-3 text-gray-700">Sync cycle B: reconcile callback queue and SLA breaches</td>
                                            <td className="px-4 py-3 text-gray-600">CEO Command → SLA breaches + Contacts</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-semibold text-gray-900">IVR Manager / Telecaller Manager / Telecaller</td>
                                            <td className="px-4 py-3 font-mono text-xs text-gray-700">07:00 PM</td>
                                            <td className="px-4 py-3 text-gray-700">Sync cycle C: publish daily reconciliation</td>
                                            <td className="px-4 py-3 text-gray-600">Daily Command + CEO Command</td>
                                        </tr>

                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-semibold text-gray-900">Counselor (Center)</td>
                                            <td className="px-4 py-3 font-mono text-xs text-gray-700">04:30 PM</td>
                                            <td className="px-4 py-3 text-gray-700">Update qualified follow-ups and closure outcomes</td>
                                            <td className="px-4 py-3 text-gray-600">Contacts + Follow-ups tab</td>
                                        </tr>

                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-semibold text-gray-900">Field Exec (Center)</td>
                                            <td className="px-4 py-3 font-mono text-xs text-gray-700">08:00 PM</td>
                                            <td className="px-4 py-3 text-gray-700">Log all field activities with tracking handles</td>
                                            <td className="px-4 py-3 text-gray-600">Ops Inputs → Field Team</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
                                Any time during the day: after every call/WhatsApp conversation, update the lead in CRM with <strong>Status</strong>, <strong>Owner</strong>, and <strong>Next Follow-up</strong>. This is what makes the CEO dashboard real-time and reliable.
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                            <div className="p-2 bg-indigo-100/60 rounded-lg">
                                <Link2 className="w-5 h-5 text-indigo-700" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">5. UTM Playbook (Meta / Google / YouTube / Organic)</h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
                                You do not need an agency to do this. A good content writer (AI aware) can publish organic posts and run basic ads, as long as they follow the tracking discipline below.
                            </div>

                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                                <strong>Mandatory fields for every link:</strong> <code className="font-mono">utm_source</code>, <code className="font-mono">utm_medium</code>, <code className="font-mono">utm_campaign</code>, <code className="font-mono">center</code>, <code className="font-mono">asset</code>. Optional but recommended: <code className="font-mono">utm_content</code>, <code className="font-mono">utm_term</code>.
                            </div>

                            <div className="rounded-lg border border-gray-200 p-4">
                                <h4 className="font-semibold text-sm mb-2 text-gray-900">Naming Convention (use this always)</h4>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li><code className="font-mono">utm_campaign</code>: <code className="font-mono">service_city_month</code> (example: <code className="font-mono">ivf_bhubaneswar_march</code>)</li>
                                    <li><code className="font-mono">center</code>: <code className="font-mono">bhubaneswar | berhampur | bangalore</code></li>
                                    <li><code className="font-mono">asset</code>: exact creative id (example: <code className="font-mono">meta_reel_07</code> or <code className="font-mono">yt_short_03</code>)</li>
                                    <li><code className="font-mono">utm_content</code>: hook format or audience set (example: <code className="font-mono">hook_cost_myth</code>)</li>
                                    <li><code className="font-mono">utm_term</code>: keyword or intent (example: <code className="font-mono">ivf_cost</code>)</li>
                                </ul>
                            </div>

                            <div className="rounded-lg border border-gray-200 p-4">
                                <h4 className="font-semibold text-sm mb-2 text-gray-900">Copy/Paste Link Template</h4>
                                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs break-all">
                                    https://santaan.in/landing-page?utm_source=meta&utm_medium=paid_social&utm_campaign=ivf_bhubaneswar_march&utm_content=reel_hook_01&utm_term=ivf&center=bhubaneswar&asset=meta_reel_07
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Replace landing path, utm values, center, and asset. Keep the same <code className="font-mono">utm_campaign</code> in Spend logs.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="rounded-lg border border-gray-200 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Megaphone className="w-4 h-4 text-gray-600" />
                                        <h4 className="font-semibold text-sm text-gray-900">Meta Ads (Facebook/Instagram)</h4>
                                    </div>
                                    <ol className="text-sm text-gray-700 space-y-1 list-decimal pl-5">
                                        <li>Go to Ads Manager → open the Ad.</li>
                                        <li>In the Ad, set the <strong>Website URL</strong> to your landing page.</li>
                                        <li>Find <strong>URL Parameters</strong> and paste: <code className="font-mono">utm_source=meta&utm_medium=paid_social&utm_campaign=...&utm_content=...&utm_term=...&center=...&asset=...</code></li>
                                        <li>Asset rule: use the creative id (for example, <code className="font-mono">meta_reel_07</code>).</li>
                                    </ol>
                                </div>

                                <div className="rounded-lg border border-gray-200 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Megaphone className="w-4 h-4 text-gray-600" />
                                        <h4 className="font-semibold text-sm text-gray-900">Google Ads (Search/Display/Performance Max)</h4>
                                    </div>
                                    <ol className="text-sm text-gray-700 space-y-1 list-decimal pl-5">
                                        <li>Go to Google Ads → Ads &amp; assets → open the Ad.</li>
                                        <li>Set the <strong>Final URL</strong> to your landing page.</li>
                                        <li>In <strong>Final URL suffix</strong> (recommended), paste: <code className="font-mono">utm_source=google&utm_medium=cpc&utm_campaign=...&utm_term=&#123;keyword&#125;&utm_content=&#123;creative&#125;&center=...&asset=...</code></li>
                                        <li>Asset rule: use ad id / creative id you track in your sheet (for example, <code className="font-mono">gads_search_12</code>).</li>
                                    </ol>
                                </div>
                            </div>

                            <div className="rounded-lg border border-gray-200 p-4">
                                <h4 className="font-semibold text-sm mb-2 text-gray-900">YouTube (via Google Ads)</h4>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li>Run YouTube campaigns inside Google Ads.</li>
                                    <li>Use the same approach as Google Ads: Final URL + Final URL suffix UTMs.</li>
                                    <li>Recommended: <code className="font-mono">utm_source=youtube</code>, <code className="font-mono">utm_medium=video</code>, and asset like <code className="font-mono">yt_short_03</code>.</li>
                                </ul>
                            </div>

                            <div className="rounded-lg border border-gray-200 p-4">
                                <h4 className="font-semibold text-sm mb-2 text-gray-900">Organic Posts (Instagram/Facebook/YouTube)</h4>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li>Every caption link or bio link should be a UTM link.</li>
                                    <li>Recommended: <code className="font-mono">utm_medium=organic_social</code> and keep <code className="font-mono">utm_source</code> as <code className="font-mono">instagram</code> / <code className="font-mono">facebook</code> / <code className="font-mono">youtube</code>.</li>
                                    <li>Asset rule: use the post id (example: <code className="font-mono">ig_reel_18</code>).</li>
                                </ul>
                            </div>

                            <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
                                CEO rule: any spend without UTMs must be paused. If agency/content is not following this, remove them.
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
