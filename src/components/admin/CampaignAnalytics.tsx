import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Users, Target, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface Contact {
    id: number;
    status: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
}

interface CampaignAnalyticsProps {
    contacts: Contact[];
}

export default function CampaignAnalytics({ contacts }: CampaignAnalyticsProps) {
    const metrics = useMemo(() => {
        const totalLeads = contacts.length;
        const totalConversions = contacts.filter(c => c.status === 'converted').length;
        const conversionRate = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0;

        // Group by Source
        const bySource = contacts.reduce((acc, contact) => {
            const source = contact.utmSource || 'Direct / None';
            if (!acc[source]) {
                acc[source] = { leads: 0, conversions: 0 };
            }
            acc[source].leads++;
            if (contact.status === 'converted') {
                acc[source].conversions++;
            }
            return acc;
        }, {} as Record<string, { leads: number; conversions: number }>);

        // Group by Campaign
        const byCampaign = contacts.reduce((acc, contact) => {
            if (!contact.utmCampaign) return acc; // Skip if no campaign
            const campaign = contact.utmCampaign;
            if (!acc[campaign]) {
                acc[campaign] = { leads: 0, conversions: 0, source: contact.utmSource || 'Unknown' };
            }
            acc[campaign].leads++;
            if (contact.status === 'converted') {
                acc[campaign].conversions++;
            }
            return acc;
        }, {} as Record<string, { leads: number; conversions: number; source: string }>);

        return {
            totalLeads,
            totalConversions,
            conversionRate,
            bySource: Object.entries(bySource)
                .map(([name, data]) => ({
                    name,
                    ...data,
                    rate: data.leads > 0 ? (data.conversions / data.leads) * 100 : 0
                }))
                .sort((a, b) => b.leads - a.leads),
            byCampaign: Object.entries(byCampaign)
                .map(([name, data]) => ({
                    name,
                    ...data,
                    rate: data.leads > 0 ? (data.conversions / data.leads) * 100 : 0
                }))
                .sort((a, b) => b.leads - a.leads)
        };
    }, [contacts]);

    const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="w-5 h-5 text-gray-700" />
                </div>
                {/* Placeholder for trend if we had historical data */}
                <span className="text-xs text-gray-400 flex items-center gap-1">
                    All time
                </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{subtext}</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Leads"
                    value={metrics.totalLeads}
                    subtext="Across all channels"
                    icon={Users}
                    color="bg-blue-50"
                />
                <StatCard
                    title="Total Conversions"
                    value={metrics.totalConversions}
                    subtext="Status = 'converted'"
                    icon={Target}
                    color="bg-green-50"
                />
                <StatCard
                    title="Conversion Rate"
                    value={`${metrics.conversionRate.toFixed(1)}%`}
                    subtext="Leads turning into patients"
                    icon={TrendingUp}
                    color="bg-purple-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Source Performance */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-gray-500" />
                            Channel Performance
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Source</th>
                                    <th className="px-6 py-3 text-right">Leads</th>
                                    <th className="px-6 py-3 text-right">Conv.</th>
                                    <th className="px-6 py-3 text-right">Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {metrics.bySource.map((source) => (
                                    <tr key={source.name} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{source.name}</td>
                                        <td className="px-6 py-4 text-right text-gray-600">{source.leads}</td>
                                        <td className="px-6 py-4 text-right text-gray-600">{source.conversions}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className={`font-medium ${source.rate >= metrics.conversionRate ? 'text-green-600' : 'text-gray-600'}`}>
                                                    {source.rate.toFixed(1)}%
                                                </span>
                                                {/* Visual bar for rate */}
                                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${source.rate >= metrics.conversionRate ? 'bg-green-500' : 'bg-gray-400'}`}
                                                        style={{ width: `${Math.min(source.rate, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {metrics.bySource.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            No data available yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Campaign Performance */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Target className="w-4 h-4 text-gray-500" />
                            Campaign Performance
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Campaign</th>
                                    <th className="px-6 py-3">Source</th>
                                    <th className="px-6 py-3 text-right">Leads</th>
                                    <th className="px-6 py-3 text-right">Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {metrics.byCampaign.map((campaign) => (
                                    <tr key={campaign.name} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{campaign.name}</td>
                                        <td className="px-6 py-4 text-gray-500 text-xs uppercase">{campaign.source}</td>
                                        <td className="px-6 py-4 text-right text-gray-600">{campaign.leads}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-medium ${campaign.rate >= metrics.conversionRate ? 'text-green-600' : 'text-gray-600'}`}>
                                                {campaign.rate.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {metrics.byCampaign.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            No campaigns tracked yet. Use UTMs!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-lg">
                <strong>Note on ROI:</strong> This dashboard tracks <em>Conversion ROI</em> (Leads → Patients). To track <em>Financial ROI</em>, compare the "Conversion Volume" here against your ad spend in the Facebook/Google Ads manager.
            </div>
        </div>
    );
}
