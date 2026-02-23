import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Clock3,
  IndianRupee,
  Megaphone,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Contact {
  id: number;
  status: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPath?: string;
  createdAt?: string;
  lastContact?: string;
  leadScore?: number;
}

interface SpendEntry {
  id: number;
  spendDate: string;
  channel: string;
  utmCampaign: string;
  center: string;
  asset?: string | null;
  amount: number;
}

interface CampaignAnalyticsProps {
  contacts: Contact[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  color: string;
}

const ANALYTICS_NOW = Date.now();

function StatCard({ title, value, subtext, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-gray-700" />
        </div>
        <span className="text-xs text-gray-400">All time</span>
      </div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{subtext}</p>
    </div>
  );
}

function parseTimestamp(value?: string): number | null {
  if (!value) return null;
  const ts = Date.parse(value);
  return Number.isNaN(ts) ? null : ts;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function normalizeToken(value?: string | null, fallback = "unknown") {
  const token = String(value || "")
    .trim()
    .toLowerCase();
  return token || fallback;
}

export default function CampaignAnalytics({ contacts }: CampaignAnalyticsProps) {
  const [spendEntries, setSpendEntries] = useState<SpendEntry[]>([]);

  useEffect(() => {
    let active = true;

    async function loadSpend() {
      try {
        const response = await fetch("/api/admin/spend");
        const payload = await response.json();
        if (!active || !response.ok) return;
        setSpendEntries((payload.spend || []) as SpendEntry[]);
      } catch {
        // non-blocking; analytics still works without spend rows
      }
    }

    loadSpend();
    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const totalLeads = contacts.length;
    const totalConversions = contacts.filter((c) => c.status?.toLowerCase() === "converted").length;
    const conversionRate = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0;

    const spendBySource = spendEntries.reduce((acc, row) => {
      const channel = normalizeToken(row.channel, "direct");
      acc[channel] = (acc[channel] || 0) + Number(row.amount || 0);
      return acc;
    }, {} as Record<string, number>);

    const spendByCampaign = spendEntries.reduce((acc, row) => {
      const campaign = normalizeToken(row.utmCampaign, "organic");
      acc[campaign] = (acc[campaign] || 0) + Number(row.amount || 0);
      return acc;
    }, {} as Record<string, number>);

    const totalSpend = spendEntries.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const cpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
    const cpp = totalConversions > 0 ? totalSpend / totalConversions : 0;

    const bySource = contacts.reduce((acc, contact) => {
      const source = normalizeToken(contact.utmSource, "direct");
      if (!acc[source]) {
        acc[source] = { leads: 0, conversions: 0 };
      }
      acc[source].leads += 1;
      if (contact.status?.toLowerCase() === "converted") {
        acc[source].conversions += 1;
      }
      return acc;
    }, {} as Record<string, { leads: number; conversions: number }>);

    const byCampaign = contacts.reduce((acc, contact) => {
      if (!contact.utmCampaign) return acc;
      const campaign = normalizeToken(contact.utmCampaign, "organic");
      if (!acc[campaign]) {
        acc[campaign] = { leads: 0, conversions: 0, source: normalizeToken(contact.utmSource, "direct") };
      }
      acc[campaign].leads += 1;
      if (contact.status?.toLowerCase() === "converted") {
        acc[campaign].conversions += 1;
      }
      return acc;
    }, {} as Record<string, { leads: number; conversions: number; source: string }>);

    const byLandingPage = contacts.reduce((acc, contact) => {
      const path = contact.landingPath || "/";
      if (!acc[path]) {
        acc[path] = { leads: 0, conversions: 0 };
      }
      acc[path].leads += 1;
      if (contact.status?.toLowerCase() === "converted") {
        acc[path].conversions += 1;
      }
      return acc;
    }, {} as Record<string, { leads: number; conversions: number }>);

    const pendingStatuses = new Set(["new", "contacted", "qualified"]);

    const staleLeads = contacts.filter((contact) => {
      const status = contact.status?.toLowerCase();
      if (!pendingStatuses.has(status)) return false;
      const anchorTime = parseTimestamp(contact.lastContact) || parseTimestamp(contact.createdAt);
      if (!anchorTime) return false;
      const ageHours = (ANALYTICS_NOW - anchorTime) / (1000 * 60 * 60);
      return ageHours >= 24;
    });

    const unattributedLeads = contacts.filter((contact) => !contact.utmSource && !contact.utmCampaign).length;
    const highIntentLeads = contacts.filter((contact) => (contact.leadScore || 0) >= 70).length;

    const actionItems = [] as Array<{ title: string; description: string; priority: "high" | "medium" | "low" }>;

    if (staleLeads.length > 0) {
      actionItems.push({
        title: `${staleLeads.length} leads need follow-up`,
        description: "Call or WhatsApp pending leads older than 24 hours to reduce drop-offs in the consult funnel.",
        priority: "high",
      });
    }

    if (unattributedLeads > 0) {
      actionItems.push({
        title: `${unattributedLeads} leads have missing attribution`,
        description: "Ensure all campaigns use UTM-tagged links so source-wise ROI and budget decisions are reliable.",
        priority: "medium",
      });
    }

    if (highIntentLeads > 0) {
      actionItems.push({
        title: `${highIntentLeads} leads are high-intent`,
        description: "Prioritize these leads for same-day callbacks and specialist booking assistance.",
        priority: "medium",
      });
    }

    if (actionItems.length === 0) {
      actionItems.push({
        title: "Funnel hygiene looks healthy",
        description: "No urgent bottlenecks detected. Continue weekly campaign and landing page review cadence.",
        priority: "low",
      });
    }

    return {
      totalLeads,
      totalConversions,
      conversionRate,
      totalSpend,
      cpl,
      cpp,
      staleLeadCount: staleLeads.length,
      unattributedLeads,
      actionItems,
      bySource: Object.entries(bySource)
        .map(([name, data]) => {
          const spend = spendBySource[normalizeToken(name, "direct")] || 0;
          return {
            name,
            ...data,
            spend,
            cpl: data.leads > 0 ? spend / data.leads : 0,
            cpp: data.conversions > 0 ? spend / data.conversions : 0,
            rate: data.leads > 0 ? (data.conversions / data.leads) * 100 : 0,
          };
        })
        .sort((a, b) => b.leads - a.leads),
      byCampaign: Object.entries(byCampaign)
        .map(([name, data]) => {
          const spend = spendByCampaign[normalizeToken(name, "organic")] || 0;
          return {
            name,
            ...data,
            spend,
            cpl: data.leads > 0 ? spend / data.leads : 0,
            cpp: data.conversions > 0 ? spend / data.conversions : 0,
            rate: data.leads > 0 ? (data.conversions / data.leads) * 100 : 0,
          };
        })
        .sort((a, b) => b.leads - a.leads),
      byLandingPage: Object.entries(byLandingPage)
        .map(([name, data]) => ({
          name,
          ...data,
          rate: data.leads > 0 ? (data.conversions / data.leads) * 100 : 0,
        }))
        .sort((a, b) => b.leads - a.leads)
        .slice(0, 8),
    };
  }, [contacts, spendEntries]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <StatCard title="Total Leads" value={metrics.totalLeads} subtext="Across all channels" icon={Users} color="bg-blue-50" />
        <StatCard title="Total Conversions" value={metrics.totalConversions} subtext="Status = converted" icon={Target} color="bg-green-50" />
        <StatCard title="Conversion Rate" value={`${metrics.conversionRate.toFixed(1)}%`} subtext="Leads to patients" icon={TrendingUp} color="bg-purple-50" />
        <StatCard title="Pending Follow-up" value={metrics.staleLeadCount} subtext="Older than 24h" icon={Clock3} color="bg-amber-50" />
        <StatCard title="Total Spend" value={formatCurrency(metrics.totalSpend)} subtext="Logged in Spend tab" icon={IndianRupee} color="bg-teal-50" />
        <StatCard title="Cost / Patient" value={formatCurrency(metrics.cpp)} subtext="Spend / converted" icon={IndianRupee} color="bg-rose-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
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
                  <th className="px-6 py-3 text-right">Spend</th>
                  <th className="px-6 py-3 text-right">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {metrics.bySource.map((source) => (
                  <tr key={source.name} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">{source.name}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{source.leads}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{source.conversions}</td>
                    <td className="px-6 py-4 text-right text-gray-700">{formatCurrency(source.spend)}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-700">{source.rate.toFixed(1)}%</td>
                  </tr>
                ))}
                {metrics.bySource.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No data available yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
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
                  <th className="px-6 py-3 text-right">Spend</th>
                  <th className="px-6 py-3 text-right">CPL</th>
                  <th className="px-6 py-3 text-right">CPP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {metrics.byCampaign.map((campaign) => (
                  <tr key={campaign.name} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">{campaign.name}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs uppercase">{campaign.source}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{campaign.leads}</td>
                    <td className="px-6 py-4 text-right text-gray-700">{formatCurrency(campaign.spend)}</td>
                    <td className="px-6 py-4 text-right text-gray-700">{campaign.spend > 0 ? formatCurrency(campaign.cpl) : "-"}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-700">
                      {campaign.spend > 0 && campaign.conversions > 0 ? formatCurrency(campaign.cpp) : "-"}
                    </td>
                  </tr>
                ))}
                {metrics.byCampaign.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No campaigns tracked yet. Use UTMs.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-gray-500" />
              Landing Page ROI Signals
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Landing Path</th>
                  <th className="px-6 py-3 text-right">Leads</th>
                  <th className="px-6 py-3 text-right">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {metrics.byLandingPage.map((page) => (
                  <tr key={page.name} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">{page.name}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{page.leads}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-700">{page.rate.toFixed(1)}%</td>
                  </tr>
                ))}
                {metrics.byLandingPage.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      No landing page attribution data yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Actionable Next Steps
          </h3>
          <div className="mt-4 space-y-3">
            {metrics.actionItems.map((item, idx) => (
              <div
                key={`${item.title}-${idx}`}
                className={`rounded-lg p-4 border ${
                  item.priority === "high"
                    ? "bg-rose-50 border-rose-100"
                    : item.priority === "medium"
                      ? "bg-amber-50 border-amber-100"
                      : "bg-emerald-50 border-emerald-100"
                }`}
              >
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-700 mt-1">{item.description}</p>
              </div>
            ))}
            <p className="text-xs text-gray-500">
              Attribution gap: <strong>{metrics.unattributedLeads}</strong> lead(s) without campaign source.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-lg">
        <strong>ROI guidance:</strong> Financial ROI is now powered by Spend entries. Keep `utm_campaign` names identical across ad links and spend logs.
      </div>
    </div>
  );
}
