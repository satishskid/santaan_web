"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Lightbulb, Save, Sparkles, Trash2, TrendingUp, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import FieldWithHelp from "@/components/admin/FieldWithHelp";
import {
  CONTENT_ASSET_STATUS,
  CONTENT_ASSET_TYPES,
  CONTENT_AUDIENCES,
  CONTENT_CENTERS,
  CONTENT_FEEDBACK_PRIORITY,
  CONTENT_FEEDBACK_SOURCES,
  CONTENT_FEEDBACK_STATUS,
  CONTENT_FUNNEL_STAGES,
  CONTENT_RECOMMENDED_ACTIONS,
  themeLabel,
} from "@/lib/content-intelligence";

type ContentAssetType = (typeof CONTENT_ASSET_TYPES)[number];
type ContentAudience = (typeof CONTENT_AUDIENCES)[number];
type ContentCenter = (typeof CONTENT_CENTERS)[number];
type ContentFunnelStage = (typeof CONTENT_FUNNEL_STAGES)[number];
type ContentAssetStatus = (typeof CONTENT_ASSET_STATUS)[number];
type ContentFeedbackSource = (typeof CONTENT_FEEDBACK_SOURCES)[number];
type ContentFeedbackPriority = (typeof CONTENT_FEEDBACK_PRIORITY)[number];
type ContentFeedbackStatus = (typeof CONTENT_FEEDBACK_STATUS)[number];
type ContentRecommendedAction = (typeof CONTENT_RECOMMENDED_ACTIONS)[number];

interface ManualAssetRow {
  id: number;
  source: string;
  assetType: ContentAssetType;
  title: string;
  url?: string | null;
  center: ContentCenter;
  audience: ContentAudience;
  funnelStage: ContentFunnelStage;
  primaryKeyword?: string | null;
  secondaryKeywords?: string | null;
  tags?: string | null;
  sourcePlatform?: string | null;
  status: ContentAssetStatus;
  owner?: string | null;
  notes?: string | null;
  publishedAt?: string | null;
}

interface FeedbackRow {
  id: number;
  feedbackDate: string;
  source: ContentFeedbackSource;
  center: ContentCenter;
  topic: string;
  suggestedKeyword?: string | null;
  patientQuestion?: string | null;
  audience: ContentAudience;
  funnelStage: ContentFunnelStage;
  priority: ContentFeedbackPriority;
  occurrenceCount: number;
  recommendedAction: ContentRecommendedAction;
  owner?: string | null;
  status: ContentFeedbackStatus;
  notes?: string | null;
}

interface RecentAssetRow {
  id: number | string;
  source: string;
  assetType: string;
  title: string;
  url?: string | null;
  center: string;
  audience: string;
  funnelStage: string;
  primaryKeyword?: string | null;
  secondaryKeywords?: string | null;
  tags?: string | null;
  sourcePlatform?: string | null;
  status?: string | null;
  owner?: string | null;
  notes?: string | null;
  publishedAt?: string | null;
  thumbnail?: string | null;
}

interface ContentSummary {
  totalAssets: number;
  blogAssets: number;
  socialAssets: number;
  landingAssets: number;
  manualAssets: number;
  recentAssets: number;
  feedbackItems: number;
  openFeedback: number;
  opportunityGaps: number;
  refreshTargets: number;
}

interface OpportunityRow {
  key: string;
  label: string;
  count: number;
  coverageCount: number;
  status: "gap" | "refresh" | "covered";
  action: ContentRecommendedAction;
  sources: string[];
  centers: string[];
  audiences: string[];
  funnelStages: string[];
  questionExample?: string | null;
}

interface ReviewSignals {
  topThemes: Array<{ theme: string; count: number }>;
}

interface Ga4ContentSignals {
  configured: boolean;
  message?: string;
  topContentPages: Array<{ path: string; sessions: number; activeUsers: number }>;
}

interface ContentEngineSignals {
  configured: boolean;
  healthy: boolean;
  message?: string | null;
  bindings?: {
    vectorize?: boolean;
    draftsBucket?: boolean;
    assetsBucket?: boolean;
    mediaBucket?: boolean;
    aiGatewayReady?: boolean;
    tursoReady?: boolean;
  } | null;
  recommendations: Array<Record<string, unknown>>;
  recommendationMessage?: string | null;
}

interface ContentEngineRecommendation {
  theme?: string;
  signalCount?: number;
  status?: string;
  action?: string;
  coverageCount?: number;
  sources?: string[];
  example?: string | null;
  relatedAssets?: Array<{
    assetId?: string;
    title?: string;
    url?: string | null;
    type?: string | null;
    center?: string | null;
    primaryKeyword?: string | null;
    score?: number | null;
  }>;
}

interface DashboardPayload {
  summary: ContentSummary;
  opportunities: OpportunityRow[];
  feedback: FeedbackRow[];
  manualAssets: ManualAssetRow[];
  recentAssets: RecentAssetRow[];
  ga4Content: Ga4ContentSignals;
  reviewSignals: ReviewSignals;
  contentEngine: ContentEngineSignals;
}

interface AssetForm {
  id?: number;
  assetType: ContentAssetType;
  title: string;
  url: string;
  center: ContentCenter;
  audience: ContentAudience;
  funnelStage: ContentFunnelStage;
  primaryKeyword: string;
  secondaryKeywords: string;
  tags: string;
  sourcePlatform: string;
  status: ContentAssetStatus;
  owner: string;
  notes: string;
  publishedAt: string;
}

interface FeedbackForm {
  id?: number;
  feedbackDate: string;
  source: ContentFeedbackSource;
  center: ContentCenter;
  topic: string;
  suggestedKeyword: string;
  patientQuestion: string;
  audience: ContentAudience;
  funnelStage: ContentFunnelStage;
  priority: ContentFeedbackPriority;
  occurrenceCount: string;
  recommendedAction: ContentRecommendedAction;
  owner: string;
  status: ContentFeedbackStatus;
  notes: string;
}

const initialAssetForm: AssetForm = {
  assetType: "reel",
  title: "",
  url: "",
  center: "network",
  audience: "patient",
  funnelStage: "awareness",
  primaryKeyword: "",
  secondaryKeywords: "",
  tags: "",
  sourcePlatform: "instagram",
  status: "published",
  owner: "",
  notes: "",
  publishedAt: new Date().toISOString().slice(0, 10),
};

const initialFeedbackForm: FeedbackForm = {
  feedbackDate: new Date().toISOString().slice(0, 10),
  source: "telecaller",
  center: "network",
  topic: "",
  suggestedKeyword: "",
  patientQuestion: "",
  audience: "patient",
  funnelStage: "consideration",
  priority: "medium",
  occurrenceCount: "1",
  recommendedAction: "write_blog",
  owner: "",
  status: "open",
  notes: "",
};

function classForOpportunity(status: OpportunityRow["status"]) {
  if (status === "gap") return "border-rose-200 bg-rose-50 text-rose-800";
  if (status === "refresh") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

function labelForAction(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseCsvArray(raw?: string | null) {
  if (!raw) return [] as string[];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item || "")).filter(Boolean);
  } catch {
    // fall through
  }
  return raw.split(",").map((item) => item.trim()).filter(Boolean);
}

function parseContentEngineRecommendations(rows?: Array<Record<string, unknown>>) {
  return (rows || []).map((row) => {
    const record = row as Record<string, unknown>;
    return {
      theme: typeof record.theme === "string" ? record.theme : undefined,
      signalCount: typeof record.signalCount === "number" ? record.signalCount : undefined,
      status: typeof record.status === "string" ? record.status : undefined,
      action: typeof record.action === "string" ? record.action : undefined,
      coverageCount: typeof record.coverageCount === "number" ? record.coverageCount : undefined,
      sources: Array.isArray(record.sources) ? record.sources.map((item) => String(item)) : [],
      example: typeof record.example === "string" ? record.example : null,
      relatedAssets: Array.isArray(record.relatedAssets)
        ? record.relatedAssets.map((asset) => {
            const next = asset as Record<string, unknown>;
            return {
              assetId: typeof next.assetId === "string" ? next.assetId : undefined,
              title: typeof next.title === "string" ? next.title : undefined,
              url: typeof next.url === "string" ? next.url : null,
              type: typeof next.type === "string" ? next.type : null,
              center: typeof next.center === "string" ? next.center : null,
              primaryKeyword: typeof next.primaryKeyword === "string" ? next.primaryKeyword : null,
              score: typeof next.score === "number" ? next.score : null,
            };
          })
        : [],
    } satisfies ContentEngineRecommendation;
  });
}

export default function ContentIntelligenceManagement() {
  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [assetForm, setAssetForm] = useState<AssetForm>(initialAssetForm);
  const [feedbackForm, setFeedbackForm] = useState<FeedbackForm>(initialFeedbackForm);
  const [search, setSearch] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/content-intelligence");
      const nextPayload = await response.json();
      if (!response.ok) throw new Error(nextPayload?.error || "Failed to fetch content intelligence");
      setPayload(nextPayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch content intelligence");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const filteredAssets = useMemo(() => {
    const assets = payload?.recentAssets || [];
    const term = search.trim().toLowerCase();
    if (!term) return assets;
    return assets.filter((row) => [row.title, row.primaryKeyword, row.tags, row.sourcePlatform, row.center, row.assetType]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term)));
  }, [payload, search]);

  const filteredFeedback = useMemo(() => {
    const rows = payload?.feedback || [];
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => [row.topic, row.suggestedKeyword, row.patientQuestion, row.source, row.center, row.notes]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term)));
  }, [payload, search]);

  async function saveAsset() {
    if (!assetForm.title.trim()) {
      setError("Asset title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const method = assetForm.id ? "PUT" : "POST";
      const response = await fetch("/api/admin/content-intelligence", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity: "asset", ...assetForm }),
      });
      const nextPayload = await response.json();
      if (!response.ok) throw new Error(nextPayload?.error || "Failed to save asset");
      setNotice(assetForm.id ? "Content asset updated." : "Content asset logged.");
      setAssetForm(initialAssetForm);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save asset");
    } finally {
      setSaving(false);
    }
  }

  async function saveFeedback() {
    if (!feedbackForm.feedbackDate || !feedbackForm.topic.trim()) {
      setError("Feedback date and topic are required.");
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const method = feedbackForm.id ? "PUT" : "POST";
      const response = await fetch("/api/admin/content-intelligence", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity: "feedback", ...feedbackForm }),
      });
      const nextPayload = await response.json();
      if (!response.ok) throw new Error(nextPayload?.error || "Failed to save feedback");
      setNotice(feedbackForm.id ? "Content feedback updated." : "Content feedback added.");
      setFeedbackForm(initialFeedbackForm);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save feedback");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRow(entity: "asset" | "feedback", id: number) {
    const confirmed = window.confirm("Delete this row?");
    if (!confirmed) return;
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/content-intelligence?entity=${entity}&id=${id}`, { method: "DELETE" });
      const nextPayload = await response.json();
      if (!response.ok) throw new Error(nextPayload?.error || `Failed to delete ${entity}`);
      setNotice(entity === "asset" ? "Asset deleted." : "Feedback deleted.");
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to delete ${entity}`);
    }
  }

  const summary = payload?.summary;
  const contentEngineRecommendations = useMemo(
    () => parseContentEngineRecommendations(payload?.contentEngine?.recommendations),
    [payload?.contentEngine?.recommendations]
  );

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,#173c3a_0%,#285955_52%,#45726b_100%)] p-6 text-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">CRM 2.0</p>
            <h2 className="mt-2 text-2xl font-semibold">Content Intelligence</h2>
            <p className="mt-3 text-sm leading-6 text-white/80">
              Turn blogs, reels, landing pages, reviews, and real patient questions into a ranked content backlog.
              This module is where marketing stops publishing blindly and starts adapting to demand.
            </p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80">
            Use this for topic planning, keyword refreshes, and content briefs for writers and social teams.
          </div>
        </div>
      </div>

      {notice ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div> : null}
      {error ? <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div> : null}

      {loading ? <div className="rounded-lg border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">Loading content intelligence...</div> : null}

      {summary ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <BookOpen className="h-5 w-5 text-slate-500" />
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-500">Tracked assets</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.totalAssets}</p>
              <p className="mt-1 text-sm text-slate-500">Blogs + social + landing assets</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <TrendingUp className="h-5 w-5 text-slate-500" />
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-500">Recent assets</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.recentAssets}</p>
              <p className="mt-1 text-sm text-slate-500">Published in the last 30 days</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <UploadCloud className="h-5 w-5 text-slate-500" />
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-500">Feedback items</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.feedbackItems}</p>
              <p className="mt-1 text-sm text-slate-500">Questions, objections, and topic requests</p>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-5 shadow-sm">
              <Sparkles className="h-5 w-5 text-rose-700" />
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-rose-700">Content gaps</p>
              <p className="mt-1 text-2xl font-semibold text-rose-900">{summary.opportunityGaps}</p>
              <p className="mt-1 text-sm text-rose-700">Signals with no clear existing asset coverage</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
              <Lightbulb className="h-5 w-5 text-amber-700" />
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-amber-700">Refresh targets</p>
              <p className="mt-1 text-2xl font-semibold text-amber-900">{summary.refreshTargets}</p>
              <p className="mt-1 text-sm text-amber-700">Covered topics that still need stronger content</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <h3 className="text-lg font-semibold text-slate-900">Opportunity board</h3>
                <p className="mt-1 text-sm text-slate-500">Use this list to decide what the content team should write, refresh, or turn into reels next.</p>
              </div>
              <div className="space-y-3 p-6">
                {(payload?.opportunities || []).length > 0 ? (
                  payload!.opportunities.map((item) => (
                    <div key={item.key} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900">{themeLabel(item.label)}</p>
                            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${classForOpportunity(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-600">
                            Signal count: <span className="font-semibold text-slate-900">{item.count}</span> · Coverage: <span className="font-semibold text-slate-900">{item.coverageCount}</span> assets · Next move: <span className="font-semibold text-slate-900">{labelForAction(item.action)}</span>
                          </p>
                          {item.questionExample ? <p className="mt-2 text-sm text-slate-500">Example: {item.questionExample}</p> : null}
                        </div>
                        <div className="text-xs text-slate-500">
                          <p>Sources: {item.sources.join(", ")}</p>
                          <p className="mt-1">Centers: {item.centers.join(", ")}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No content signals yet. Start by adding feedback from telecallers, counselors, reviews, or agency reports.</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h3 className="text-lg font-semibold text-slate-900">Cloudflare content engine</h3>
                  <p className="mt-1 text-sm text-slate-500">This is the parallel adaptive content plane. It should stay healthy while the current CRM workflow remains unchanged.</p>
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      payload?.contentEngine?.healthy
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : payload?.contentEngine?.configured
                          ? "border-amber-200 bg-amber-50 text-amber-800"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}>
                      {payload?.contentEngine?.healthy ? "Healthy" : payload?.contentEngine?.configured ? "Configured" : "Not configured"}
                    </span>
                    <span className="text-sm text-slate-500">
                      {payload?.contentEngine?.message || "Content engine is ready for adaptive indexing and recommendation work."}
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Bindings</p>
                      <p className="mt-2 text-sm text-slate-700">
                        Vectorize: <span className="font-semibold text-slate-900">{payload?.contentEngine?.bindings?.vectorize ? "on" : "off"}</span> ·
                        R2 Drafts: <span className="font-semibold text-slate-900">{payload?.contentEngine?.bindings?.draftsBucket ? "on" : "off"}</span> ·
                        Turso: <span className="font-semibold text-slate-900">{payload?.contentEngine?.bindings?.tursoReady ? "on" : "off"}</span>
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Recommendation channel</p>
                      <p className="mt-2 text-sm text-slate-700">
                        {payload?.contentEngine?.recommendationMessage || "Recommendations will appear here as the Cloudflare layer moves from ingest-only to adaptive ranking."}
                      </p>
                    </div>
                  </div>

                  {contentEngineRecommendations.length > 0 ? (
                    <div className="space-y-3">
                      {contentEngineRecommendations.slice(0, 4).map((item, index) => (
                        <div key={`${item.theme || "theme"}-${index}`} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900">{item.theme || "Untitled theme"}</p>
                            {item.status ? (
                              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${classForOpportunity((item.status as OpportunityRow["status"]) || "covered")}`}>
                                {item.status}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            Signals: <span className="font-semibold text-slate-900">{item.signalCount ?? 0}</span> · Coverage: <span className="font-semibold text-slate-900">{item.coverageCount ?? 0}</span> · Next move: <span className="font-semibold text-slate-900">{labelForAction(item.action || "write_blog")}</span>
                          </p>
                          {item.example ? <p className="mt-2 text-sm text-slate-500">Example: {item.example}</p> : null}
                          {item.relatedAssets && item.relatedAssets.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.relatedAssets.map((asset, assetIndex) => (
                                <span key={`${asset.assetId || asset.title || "asset"}-${assetIndex}`} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700">
                                  {asset.title || asset.assetId}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h3 className="text-lg font-semibold text-slate-900">Website demand signals</h3>
                  <p className="mt-1 text-sm text-slate-500">GA4 pages help you see which site destinations are already attracting traffic.</p>
                </div>
                <div className="p-6">
                  {payload?.ga4Content.configured ? (
                    <div className="space-y-3">
                      {payload.ga4Content.topContentPages.length > 0 ? payload.ga4Content.topContentPages.map((page) => (
                        <div key={page.path} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                          <p className="text-sm font-medium text-slate-900 truncate">{page.path}</p>
                          <p className="mt-1 text-xs text-slate-500">Sessions: {page.sessions} · Active users: {page.activeUsers}</p>
                        </div>
                      )) : <p className="text-sm text-slate-500">No content landing pages were detected in the current GA4 window.</p>}
                    </div>
                  ) : (
                    <p className="text-sm text-amber-700">{payload?.ga4Content.message || "GA4 content signals are not ready yet."}</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h3 className="text-lg font-semibold text-slate-900">Review themes feeding content</h3>
                  <p className="mt-1 text-sm text-slate-500">Google reviews are patient-language intelligence. Repeated praise or complaints should become topics, FAQs, and scripts.</p>
                </div>
                <div className="flex flex-wrap gap-2 p-6">
                  {(payload?.reviewSignals.topThemes || []).length > 0 ? payload!.reviewSignals.topThemes.map((item) => (
                    <span key={item.theme} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900">
                      {themeLabel(item.theme)} · {item.count}
                    </span>
                  )) : <p className="text-sm text-slate-500">No review themes captured yet.</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <h3 className="text-lg font-semibold text-slate-900">Register social / landing / FAQ asset</h3>
                <p className="mt-1 text-sm text-slate-500">Blogs already come from the website automatically. Use this form for reels, posts, landing pages, FAQs, emailers, and ad-copy assets.</p>
              </div>
              <div className="grid gap-4 p-6 md:grid-cols-2">
                <FieldWithHelp label="Asset type" required help="Choose the actual asset format so the backlog knows whether coverage exists in blogs, reels, landing pages, or FAQs.">
                  <select value={assetForm.assetType} onChange={(e) => setAssetForm((prev) => ({ ...prev, assetType: e.target.value as ContentAssetType }))} className="h-10 rounded-md border border-slate-300 px-3 text-sm">
                    {CONTENT_ASSET_TYPES.map((item) => <option key={item} value={item}>{labelForAction(item)}</option>)}
                  </select>
                </FieldWithHelp>
                <FieldWithHelp label="Center" required help="Use network for pan-Santaan assets. Use a city if the asset is center-specific.">
                  <select value={assetForm.center} onChange={(e) => setAssetForm((prev) => ({ ...prev, center: e.target.value as ContentCenter }))} className="h-10 rounded-md border border-slate-300 px-3 text-sm">
                    {CONTENT_CENTERS.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </FieldWithHelp>
                <div className="md:col-span-2">
                  <FieldWithHelp label="Title" required help="Use the exact published title or working title.">
                    <Input value={assetForm.title} onChange={(e) => setAssetForm((prev) => ({ ...prev, title: e.target.value }))} />
                  </FieldWithHelp>
                </div>
                <div className="md:col-span-2">
                  <FieldWithHelp label="URL" help="Paste the live link if published. Internal drafts can stay blank.">
                    <Input value={assetForm.url} onChange={(e) => setAssetForm((prev) => ({ ...prev, url: e.target.value }))} />
                  </FieldWithHelp>
                </div>
                <FieldWithHelp label="Audience" required help="Use patient, doctor, couple, referral, or mixed.">
                  <select value={assetForm.audience} onChange={(e) => setAssetForm((prev) => ({ ...prev, audience: e.target.value as ContentAudience }))} className="h-10 rounded-md border border-slate-300 px-3 text-sm">
                    {CONTENT_AUDIENCES.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </FieldWithHelp>
                <FieldWithHelp label="Funnel stage" required help="Awareness = discovery. Consideration = research. Decision = ready to act. Retention = follow-up or community.">
                  <select value={assetForm.funnelStage} onChange={(e) => setAssetForm((prev) => ({ ...prev, funnelStage: e.target.value as ContentFunnelStage }))} className="h-10 rounded-md border border-slate-300 px-3 text-sm">
                    {CONTENT_FUNNEL_STAGES.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </FieldWithHelp>
                <FieldWithHelp label="Primary keyword" help="Main search phrase or hook this asset should win on.">
                  <Input value={assetForm.primaryKeyword} onChange={(e) => setAssetForm((prev) => ({ ...prev, primaryKeyword: e.target.value }))} />
                </FieldWithHelp>
                <FieldWithHelp label="Secondary keywords" help="Comma-separated related terms, objections, or variants.">
                  <Input value={assetForm.secondaryKeywords} onChange={(e) => setAssetForm((prev) => ({ ...prev, secondaryKeywords: e.target.value }))} />
                </FieldWithHelp>
                <FieldWithHelp label="Tags" help="Comma-separated tracking tags for theme or format.">
                  <Input value={assetForm.tags} onChange={(e) => setAssetForm((prev) => ({ ...prev, tags: e.target.value }))} />
                </FieldWithHelp>
                <FieldWithHelp label="Source platform" help="instagram, website, linkedin, facebook, youtube, whatsapp, or manual.">
                  <Input value={assetForm.sourcePlatform} onChange={(e) => setAssetForm((prev) => ({ ...prev, sourcePlatform: e.target.value }))} />
                </FieldWithHelp>
                <FieldWithHelp label="Status" required help="Draft, published, refresh_needed, or archived.">
                  <select value={assetForm.status} onChange={(e) => setAssetForm((prev) => ({ ...prev, status: e.target.value as ContentAssetStatus }))} className="h-10 rounded-md border border-slate-300 px-3 text-sm">
                    {CONTENT_ASSET_STATUS.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </FieldWithHelp>
                <FieldWithHelp label="Published date" help="Use the real publish date if the asset is already live.">
                  <Input type="date" value={assetForm.publishedAt} onChange={(e) => setAssetForm((prev) => ({ ...prev, publishedAt: e.target.value }))} />
                </FieldWithHelp>
                <FieldWithHelp label="Owner" help="Writer, social owner, agency, or internal team member.">
                  <Input value={assetForm.owner} onChange={(e) => setAssetForm((prev) => ({ ...prev, owner: e.target.value }))} />
                </FieldWithHelp>
                <div className="md:col-span-2">
                  <FieldWithHelp label="Notes" help="Use this for hook angle, CTA, doctor name, or refresh instruction.">
                    <textarea value={assetForm.notes} onChange={(e) => setAssetForm((prev) => ({ ...prev, notes: e.target.value }))} className="min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                  </FieldWithHelp>
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <Button onClick={saveAsset} disabled={saving} className="flex items-center gap-2"><Save className="h-4 w-4" /> {assetForm.id ? "Update Asset" : "Add Asset"}</Button>
                  <Button variant="outline" onClick={() => setAssetForm(initialAssetForm)}>Reset</Button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <h3 className="text-lg font-semibold text-slate-900">Capture feedback from calls, reviews, and campaigns</h3>
                <p className="mt-1 text-sm text-slate-500">This is the backlog intake. Use exact patient language, objections, repeated questions, and keyword ideas.</p>
              </div>
              <div className="grid gap-4 p-6 md:grid-cols-2">
                <FieldWithHelp label="Feedback date" required help="Use the date the signal was observed, not the day you remembered to enter it.">
                  <Input type="date" value={feedbackForm.feedbackDate} onChange={(e) => setFeedbackForm((prev) => ({ ...prev, feedbackDate: e.target.value }))} />
                </FieldWithHelp>
                <FieldWithHelp label="Source" required help="Where this signal came from: telecaller, counselor, review, agency, search, social, WhatsApp, or field team.">
                  <select value={feedbackForm.source} onChange={(e) => setFeedbackForm((prev) => ({ ...prev, source: e.target.value as ContentFeedbackSource }))} className="h-10 rounded-md border border-slate-300 px-3 text-sm">
                    {CONTENT_FEEDBACK_SOURCES.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </FieldWithHelp>
                <FieldWithHelp label="Center" required help="Use network if the theme applies across all centers.">
                  <select value={feedbackForm.center} onChange={(e) => setFeedbackForm((prev) => ({ ...prev, center: e.target.value as ContentCenter }))} className="h-10 rounded-md border border-slate-300 px-3 text-sm">
                    {CONTENT_CENTERS.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </FieldWithHelp>
                <FieldWithHelp label="Topic" required help="Short theme label like IVF cost, PCOS cycle confusion, or embryo quality after 35.">
                  <Input value={feedbackForm.topic} onChange={(e) => setFeedbackForm((prev) => ({ ...prev, topic: e.target.value }))} />
                </FieldWithHelp>
                <FieldWithHelp label="Suggested keyword" help="Write the actual phrase patients search or ask.">
                  <Input value={feedbackForm.suggestedKeyword} onChange={(e) => setFeedbackForm((prev) => ({ ...prev, suggestedKeyword: e.target.value }))} />
                </FieldWithHelp>
                <FieldWithHelp label="Audience" required help="Patient, doctor, couple, referral, or mixed.">
                  <select value={feedbackForm.audience} onChange={(e) => setFeedbackForm((prev) => ({ ...prev, audience: e.target.value as ContentAudience }))} className="h-10 rounded-md border border-slate-300 px-3 text-sm">
                    {CONTENT_AUDIENCES.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </FieldWithHelp>
                <FieldWithHelp label="Funnel stage" required help="Map whether this signal is discovery, research, decision, or retention stage.">
                  <select value={feedbackForm.funnelStage} onChange={(e) => setFeedbackForm((prev) => ({ ...prev, funnelStage: e.target.value as ContentFunnelStage }))} className="h-10 rounded-md border border-slate-300 px-3 text-sm">
                    {CONTENT_FUNNEL_STAGES.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </FieldWithHelp>
                <FieldWithHelp label="Priority" required help="Use high only if this affects conversion or repeats frequently.">
                  <select value={feedbackForm.priority} onChange={(e) => setFeedbackForm((prev) => ({ ...prev, priority: e.target.value as ContentFeedbackPriority }))} className="h-10 rounded-md border border-slate-300 px-3 text-sm">
                    {CONTENT_FEEDBACK_PRIORITY.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </FieldWithHelp>
                <FieldWithHelp label="Occurrence count" help="How many times this was observed. Use best disciplined estimate, not guesswork.">
                  <Input type="number" min="1" value={feedbackForm.occurrenceCount} onChange={(e) => setFeedbackForm((prev) => ({ ...prev, occurrenceCount: e.target.value }))} />
                </FieldWithHelp>
                <FieldWithHelp label="Recommended action" required help="This is the initial content move you think is needed.">
                  <select value={feedbackForm.recommendedAction} onChange={(e) => setFeedbackForm((prev) => ({ ...prev, recommendedAction: e.target.value as ContentRecommendedAction }))} className="h-10 rounded-md border border-slate-300 px-3 text-sm">
                    {CONTENT_RECOMMENDED_ACTIONS.map((item) => <option key={item} value={item}>{labelForAction(item)}</option>)}
                  </select>
                </FieldWithHelp>
                <FieldWithHelp label="Status" required help="Open = new signal. Planned = assigned. Done = content created. Ignored = not worth action.">
                  <select value={feedbackForm.status} onChange={(e) => setFeedbackForm((prev) => ({ ...prev, status: e.target.value as ContentFeedbackStatus }))} className="h-10 rounded-md border border-slate-300 px-3 text-sm">
                    {CONTENT_FEEDBACK_STATUS.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </FieldWithHelp>
                <FieldWithHelp label="Owner" help="Who should act on this: writer, social team, agency, doctor desk, CRM ops.">
                  <Input value={feedbackForm.owner} onChange={(e) => setFeedbackForm((prev) => ({ ...prev, owner: e.target.value }))} />
                </FieldWithHelp>
                <div className="md:col-span-2">
                  <FieldWithHelp label="Patient question / objection" help="Write the actual phrase heard on calls, in reviews, or in DMs.">
                    <textarea value={feedbackForm.patientQuestion} onChange={(e) => setFeedbackForm((prev) => ({ ...prev, patientQuestion: e.target.value }))} className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                  </FieldWithHelp>
                </div>
                <div className="md:col-span-2">
                  <FieldWithHelp label="Notes" help="Use this for nuance: which campaign, which center, why this matters, or what format seems to work.">
                    <textarea value={feedbackForm.notes} onChange={(e) => setFeedbackForm((prev) => ({ ...prev, notes: e.target.value }))} className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                  </FieldWithHelp>
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <Button onClick={saveFeedback} disabled={saving} className="flex items-center gap-2"><Save className="h-4 w-4" /> {feedbackForm.id ? "Update Feedback" : "Add Feedback"}</Button>
                  <Button variant="outline" onClick={() => setFeedbackForm(initialFeedbackForm)}>Reset</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Working registry</h3>
                <p className="mt-1 text-sm text-slate-500">Search across synced blogs, manually logged social assets, and content feedback notes.</p>
              </div>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search topic, keyword, platform, center..." className="max-w-sm" />
            </div>
            <div className="grid gap-6 p-6 xl:grid-cols-2">
              <div>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Recent assets</h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Keyword</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssets.length > 0 ? filteredAssets.slice(0, 12).map((row) => (
                        <TableRow key={String(row.id)}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate-900">{row.title}</p>
                              <p className="text-xs text-slate-500">{row.source === "blog_sync" ? "Website synced" : row.sourcePlatform || row.source}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">{themeLabel(row.assetType)}</TableCell>
                          <TableCell className="text-sm text-slate-600">{row.primaryKeyword || parseCsvArray(row.tags)[0] || "-"}</TableCell>
                          <TableCell>
                            {row.source === "manual" && typeof row.id === "number" ? (
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => setAssetForm({
                                  id: row.id as number,
                                  assetType: row.assetType as ContentAssetType,
                                  title: row.title,
                                  url: row.url || "",
                                  center: row.center as ContentCenter,
                                  audience: row.audience as ContentAudience,
                                  funnelStage: row.funnelStage as ContentFunnelStage,
                                  primaryKeyword: row.primaryKeyword || "",
                                  secondaryKeywords: parseCsvArray(row.secondaryKeywords).join(", "),
                                  tags: parseCsvArray(row.tags).join(", "),
                                  sourcePlatform: row.sourcePlatform || "manual",
                                  status: (row.status as ContentAssetStatus) || "published",
                                  owner: row.owner || "",
                                  notes: row.notes || "",
                                  publishedAt: row.publishedAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
                                })}>Edit</Button>
                                <Button size="sm" variant="outline" className="text-rose-700" onClick={() => deleteRow("asset", row.id as number)}><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            ) : row.url ? (
                              <a href={row.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-emerald-700 hover:underline">Open</a>
                            ) : <span className="text-sm text-slate-400">Read only</span>}
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow><TableCell colSpan={4} className="py-8 text-center text-sm text-slate-500">No assets found.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Feedback queue</h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Topic</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Manage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFeedback.length > 0 ? filteredFeedback.slice(0, 12).map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate-900">{row.topic}</p>
                              <p className="text-xs text-slate-500">{row.suggestedKeyword || row.patientQuestion || "No keyword / quote yet"}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">{row.source}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm text-slate-800">{labelForAction(row.recommendedAction)}</p>
                              <p className="text-xs text-slate-500">{row.status} · x{row.occurrenceCount}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => setFeedbackForm({
                                id: row.id,
                                feedbackDate: row.feedbackDate,
                                source: row.source,
                                center: row.center,
                                topic: row.topic,
                                suggestedKeyword: row.suggestedKeyword || "",
                                patientQuestion: row.patientQuestion || "",
                                audience: row.audience,
                                funnelStage: row.funnelStage,
                                priority: row.priority,
                                occurrenceCount: String(row.occurrenceCount || 1),
                                recommendedAction: row.recommendedAction,
                                owner: row.owner || "",
                                status: row.status,
                                notes: row.notes || "",
                              })}>Edit</Button>
                              <Button size="sm" variant="outline" className="text-rose-700" onClick={() => deleteRow("feedback", row.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow><TableCell colSpan={4} className="py-8 text-center text-sm text-slate-500">No feedback logged yet.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
