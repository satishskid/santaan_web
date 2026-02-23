"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleDot,
  Clock3,
  Crosshair,
  IndianRupee,
  Megaphone,
  MessageCircle,
  Phone,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

interface Contact {
  id: number;
  status: string;
  leadScore?: number;
  leadSource?: string;
  preferredChannel?: string;
  tags?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPath?: string;
  createdAt?: string;
  lastContact?: string;
}

interface SpendEntry {
  id: number;
  spendDate: string;
  channel: string;
  utmCampaign: string;
  center: string;
  amount: number;
}

interface CeoCommandCenterProps {
  contacts: Contact[];
}

interface KpiCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface WeekTarget {
  leadsTarget: number | null;
  leadsStretch: number | null;
  convertedTarget: number | null;
  conversionRateMin: number | null;
  attributionMin: number | null;
  pending24hMax: number | null;
}

const pendingStatuses = new Set(["new", "contacted", "qualified"]);
const statusOrder = ["new", "contacted", "qualified", "converted", "lost"];
const referenceTime = Date.now();
const centerTargetKey: Record<string, string> = {
  Bhubaneswar: "bhubaneswar",
  Berhampur: "berhampur",
  Bangalore: "bangalore",
};

function normalizeStatus(status?: string) {
  return String(status || "")
    .trim()
    .toLowerCase();
}

function normalizeToken(value?: string | null, fallback = "unknown") {
  const token = String(value || "")
    .trim()
    .toLowerCase();
  return token || fallback;
}

function parseTimestamp(value?: string): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "0.0%";
  return `${value.toFixed(1)}%`;
}

function formatNumber(value: number) {
  return Intl.NumberFormat("en-IN").format(Math.max(0, Math.round(value)));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function inferCenter(landingPath?: string, campaign?: string) {
  const path = `${landingPath || ""} ${campaign || ""}`.toLowerCase();
  if (path.includes("bhubaneswar")) return "Bhubaneswar";
  if (path.includes("berhampur")) return "Berhampur";
  if (path.includes("bangalore") || path.includes("bengaluru") || path.includes("aecs")) return "Bangalore";
  return "Not Tagged";
}

function normalizeCenter(value?: string | null) {
  const lower = normalizeToken(value, "network");
  if (lower.includes("bhubaneswar") || lower.includes("bbsr")) return "Bhubaneswar";
  if (lower.includes("berhampur") || lower.includes("brahmapur")) return "Berhampur";
  if (lower.includes("bangalore") || lower.includes("bengaluru") || lower.includes("aecs")) return "Bangalore";
  return "Network";
}

function parseNumber(value?: string): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function KpiCard({ title, value, subtitle, icon: Icon }: KpiCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
          <Icon className="w-4 h-4 text-gray-600" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

export default function CeoCommandCenter({ contacts }: CeoCommandCenterProps) {
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [spendEntries, setSpendEntries] = useState<SpendEntry[]>([]);
  const [opsSubmission, setOpsSubmission] = useState({
    loading: true,
    agencyToday: 0,
    fieldToday: 0,
    tvToday: 0,
  });

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const response = await fetch("/api/admin/settings");
        if (!response.ok) return;
        const payload = (await response.json()) as Record<string, string>;
        if (active && payload && typeof payload === "object") {
          setSettingsMap(payload);
        }
      } catch {
        // Non-blocking for CEO UI; metrics still render from contacts.
      } finally {
        if (active) setSettingsLoaded(true);
      }
    }

    loadSettings();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const today = new Date().toISOString().slice(0, 10);

    async function loadOpsSubmission() {
      try {
        const [agencyRes, fieldRes, tvRes] = await Promise.all([
          fetch(`/api/admin/agency-performance?from=${today}&to=${today}`),
          fetch(`/api/admin/field-activities?from=${today}&to=${today}`),
          fetch(`/api/admin/tv-ads?from=${today}&to=${today}`),
        ]);

        const [agencyPayload, fieldPayload, tvPayload] = await Promise.all([
          agencyRes.json(),
          fieldRes.json(),
          tvRes.json(),
        ]);

        if (!active) return;
        setOpsSubmission({
          loading: false,
          agencyToday: Array.isArray(agencyPayload?.rows) ? agencyPayload.rows.length : 0,
          fieldToday: Array.isArray(fieldPayload?.rows) ? fieldPayload.rows.length : 0,
          tvToday: Array.isArray(tvPayload?.rows) ? tvPayload.rows.length : 0,
        });
      } catch {
        if (!active) return;
        setOpsSubmission((prev) => ({ ...prev, loading: false }));
      }
    }

    loadOpsSubmission();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadSpend() {
      try {
        const response = await fetch("/api/admin/spend");
        const payload = await response.json();
        if (!active || !response.ok) return;
        setSpendEntries((payload.spend || []) as SpendEntry[]);
      } catch {
        // no-op; spend widgets degrade gracefully
      }
    }

    loadSpend();
    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const totalLeads = contacts.length;
    const convertedLeads = contacts.filter((contact) => normalizeStatus(contact.status) === "converted").length;
    const lostLeads = contacts.filter((contact) => normalizeStatus(contact.status) === "lost").length;
    const qualifiedLeads = contacts.filter((contact) => normalizeStatus(contact.status) === "qualified").length;
    const highIntentLeads = contacts.filter((contact) => (contact.leadScore || 0) >= 70).length;
    const totalLeadScore = contacts.reduce((sum, contact) => sum + (contact.leadScore || 0), 0);
    const avgLeadScore = totalLeads > 0 ? totalLeadScore / totalLeads : 0;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const lostRate = totalLeads > 0 ? (lostLeads / totalLeads) * 100 : 0;
    const totalSpend = spendEntries.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const cpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
    const cpp = convertedLeads > 0 ? totalSpend / convertedLeads : 0;

    const spendByChannel = spendEntries.reduce((acc, row) => {
      const channel = normalizeToken(row.channel, "direct");
      acc[channel] = (acc[channel] || 0) + Number(row.amount || 0);
      return acc;
    }, {} as Record<string, number>);
    const spendByCampaign = spendEntries.reduce((acc, row) => {
      const campaign = normalizeToken(row.utmCampaign, "organic");
      acc[campaign] = (acc[campaign] || 0) + Number(row.amount || 0);
      return acc;
    }, {} as Record<string, number>);
    const spendByCenter = spendEntries.reduce((acc, row) => {
      const center = normalizeCenter(row.center);
      acc[center] = (acc[center] || 0) + Number(row.amount || 0);
      return acc;
    }, {} as Record<string, number>);

    const callLeads = contacts.filter((contact) => {
      const source = `${contact.leadSource || ""} ${contact.utmSource || ""} ${contact.preferredChannel || ""} ${contact.tags || ""}`.toLowerCase();
      return source.includes("call") || source.includes("phone");
    }).length;
    const whatsappLeads = contacts.filter((contact) => {
      const source = `${contact.leadSource || ""} ${contact.utmSource || ""} ${contact.preferredChannel || ""} ${contact.tags || ""}`.toLowerCase();
      return source.includes("whatsapp");
    }).length;
    const hotLineSlaBreaches = contacts.filter((contact) => {
      const source = `${contact.leadSource || ""} ${contact.utmSource || ""} ${contact.preferredChannel || ""} ${contact.tags || ""}`.toLowerCase();
      const isCallOrWhatsApp = source.includes("call") || source.includes("phone") || source.includes("whatsapp");
      if (!isCallOrWhatsApp) return false;
      const normalizedStatus = normalizeStatus(contact.status);
      if (!pendingStatuses.has(normalizedStatus)) return false;
      const anchor = parseTimestamp(contact.lastContact) || parseTimestamp(contact.createdAt);
      if (!anchor) return false;
      const ageHours = (referenceTime - anchor) / (1000 * 60 * 60);
      return ageHours >= 2;
    }).length;

    const stalePendingLeads = contacts.filter((contact) => {
      const normalizedStatus = normalizeStatus(contact.status);
      if (!pendingStatuses.has(normalizedStatus)) return false;
      const activityAnchor = parseTimestamp(contact.lastContact) || parseTimestamp(contact.createdAt);
      if (!activityAnchor) return false;
      const ageHours = (referenceTime - activityAnchor) / (1000 * 60 * 60);
      return ageHours >= 24;
    }).length;

    const unattributedLeads = contacts.filter(
      (contact) => !contact.utmSource && !contact.utmCampaign && !contact.utmMedium
    ).length;
    const attributionCoverage = totalLeads > 0 ? ((totalLeads - unattributedLeads) / totalLeads) * 100 : 0;

    const funnel = statusOrder.map((status) => ({
      status,
      count: contacts.filter((contact) => normalizeStatus(contact.status) === status).length,
    }));

    const channelMap = new Map<
      string,
      { leads: number; converted: number; highIntent: number; scoreTotal: number; stale: number }
    >();
    const assetMap = new Map<
      string,
      {
        campaign: string;
        source: string;
        landingPath: string;
        leads: number;
        converted: number;
        highIntent: number;
      }
    >();
    const centerMap = new Map<string, { leads: number; converted: number; highIntent: number; stalePending: number; attributed: number }>();

    for (const contact of contacts) {
      const status = normalizeStatus(contact.status);
      const isConverted = status === "converted";
      const isHighIntent = (contact.leadScore || 0) >= 70;
      const isStale = (() => {
        if (!pendingStatuses.has(status)) return false;
        const anchor = parseTimestamp(contact.lastContact) || parseTimestamp(contact.createdAt);
        if (!anchor) return false;
        return (referenceTime - anchor) / (1000 * 60 * 60) >= 24;
      })();

      const channel = normalizeToken(
        contact.utmSource || contact.leadSource || contact.preferredChannel || "direct"
      );
      const channelAgg = channelMap.get(channel) || {
        leads: 0,
        converted: 0,
        highIntent: 0,
        scoreTotal: 0,
        stale: 0,
      };
      channelAgg.leads += 1;
      channelAgg.converted += isConverted ? 1 : 0;
      channelAgg.highIntent += isHighIntent ? 1 : 0;
      channelAgg.scoreTotal += contact.leadScore || 0;
      channelAgg.stale += isStale ? 1 : 0;
      channelMap.set(channel, channelAgg);

      const campaign = normalizeToken(contact.utmCampaign, "organic");
      const source = normalizeToken(contact.utmSource, "direct");
      const landingPath = String(contact.landingPath || "/").trim();
      const assetKey = `${campaign}|${landingPath}`;
      const assetAgg = assetMap.get(assetKey) || {
        campaign,
        source,
        landingPath,
        leads: 0,
        converted: 0,
        highIntent: 0,
      };
      assetAgg.leads += 1;
      assetAgg.converted += isConverted ? 1 : 0;
      assetAgg.highIntent += isHighIntent ? 1 : 0;
      assetMap.set(assetKey, assetAgg);

      const center = inferCenter(contact.landingPath, contact.utmCampaign);
      const centerAgg = centerMap.get(center) || { leads: 0, converted: 0, highIntent: 0, stalePending: 0, attributed: 0 };
      centerAgg.leads += 1;
      centerAgg.converted += isConverted ? 1 : 0;
      centerAgg.highIntent += isHighIntent ? 1 : 0;
      centerAgg.stalePending += isStale ? 1 : 0;
      centerAgg.attributed += contact.utmSource || contact.utmCampaign || contact.utmMedium ? 1 : 0;
      centerMap.set(center, centerAgg);
    }

    const channelPerformance = Array.from(channelMap.entries())
      .map(([channel, agg]) => {
        const spend = spendByChannel[channel] || 0;
        return {
          channel,
          ...agg,
          spend,
          cpl: agg.leads > 0 ? spend / agg.leads : 0,
          cpp: agg.converted > 0 ? spend / agg.converted : 0,
          conversionRate: agg.leads > 0 ? (agg.converted / agg.leads) * 100 : 0,
          highIntentRate: agg.leads > 0 ? (agg.highIntent / agg.leads) * 100 : 0,
          avgScore: agg.leads > 0 ? agg.scoreTotal / agg.leads : 0,
        };
      })
      .sort((a, b) => b.converted - a.converted || b.leads - a.leads);

    const topChannel = channelPerformance[0];
    const weakChannels = channelPerformance.filter((item) => item.leads >= 5 && item.conversionRate < 8);

    const campaignLeadTotals = Array.from(assetMap.values()).reduce((acc, asset) => {
      acc[asset.campaign] = (acc[asset.campaign] || 0) + asset.leads;
      return acc;
    }, {} as Record<string, number>);

    const assetPerformance = Array.from(assetMap.values())
      .map((asset) => {
        const campaignSpend = spendByCampaign[asset.campaign] || 0;
        const campaignLeads = campaignLeadTotals[asset.campaign] || 0;
        const allocatedSpend = campaignLeads > 0 ? (campaignSpend * asset.leads) / campaignLeads : 0;
        return {
          ...asset,
          spend: allocatedSpend,
          cpl: asset.leads > 0 ? allocatedSpend / asset.leads : 0,
          cpp: asset.converted > 0 ? allocatedSpend / asset.converted : 0,
          conversionRate: asset.leads > 0 ? (asset.converted / asset.leads) * 100 : 0,
          roiScore: asset.converted * 3 + asset.highIntent,
        };
      })
      .sort((a, b) => b.roiScore - a.roiScore || b.leads - a.leads)
      .slice(0, 12);

    const centerPerformance = Array.from(centerMap.entries())
      .map(([center, agg]) => {
        const spend = spendByCenter[center] || 0;
        return {
          center,
          ...agg,
          spend,
          cpp: agg.converted > 0 ? spend / agg.converted : 0,
          conversionRate: agg.leads > 0 ? (agg.converted / agg.leads) * 100 : 0,
          attributionCoverage: agg.leads > 0 ? (agg.attributed / agg.leads) * 100 : 0,
        };
      })
      .sort((a, b) => b.leads - a.leads);

    const actionItems: Array<{
      priority: "High" | "Medium" | "Low";
      owner: string;
      title: string;
      why: string;
      action: string;
    }> = [];

    if (stalePendingLeads > 0) {
      actionItems.push({
        priority: "High",
        owner: "CRM Team",
        title: `Follow up ${stalePendingLeads} pending leads within 6 hours`,
        why: "Leads waiting >24 hours show the highest drop-off in fertility consult funnels.",
        action: "Assign callback owner, push WhatsApp nudge, and log outcome in CRM.",
      });
    }

    if (hotLineSlaBreaches > 0) {
      actionItems.push({
        priority: "High",
        owner: "Call Center Lead",
        title: `${hotLineSlaBreaches} call/WhatsApp leads crossed 2-hour SLA`,
        why: "Speed-to-lead is the highest predictor of consultation conversion for phone-first users.",
        action: "Run missed-call recovery and WhatsApp callback workflow before end of day.",
      });
    }

    if (attributionCoverage < 85) {
      actionItems.push({
        priority: "High",
        owner: "Marketing Manager",
        title: "Fix attribution coverage for paid and social assets",
        why: `${formatPercent(attributionCoverage)} coverage is below the 85% visibility baseline.`,
        action: "Enforce UTM templates on all TV/social/hoarding QR and paid links this week.",
      });
    }

    if (totalSpend > 0 && convertedLeads === 0) {
      actionItems.push({
        priority: "High",
        owner: "Growth Team",
        title: "Spend detected with zero conversions",
        why: `${formatCurrency(totalSpend)} logged spend has not produced converted leads yet.`,
        action: "Pause weak campaigns, verify lead quality and counselling closure before further spend.",
      });
    }

    if (qualifiedLeads > 0 && conversionRate < 12) {
      actionItems.push({
        priority: "Medium",
        owner: "Counselling Lead",
        title: "Improve qualified-to-converted closure",
        why: `${qualifiedLeads} leads are qualified but overall conversion is ${formatPercent(conversionRate)}.`,
        action: "Run a script review with top counsellors and offer same-day specialist slots.",
      });
    }

    if (weakChannels.length > 0) {
      actionItems.push({
        priority: "Medium",
        owner: "Growth Team",
        title: `Repair low-yield channel: ${weakChannels[0].channel}`,
        why: "Channel has volume but weak conversion efficiency.",
        action: "Refresh creative + landing message match and re-run for 7 days.",
      });
    }

    if (topChannel) {
      actionItems.push({
        priority: "Low",
        owner: "Performance Team",
        title: `Scale winning channel: ${topChannel.channel}`,
        why: `Top performer with ${topChannel.converted} conversions from ${topChannel.leads} leads.`,
        action: "Increase budget by 10-15% and duplicate best offer/creative format.",
      });
    }

    if (lostRate > conversionRate) {
      actionItems.push({
        priority: "High",
        owner: "Clinic Operations",
        title: "Launch lost-lead winback workflow",
        why: `Lost rate ${formatPercent(lostRate)} is higher than conversion rate ${formatPercent(conversionRate)}.`,
        action: "Run a 30-day winback campaign with call + WhatsApp + outcome tracking.",
      });
    }

    if (actionItems.length === 0) {
      actionItems.push({
        priority: "Low",
        owner: "Leadership",
        title: "Pipeline health stable this week",
        why: "No immediate bottleneck detected in acquisition-to-conversion path.",
        action: "Continue weekly cohort review and keep UTM discipline strict.",
      });
    }

    return {
      totalLeads,
      convertedLeads,
      conversionRate,
      lostRate,
      highIntentLeads,
      callLeads,
      whatsappLeads,
      hotLineSlaBreaches,
      avgLeadScore,
      stalePendingLeads,
      attributionCoverage,
      totalSpend,
      cpl,
      cpp,
      funnel,
      channelPerformance,
      assetPerformance,
      centerPerformance,
      actionItems: actionItems.slice(0, 6),
    };
  }, [contacts, spendEntries]);

  const hasWeekTargets = useMemo(
    () => Object.keys(settingsMap).some((key) => key.startsWith("ceo_week1_")),
    [settingsMap]
  );

  const weekWindow = useMemo(() => {
    const start = settingsMap.ceo_week1_window_start;
    const end = settingsMap.ceo_week1_window_end;
    if (!start || !end) return null;
    return `${start} to ${end}`;
  }, [settingsMap.ceo_week1_window_end, settingsMap.ceo_week1_window_start]);

  const weekTargets = useMemo(() => {
    const result: Record<string, WeekTarget> = {};
    for (const center of ["Bhubaneswar", "Berhampur", "Bangalore"]) {
      const key = centerTargetKey[center];
      result[center] = {
        leadsTarget: parseNumber(settingsMap[`ceo_week1_${key}_target_leads`]),
        leadsStretch: parseNumber(settingsMap[`ceo_week1_${key}_target_leads_stretch`]),
        convertedTarget: parseNumber(settingsMap[`ceo_week1_${key}_target_converted_leads`]),
        conversionRateMin: parseNumber(settingsMap[`ceo_week1_${key}_target_conversion_rate_pct_min`]),
        attributionMin: parseNumber(settingsMap[`ceo_week1_${key}_target_attribution_pct_min`]),
        pending24hMax: parseNumber(settingsMap[`ceo_week1_${key}_target_pending_gt24h_max`]),
      };
    }
    return result;
  }, [settingsMap]);

  const weekTargetRows = useMemo(() => {
    const map = new Map(metrics.centerPerformance.map((row) => [row.center, row]));
    return ["Bhubaneswar", "Berhampur", "Bangalore"].map((center) => {
      const actual = map.get(center) || {
        center,
        leads: 0,
        converted: 0,
        highIntent: 0,
        stalePending: 0,
        attributed: 0,
        conversionRate: 0,
        attributionCoverage: 0,
      };
      const target = weekTargets[center];

      const checks: boolean[] = [];
      if (target.leadsTarget !== null) checks.push(actual.leads >= target.leadsTarget);
      if (target.convertedTarget !== null) checks.push(actual.converted >= target.convertedTarget);
      if (target.conversionRateMin !== null) checks.push(actual.conversionRate >= target.conversionRateMin);
      if (target.attributionMin !== null) checks.push(actual.attributionCoverage >= target.attributionMin);
      if (target.pending24hMax !== null) checks.push(actual.stalePending <= target.pending24hMax);

      const onTrack = checks.length > 0 ? checks.every(Boolean) : null;
      return { center, actual, target, onTrack };
    });
  }, [metrics.centerPerformance, weekTargets]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 border border-slate-700">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-300">Executive View</p>
            <h2 className="text-2xl font-semibold mt-1">CEO Command Center</h2>
            <p className="text-sm text-slate-200 mt-2">
              One screen for acquisition quality, conversion health, center-level demand, and next actions.
            </p>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/20 p-4 min-w-56">
            <p className="text-xs text-slate-300">North Star</p>
            <p className="text-2xl font-bold mt-1">{formatPercent(metrics.conversionRate)}</p>
            <p className="text-xs mt-1 text-slate-200">
              Lead to patient conversion from {formatNumber(metrics.totalLeads)} tracked leads
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <KpiCard
          title="Total Leads"
          value={formatNumber(metrics.totalLeads)}
          subtitle="All tracked inquiries"
          icon={Users}
        />
        <KpiCard
          title="Converted Patients"
          value={formatNumber(metrics.convertedLeads)}
          subtitle={formatPercent(metrics.conversionRate)}
          icon={CheckCircle2}
        />
        <KpiCard
          title="High-Intent Leads"
          value={formatNumber(metrics.highIntentLeads)}
          subtitle="Lead score >= 70"
          icon={Target}
        />
        <KpiCard
          title="Avg Lead Score"
          value={metrics.avgLeadScore.toFixed(1)}
          subtitle="Across all inquiries"
          icon={TrendingUp}
        />
        <KpiCard
          title="Pending >24h"
          value={formatNumber(metrics.stalePendingLeads)}
          subtitle="Needs same-day follow-up"
          icon={Clock3}
        />
        <KpiCard
          title="Attribution Coverage"
          value={formatPercent(metrics.attributionCoverage)}
          subtitle="UTM/source visibility"
          icon={Crosshair}
        />
        <KpiCard
          title="Phone Leads"
          value={formatNumber(metrics.callLeads)}
          subtitle="Inbound and CTA call intent"
          icon={Phone}
        />
        <KpiCard
          title="WhatsApp Leads"
          value={formatNumber(metrics.whatsappLeads)}
          subtitle="Inbound chat demand"
          icon={MessageCircle}
        />
        <KpiCard
          title="2h SLA Breaches"
          value={formatNumber(metrics.hotLineSlaBreaches)}
          subtitle="Call/WhatsApp pending > 2 hours"
          icon={AlertTriangle}
        />
        <KpiCard
          title="Logged Spend"
          value={formatCurrency(metrics.totalSpend)}
          subtitle="From Spend tab"
          icon={IndianRupee}
        />
        <KpiCard
          title="Cost Per Lead"
          value={formatCurrency(metrics.cpl)}
          subtitle="Spend / leads"
          icon={IndianRupee}
        />
        <KpiCard
          title="Cost Per Patient"
          value={formatCurrency(metrics.cpp)}
          subtitle="Spend / converted"
          icon={IndianRupee}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900">Protocol Compliance (Today)</h3>
        <p className="text-xs text-gray-500 mt-1">
          Confirms whether agency, field team, and TV operations have submitted mandatory daily inputs.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Agency rows today</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">
              {opsSubmission.loading ? "..." : formatNumber(opsSubmission.agencyToday)}
            </p>
            <p className={`text-xs mt-1 ${opsSubmission.loading ? "text-gray-500" : opsSubmission.agencyToday > 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {opsSubmission.loading ? "Checking..." : opsSubmission.agencyToday > 0 ? "Submitted" : "Missing"}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Field rows today</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">
              {opsSubmission.loading ? "..." : formatNumber(opsSubmission.fieldToday)}
            </p>
            <p className={`text-xs mt-1 ${opsSubmission.loading ? "text-gray-500" : opsSubmission.fieldToday > 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {opsSubmission.loading ? "Checking..." : opsSubmission.fieldToday > 0 ? "Submitted" : "Missing"}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">TV rows today</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">
              {opsSubmission.loading ? "..." : formatNumber(opsSubmission.tvToday)}
            </p>
            <p className={`text-xs mt-1 ${opsSubmission.loading ? "text-gray-500" : opsSubmission.tvToday > 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {opsSubmission.loading ? "Checking..." : opsSubmission.tvToday > 0 ? "Submitted" : "Missing"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            Week-1 Center Target vs Actual
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {weekWindow ? `Window: ${weekWindow}` : "Week window not configured in settings."}
          </p>
        </div>

        {!hasWeekTargets && settingsLoaded ? (
          <div className="px-5 py-6 text-sm text-amber-700 bg-amber-50 border-t border-amber-100">
            No `ceo_week1_*` targets found in settings. Seed week targets to enable center target tracking.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Center</th>
                  <th className="px-4 py-3 text-right font-medium">Leads</th>
                  <th className="px-4 py-3 text-right font-medium">Converted</th>
                  <th className="px-4 py-3 text-right font-medium">Conv. Rate</th>
                  <th className="px-4 py-3 text-right font-medium">Attribution</th>
                  <th className="px-4 py-3 text-right font-medium">Pending &gt;24h</th>
                  <th className="px-4 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {weekTargetRows.map((row) => (
                  <tr key={row.center}>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.center}</td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {row.actual.leads}
                      {row.target.leadsTarget !== null ? ` / ${row.target.leadsTarget}` : ""}
                      {row.target.leadsStretch !== null ? ` (S:${row.target.leadsStretch})` : ""}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {row.actual.converted}
                      {row.target.convertedTarget !== null ? ` / ${row.target.convertedTarget}` : ""}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {formatPercent(row.actual.conversionRate)}
                      {row.target.conversionRateMin !== null ? ` / >=${row.target.conversionRateMin}%` : ""}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {formatPercent(row.actual.attributionCoverage)}
                      {row.target.attributionMin !== null ? ` / >=${row.target.attributionMin}%` : ""}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {row.actual.stalePending}
                      {row.target.pending24hMax !== null ? ` / <=${row.target.pending24hMax}` : ""}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`px-2 py-1 rounded-full text-xs border ${
                          row.onTrack === null
                            ? "bg-gray-100 text-gray-600 border-gray-200"
                            : row.onTrack
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {row.onTrack === null ? "No target" : row.onTrack ? "On track" : "Behind"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <CircleDot className="w-4 h-4 text-blue-600" />
            Funnel Snapshot
          </h3>
          <div className="mt-4 space-y-3">
            {metrics.funnel.map((step) => (
              <div key={step.status} className="flex items-center justify-between">
                <p className="text-sm capitalize text-gray-600">{step.status}</p>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-slate-700"
                      style={{
                        width:
                          metrics.totalLeads > 0
                            ? `${Math.min((step.count / metrics.totalLeads) * 100, 100)}%`
                            : "0%",
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 min-w-10 text-right">{step.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-3 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Weekly Action Queue
          </h3>
          <div className="mt-4 space-y-3">
            {metrics.actionItems.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className={`rounded-lg border p-4 ${
                  item.priority === "High"
                    ? "border-rose-200 bg-rose-50"
                    : item.priority === "Medium"
                      ? "border-amber-200 bg-amber-50"
                      : "border-emerald-200 bg-emerald-50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-600">
                    {item.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-700 mt-1">{item.why}</p>
                <p className="text-xs text-gray-700 mt-1">
                  <span className="font-semibold">Owner:</span> {item.owner}
                </p>
                <p className="text-xs text-gray-800 mt-1 flex items-start gap-2">
                  <ArrowRight className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  {item.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-purple-600" />
              Channel ROI
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Channel</th>
                  <th className="px-4 py-3 text-right font-medium">Leads</th>
                  <th className="px-4 py-3 text-right font-medium">Conv.</th>
                  <th className="px-4 py-3 text-right font-medium">Spend</th>
                  <th className="px-4 py-3 text-right font-medium">CPP</th>
                  <th className="px-4 py-3 text-right font-medium">Stale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {metrics.channelPerformance.map((row) => (
                  <tr key={row.channel}>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.channel}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{row.leads}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{row.converted}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(row.spend)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {row.converted > 0 && row.spend > 0 ? formatCurrency(row.cpp) : "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{row.stale}</td>
                  </tr>
                ))}
                {metrics.channelPerformance.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No attributed channel data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Center Performance
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Center</th>
                  <th className="px-4 py-3 text-right font-medium">Leads</th>
                  <th className="px-4 py-3 text-right font-medium">Conv.</th>
                  <th className="px-4 py-3 text-right font-medium">Rate</th>
                  <th className="px-4 py-3 text-right font-medium">Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {metrics.centerPerformance.map((row) => (
                  <tr key={row.center}>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.center}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{row.leads}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{row.converted}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatPercent(row.conversionRate)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(row.spend)}</td>
                  </tr>
                ))}
                {metrics.centerPerformance.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Center tags will appear once city pages are used in campaign links.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-base font-semibold text-gray-900">Asset ROI (Campaign + Landing Path)</h3>
          <p className="text-xs text-gray-500 mt-1">
            This shows which creative+page combinations drive qualified demand, conversions, and spend efficiency.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Campaign</th>
                <th className="px-4 py-3 text-left font-medium">Landing Path</th>
                <th className="px-4 py-3 text-left font-medium">Source</th>
                <th className="px-4 py-3 text-right font-medium">Leads</th>
                <th className="px-4 py-3 text-right font-medium">Conv.</th>
                <th className="px-4 py-3 text-right font-medium">Spend</th>
                <th className="px-4 py-3 text-right font-medium">CPP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {metrics.assetPerformance.map((asset) => (
                <tr key={`${asset.campaign}-${asset.landingPath}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{asset.campaign}</td>
                  <td className="px-4 py-3 text-gray-700">{asset.landingPath}</td>
                  <td className="px-4 py-3 text-gray-700">{asset.source}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{asset.leads}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{asset.converted}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(asset.spend)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {asset.converted > 0 && asset.spend > 0 ? formatCurrency(asset.cpp) : "-"}
                  </td>
                </tr>
              ))}
              {metrics.assetPerformance.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No campaign-level attribution data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
