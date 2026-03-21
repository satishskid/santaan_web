"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardCopy, ExternalLink, Megaphone, RefreshCw, Send, Target } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { META_ACCOUNT_OPTIONS, META_OBJECTIVES, MetaLaunchStatus, buildAdsManagerLink, defaultPlacementsForAccount, formatPlacementsForStorage, marketHintForAccount, parsePlacements } from "@/lib/meta-launch";

interface MetaLaunchDraft {
  id: number;
  accountId: string;
  center?: string | null;
  objective?: string | null;
  campaignName: string;
  adsetName?: string | null;
  adName?: string | null;
  status?: string | null;
  priority?: string | null;
  audienceSummary?: string | null;
  geoTargets?: string | null;
  placements?: string | null;
  budgetType?: string | null;
  budgetInr?: number | null;
  budgetNotes?: string | null;
  utmCampaign?: string | null;
  landingUrl?: string | null;
  contentAngle?: string | null;
  hook?: string | null;
  primaryText?: string | null;
  headline?: string | null;
  description?: string | null;
  cta?: string | null;
  creativeFormat?: string | null;
  creativeBrief?: string | null;
  contentKeywords?: string | null;
  contentOwnerName?: string | null;
  performanceOwnerName?: string | null;
  requestedByEmail?: string | null;
  requestedByName?: string | null;
  approvalRequestedAt?: string | null;
  approvedByEmail?: string | null;
  approvedByName?: string | null;
  approvedAt?: string | null;
  approvalNotes?: string | null;
  adsManagerLink?: string | null;
  launchChecklist?: string | null;
  launchNotes?: string | null;
  launchedAt?: string | null;
  updatedAt?: string | null;
}

interface DraftForm {
  id?: number;
  accountId: string;
  center: string;
  objective: string;
  campaignName: string;
  adsetName: string;
  adName: string;
  status: MetaLaunchStatus;
  priority: string;
  audienceSummary: string;
  geoTargets: string;
  placements: string[];
  budgetType: string;
  budgetInr: string;
  budgetNotes: string;
  utmCampaign: string;
  landingUrl: string;
  contentAngle: string;
  hook: string;
  primaryText: string;
  headline: string;
  description: string;
  cta: string;
  creativeFormat: string;
  creativeBrief: string;
  contentKeywords: string;
  contentOwnerName: string;
  performanceOwnerName: string;
  approvalNotes: string;
  launchChecklist: string;
  launchNotes: string;
}

interface MetaLaunchPanelProps {
  currentRole: string;
}

const DEFAULT_ACCOUNT = META_ACCOUNT_OPTIONS[1]?.accountId || META_ACCOUNT_OPTIONS[0].accountId;
const STATUS_ORDER: MetaLaunchStatus[] = ["draft", "content_ready", "pending_approval", "approved", "launched", "blocked"];
const CREATIVE_FORMATS = ["reel", "image", "carousel", "video", "lead_form"] as const;
const CTA_OPTIONS = ["WhatsApp", "Book Consultation", "Call Now", "Learn More", "Apply Now"] as const;

function initialForm(): DraftForm {
  return {
    accountId: DEFAULT_ACCOUNT,
    center: "odisha",
    objective: "OUTCOME_LEADS",
    campaignName: "",
    adsetName: "",
    adName: "",
    status: "draft",
    priority: "high",
    audienceSummary: "",
    geoTargets: "Odisha, Bhubaneswar, Cuttack, Berhampur",
    placements: defaultPlacementsForAccount(DEFAULT_ACCOUNT),
    budgetType: "daily",
    budgetInr: "",
    budgetNotes: "",
    utmCampaign: "",
    landingUrl: "",
    contentAngle: "",
    hook: "",
    primaryText: "",
    headline: "",
    description: "",
    cta: "WhatsApp",
    creativeFormat: "reel",
    creativeBrief: "",
    contentKeywords: "",
    contentOwnerName: "",
    performanceOwnerName: "",
    approvalNotes: "",
    launchChecklist: "UTM checked\nLanding page checked\nWhatsApp/call CTA checked\nBudget checked\nLead form questions checked",
    launchNotes: "",
  };
}

function prettyDate(value?: string | null) {
  if (!value) return "—";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleString("en-IN");
}

function statusTone(status?: string | null) {
  const normalized = String(status || "draft").toLowerCase();
  if (normalized === "launched" || normalized === "approved") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (normalized === "pending_approval" || normalized === "content_ready") return "bg-amber-50 text-amber-700 border-amber-200";
  if (normalized === "blocked") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function mapDraftToForm(draft: MetaLaunchDraft): DraftForm {
  return {
    id: draft.id,
    accountId: String(draft.accountId || DEFAULT_ACCOUNT).replace(/^act_/, ""),
    center: String(draft.center || "network"),
    objective: String(draft.objective || "OUTCOME_LEADS"),
    campaignName: String(draft.campaignName || ""),
    adsetName: String(draft.adsetName || ""),
    adName: String(draft.adName || ""),
    status: (String(draft.status || "draft").toLowerCase() as MetaLaunchStatus) || "draft",
    priority: String(draft.priority || "medium"),
    audienceSummary: String(draft.audienceSummary || ""),
    geoTargets: String(draft.geoTargets || ""),
    placements: parsePlacements(draft.placements),
    budgetType: String(draft.budgetType || "daily"),
    budgetInr: draft.budgetInr ? String(draft.budgetInr) : "",
    budgetNotes: String(draft.budgetNotes || ""),
    utmCampaign: String(draft.utmCampaign || ""),
    landingUrl: String(draft.landingUrl || ""),
    contentAngle: String(draft.contentAngle || ""),
    hook: String(draft.hook || ""),
    primaryText: String(draft.primaryText || ""),
    headline: String(draft.headline || ""),
    description: String(draft.description || ""),
    cta: String(draft.cta || "WhatsApp"),
    creativeFormat: String(draft.creativeFormat || "reel"),
    creativeBrief: String(draft.creativeBrief || ""),
    contentKeywords: String(draft.contentKeywords || ""),
    contentOwnerName: String(draft.contentOwnerName || ""),
    performanceOwnerName: String(draft.performanceOwnerName || ""),
    approvalNotes: String(draft.approvalNotes || ""),
    launchChecklist: String(draft.launchChecklist || ""),
    launchNotes: String(draft.launchNotes || ""),
  };
}

function copyText(text: string, success: string, onDone: (message: string) => void) {
  navigator.clipboard.writeText(text).then(() => onDone(success)).catch(() => onDone("Copy failed"));
}

export default function MetaLaunchPanel({ currentRole }: MetaLaunchPanelProps) {
  const normalizedRole = String(currentRole || "").trim().toLowerCase();
  const canApprove = ["admin", "ceo", "crm_ops_admin", "marketing_manager", "agency_ops", "performance_marketer"].includes(normalizedRole);
  const canEdit = canApprove || normalizedRole === "content_manager";

  const [drafts, setDrafts] = useState<MetaLaunchDraft[]>([]);
  const [form, setForm] = useState<DraftForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchDrafts() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/meta-launch-drafts");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to fetch launch drafts");
      setDrafts(payload.drafts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch launch drafts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDrafts();
  }, []);

  useEffect(() => {
    setForm((current) => {
      if (!current.accountId) return current;
      const nextPlacements = current.placements.length ? current.placements : defaultPlacementsForAccount(current.accountId);
      return {
        ...current,
        center: META_ACCOUNT_OPTIONS.find((item) => item.accountId === current.accountId)?.center || current.center,
        placements: nextPlacements,
      };
    });
  }, [form.accountId]);

  const draftCounts = useMemo(() => {
    return STATUS_ORDER.reduce((acc, status) => {
      acc[status] = drafts.filter((draft) => String(draft.status || "draft").toLowerCase() === status).length;
      return acc;
    }, {} as Record<MetaLaunchStatus, number>);
  }, [drafts]);

  const marketHint = useMemo(() => marketHintForAccount(form.accountId), [form.accountId]);
  const adsManagerLink = useMemo(() => buildAdsManagerLink(form.accountId), [form.accountId]);

  function updateField<K extends keyof DraftForm>(key: K, value: DraftForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function togglePlacement(value: string) {
    setForm((current) => {
      const placements = current.placements.includes(value)
        ? current.placements.filter((item) => item !== value)
        : [...current.placements, value];
      return { ...current, placements };
    });
  }

  function resetForm() {
    setForm(initialForm());
    setNotice(null);
    setError(null);
  }

  async function saveDraft(nextStatus?: MetaLaunchStatus) {
    if (!canEdit) return;
    if (!form.campaignName.trim()) {
      setError("Campaign name is required.");
      return;
    }

    setSaving(true);
    setNotice(null);
    setError(null);

    const payload = {
      ...form,
      status: nextStatus || form.status,
      budgetInr: Number(form.budgetInr || 0),
      placements: form.placements,
      adsManagerLink,
    };

    try {
      const response = await fetch(form.id ? `/api/admin/meta-launch-drafts/${form.id}` : "/api/admin/meta-launch-drafts", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to save draft");
      setNotice(form.id ? "Meta launch draft updated." : "Meta launch draft created.");
      if (data?.draft) {
        setForm(mapDraftToForm(data.draft));
      }
      await fetchDrafts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save draft");
    } finally {
      setSaving(false);
    }
  }

  function copyBrief() {
    const lines = [
      `Meta Launch Draft: ${form.campaignName || "Untitled"}`,
      `Account: ${META_ACCOUNT_OPTIONS.find((item) => item.accountId === form.accountId)?.label || form.accountId}`,
      `Objective: ${form.objective}`,
      `Center: ${form.center}`,
      `Audience: ${form.audienceSummary || "—"}`,
      `Geo: ${form.geoTargets || "—"}`,
      `Placements: ${form.placements.join(", ") || "—"}`,
      `Budget: ${form.budgetType} INR ${form.budgetInr || "0"}`,
      `UTM Campaign: ${form.utmCampaign || "—"}`,
      `Landing URL: ${form.landingUrl || "—"}`,
      "",
      "Content Handoff",
      `Angle: ${form.contentAngle || "—"}`,
      `Hook: ${form.hook || "—"}`,
      `Keywords: ${form.contentKeywords || "—"}`,
      `Headline: ${form.headline || "—"}`,
      `Primary Text: ${form.primaryText || "—"}`,
      `Description: ${form.description || "—"}`,
      `CTA: ${form.cta || "—"}`,
      `Creative Format: ${form.creativeFormat || "—"}`,
      `Creative Brief: ${form.creativeBrief || "—"}`,
      "",
      "Launch Checklist",
      form.launchChecklist || "—",
    ];
    copyText(lines.join("\n"), "Launch brief copied for content/performance handoff.", setNotice);
  }

  function openAdsManager() {
    window.open(adsManagerLink, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Megaphone className="h-4 w-4" />
              Meta Launch
            </div>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">Draft inside CRM, launch inside Ads Manager</h2>
            <p className="mt-2 max-w-3xl text-sm text-gray-600">
              Content writers can prepare copy and creative briefs here. Performance marketers can approve, open the right ad account, and execute in Meta with full context.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={fetchDrafts}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" onClick={copyBrief}>
              <ClipboardCopy className="mr-2 h-4 w-4" />
              Copy Launch Pack
            </Button>
            <Button onClick={openAdsManager}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Ads Manager
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {STATUS_ORDER.map((status) => (
            <div key={status} className={`rounded-lg border px-4 py-3 ${statusTone(status)}`}>
              <p className="text-xs font-semibold uppercase tracking-wide">{status.replace("_", " ")}</p>
              <p className="mt-1 text-2xl font-bold">{draftCounts[status] || 0}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Launch Builder</h3>
              <p className="text-sm text-gray-500">Campaign, ad set, ad draft, creative handoff, and approval state in one place.</p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(form.status)}`}>
              {form.status.replace("_", " ")}
            </span>
          </div>

          <div className="mt-6 grid gap-6">
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-500" />
                <h4 className="text-sm font-semibold text-gray-900">Campaign Draft</h4>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Ad account</span>
                  <select
                    value={form.accountId}
                    onChange={(e) => {
                      const accountId = e.target.value;
                      updateField("accountId", accountId);
                      updateField("center", META_ACCOUNT_OPTIONS.find((item) => item.accountId === accountId)?.center || "network");
                      updateField("placements", defaultPlacementsForAccount(accountId));
                    }}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  >
                    {META_ACCOUNT_OPTIONS.map((option) => (
                      <option key={option.accountId} value={option.accountId}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Objective</span>
                  <select
                    value={form.objective}
                    onChange={(e) => updateField("objective", e.target.value)}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  >
                    {META_OBJECTIVES.map((objective) => (
                      <option key={objective} value={objective}>
                        {objective}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-medium text-gray-700">Campaign name</span>
                  <Input value={form.campaignName} onChange={(e) => updateField("campaignName", e.target.value)} placeholder="ODISHA_REEL_IVF_CONSULT_APRIL" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Priority</span>
                  <select
                    value={form.priority}
                    onChange={(e) => updateField("priority", e.target.value)}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">UTM campaign</span>
                  <Input value={form.utmCampaign} onChange={(e) => updateField("utmCampaign", e.target.value)} placeholder="odisha_reel_ivf_consult_april" />
                </label>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 md:col-span-2">
                  <p className="font-semibold">Market note</p>
                  <p className="mt-1">{marketHint}</p>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2">
                <Send className="h-4 w-4 text-gray-500" />
                <h4 className="text-sm font-semibold text-gray-900">Ad Set Draft</h4>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Ad set name</span>
                  <Input value={form.adsetName} onChange={(e) => updateField("adsetName", e.target.value)} placeholder="Women_25_39_Odisha_Lead" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Geo targets</span>
                  <Input value={form.geoTargets} onChange={(e) => updateField("geoTargets", e.target.value)} placeholder="Odisha, Bhubaneswar, Cuttack, Berhampur" />
                </label>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-medium text-gray-700">Audience summary</span>
                  <textarea
                    value={form.audienceSummary}
                    onChange={(e) => updateField("audienceSummary", e.target.value)}
                    className="min-h-[90px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Married couples, fertility concern, IVF/PCOS interest, Odisha tier 1 + tier 2, warm + broad lead mix"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Budget type</span>
                  <select
                    value={form.budgetType}
                    onChange={(e) => updateField("budgetType", e.target.value)}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Budget (INR)</span>
                  <Input value={form.budgetInr} onChange={(e) => updateField("budgetInr", e.target.value)} placeholder="3000" />
                </label>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-medium text-gray-700">Placement mix</span>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {["facebook_feed", "instagram_feed", "instagram_reels", "facebook_reels", "instagram_stories", "facebook_video_feeds"].map((placement) => (
                      <label key={placement} className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm">
                        <input
                          type="checkbox"
                          checked={form.placements.includes(placement)}
                          onChange={() => togglePlacement(placement)}
                        />
                        {placement.replaceAll("_", " ")}
                      </label>
                    ))}
                  </div>
                </label>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-medium text-gray-700">Budget / targeting notes</span>
                  <textarea
                    value={form.budgetNotes}
                    onChange={(e) => updateField("budgetNotes", e.target.value)}
                    className="min-h-[80px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Start Odisha on reel-heavy mix, split warm + broad, cap CPL after day 2 review."
                  />
                </label>
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gray-500" />
                <h4 className="text-sm font-semibold text-gray-900">Ad Draft + Content Handoff</h4>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Ad name</span>
                  <Input value={form.adName} onChange={(e) => updateField("adName", e.target.value)} placeholder="Reel_Hook_01_WhatsApp" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Creative format</span>
                  <select
                    value={form.creativeFormat}
                    onChange={(e) => updateField("creativeFormat", e.target.value)}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  >
                    {CREATIVE_FORMATS.map((format) => (
                      <option key={format} value={format}>
                        {format}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Content angle</span>
                  <Input value={form.contentAngle} onChange={(e) => updateField("contentAngle", e.target.value)} placeholder="IVF guidance with local trust + WhatsApp callback" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Hook</span>
                  <Input value={form.hook} onChange={(e) => updateField("hook", e.target.value)} placeholder="Trying for pregnancy? Don’t lose another cycle." />
                </label>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-medium text-gray-700">Keywords / talking points</span>
                  <Input value={form.contentKeywords} onChange={(e) => updateField("contentKeywords", e.target.value)} placeholder="ivf odisha, fertility doctor bhubaneswar, pcos infertility, whatsapp consult" />
                </label>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-medium text-gray-700">Primary text</span>
                  <textarea value={form.primaryText} onChange={(e) => updateField("primaryText", e.target.value)} className="min-h-[110px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Headline</span>
                  <Input value={form.headline} onChange={(e) => updateField("headline", e.target.value)} placeholder="Talk to Santaan IVF today" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Description</span>
                  <Input value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="WhatsApp consult + fertility guidance" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">CTA</span>
                  <select value={form.cta} onChange={(e) => updateField("cta", e.target.value)} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm">
                    {CTA_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Landing URL</span>
                  <Input value={form.landingUrl} onChange={(e) => updateField("landingUrl", e.target.value)} placeholder="https://www.santaan.in/..." />
                </label>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-medium text-gray-700">Creative brief for content writer</span>
                  <textarea value={form.creativeBrief} onChange={(e) => updateField("creativeBrief", e.target.value)} className="min-h-[110px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm" placeholder="15-20 sec reel, local language opening, doctor trust signal by 3 sec, CTA by 10 sec, subtitles compulsory." />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Content owner</span>
                  <Input value={form.contentOwnerName} onChange={(e) => updateField("contentOwnerName", e.target.value)} placeholder="Content manager / writer" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Performance owner</span>
                  <Input value={form.performanceOwnerName} onChange={(e) => updateField("performanceOwnerName", e.target.value)} placeholder="Performance marketer" />
                </label>
              </div>
            </section>

            <section>
              <h4 className="mb-3 text-sm font-semibold text-gray-900">Approval + Launch</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Workflow status</span>
                  <select
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value as MetaLaunchStatus)}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  >
                    {STATUS_ORDER.map((status) => (
                      <option key={status} value={status}>
                        {status.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
                  <p className="font-semibold text-gray-800">Launch link</p>
                  <p className="mt-1 break-all">{adsManagerLink}</p>
                </div>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-medium text-gray-700">Approval notes</span>
                  <textarea value={form.approvalNotes} onChange={(e) => updateField("approvalNotes", e.target.value)} className="min-h-[90px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm" placeholder="Ready for launch once landing and WhatsApp flow are checked." />
                </label>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-medium text-gray-700">Launch checklist</span>
                  <textarea value={form.launchChecklist} onChange={(e) => updateField("launchChecklist", e.target.value)} className="min-h-[110px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
                </label>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-medium text-gray-700">Launch notes</span>
                  <textarea value={form.launchNotes} onChange={(e) => updateField("launchNotes", e.target.value)} className="min-h-[90px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm" placeholder="Paste Meta campaign id / note any blockers after launch." />
                </label>
              </div>
            </section>

            {(notice || error) && (
              <div className={`rounded-lg border px-4 py-3 text-sm ${error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                {error || notice}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => saveDraft()} disabled={saving || !canEdit}>
                {saving ? "Saving..." : form.id ? "Update Draft" : "Create Draft"}
              </Button>
              <Button variant="outline" onClick={() => saveDraft("content_ready")} disabled={saving || !canEdit}>
                Mark Content Ready
              </Button>
              <Button variant="outline" onClick={() => saveDraft("pending_approval")} disabled={saving || !canEdit}>
                Send for Approval
              </Button>
              <Button variant="outline" onClick={() => saveDraft("approved")} disabled={saving || !canApprove}>
                Approve for Launch
              </Button>
              <Button variant="outline" onClick={() => saveDraft("launched")} disabled={saving || !canApprove}>
                Mark Launched
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Reset
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Launch Queue</h3>
              <p className="text-sm text-gray-500">Recent Meta launch drafts across content and performance.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {loading ? (
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-6 text-sm text-gray-500">Loading launch drafts...</div>
            ) : drafts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-sm text-gray-500">
                No launch drafts yet. Create the first Odisha/Bangalore launch pack here.
              </div>
            ) : (
              drafts.map((draft) => (
                <button
                  type="button"
                  key={draft.id}
                  onClick={() => {
                    setForm(mapDraftToForm(draft));
                    setNotice(null);
                    setError(null);
                  }}
                  className="w-full rounded-xl border border-gray-200 p-4 text-left transition hover:border-gray-300 hover:bg-gray-50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{draft.campaignName}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {META_ACCOUNT_OPTIONS.find((item) => item.accountId === String(draft.accountId || "").replace(/^act_/, ""))?.label || draft.accountId}
                        {" · "}
                        {draft.objective || "OUTCOME_LEADS"}
                      </p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(draft.status)}`}>
                      {String(draft.status || "draft").replace("_", " ")}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-xs text-gray-600 sm:grid-cols-2">
                    <div>Budget: {draft.budgetType || "daily"} INR {draft.budgetInr || 0}</div>
                    <div>Placements: {parsePlacements(draft.placements).join(", ") || "—"}</div>
                    <div>Content owner: {draft.contentOwnerName || "—"}</div>
                    <div>Perf owner: {draft.performanceOwnerName || "—"}</div>
                    <div>Updated: {prettyDate(draft.updatedAt)}</div>
                    <div>Approved: {prettyDate(draft.approvedAt)}</div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={draft.adsManagerLink || buildAdsManagerLink(draft.accountId)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-white"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      Open Account
                    </a>
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-xs text-gray-600">
                      UTM: {draft.utmCampaign || "—"}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
