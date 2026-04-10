"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  ExternalLink,
  FileText,
  Link2,
  PhoneCall,
  Save,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";

interface VoiceOpsDoc {
  id: string;
  title: string;
  category: string;
  fileName: string;
  extension: string;
  contentType: string;
  content: string;
}

interface VoiceOpsPayload {
  ok: boolean;
  canManage: boolean;
  docs: VoiceOpsDoc[];
  qa: {
    latestCallAt: string;
    currentRouting: {
      mainBolnaNumber: string;
      tvBolnaNumber: string;
      backupNumber: string;
      mainEdesyNumber: string;
      tvEdesyNumber: string;
      mainEdesyAgentName: string;
      mainEdesyAgentId: string;
      rolloutStatus: string;
    };
    stats: {
      total: number;
      completed: number;
      transcriptReady: number;
      summaryReady: number;
      crmLinked: number;
      neodovePushed: number;
      whatsappSent: number;
      failedOps: number;
    };
    recentCalls: Array<{
      id: number;
      eventKey: string;
      provider: string;
      callStatus: string;
      entryPoint: string;
      callerName: string;
      contactName: string;
      fromNumber: string;
      toNumber: string;
      durationSec: number;
      receivedAt: string;
      processStatus: string;
      neodovePushStatus: string;
      whatsappPushStatus: string;
      hasTranscriptArtifact: boolean;
      hasSummary: boolean;
      transcriptUrl: string;
      summary: string;
    }>;
  };
  settings: Record<string, string>;
  updatedAt: string;
}

type VoiceField = {
  key: string;
  label: string;
  description: string;
  placeholder?: string;
  multiline?: boolean;
  readOnly?: boolean;
};

type VoiceFieldSection = {
  title: string;
  description: string;
  fields: VoiceField[];
};

const FIELD_SECTIONS: VoiceFieldSection[] = [
  {
    title: "Live Deployment",
    description: "Track what is live across Bolna and Edesy and where the rollout stands right now.",
    fields: [
      {
        key: "VOICE_AGENT_ROLLOUT_STATUS",
        label: "Rollout status",
        description: "Suggested values: draft, qa, pilot, limited-live, live, paused.",
        placeholder: "pilot",
      },
      {
        key: "VOICE_AGENT_MAIN_NUMBER",
        label: "Main line number",
        description: "Public DID or routed VoBiz number for the main inbound line.",
        placeholder: "+91XXXXXXXXXX",
      },
      {
        key: "VOICE_AGENT_TV_NUMBER",
        label: "TV line number",
        description: "Public DID or routed VoBiz number for TV / awareness traffic.",
        placeholder: "+91XXXXXXXXXX",
      },
      {
        key: "VOICE_AGENT_BACKUP_NUMBER",
        label: "Fallback capture number",
        description: "Use this when live voice QA fails. It should remain a normal call path that still registers the caller in CRM.",
        placeholder: "+91XXXXXXXXXX",
      },
      {
        key: "VOICE_AGENT_MAIN_BOLNA_AGENT_ID",
        label: "Main Bolna agent ID",
        description: "Used as routing fallback when phone number formatting is inconsistent.",
        placeholder: "agent_xxxxx",
      },
      {
        key: "VOICE_AGENT_TV_BOLNA_AGENT_ID",
        label: "TV Bolna agent ID",
        description: "Used as routing fallback for TV calls.",
        placeholder: "agent_xxxxx",
      },
      {
        key: "VOICE_AGENT_MAIN_BOLNA_AGENT_NAME",
        label: "Main Bolna agent name",
        description: "Human-readable fallback label, for example Santaan Main Inbound.",
        placeholder: "Santaan Main Inbound",
      },
      {
        key: "VOICE_AGENT_TV_BOLNA_AGENT_NAME",
        label: "TV Bolna agent name",
        description: "Human-readable fallback label, for example Santaan TV Inbound.",
        placeholder: "Santaan TV Inbound",
      },
      {
        key: "VOICE_AGENT_MAIN_EDESY_NUMBER",
        label: "Main Edesy number",
        description: "Edesy-linked main inbound number or staging test number.",
        placeholder: "+91XXXXXXXXXX",
      },
      {
        key: "VOICE_AGENT_TV_EDESY_NUMBER",
        label: "TV Edesy number",
        description: "Edesy-linked TV or campaign-specific number when routed separately.",
        placeholder: "+91XXXXXXXXXX",
      },
      {
        key: "VOICE_AGENT_MAIN_EDESY_AGENT_ID",
        label: "Main Edesy agent ID",
        description: "Primary Edesy agent ID for main-line routing and verification.",
        placeholder: "5614",
      },
      {
        key: "VOICE_AGENT_TV_EDESY_AGENT_ID",
        label: "TV Edesy agent ID",
        description: "TV or alternate Edesy agent ID when campaign routing is split.",
        placeholder: "agent_xxxxx",
      },
      {
        key: "VOICE_AGENT_MAIN_EDESY_AGENT_NAME",
        label: "Main Edesy agent name",
        description: "Human-readable Edesy agent label, for example Swara - Santaan Odia.",
        placeholder: "Swara - Santaan Odia",
      },
      {
        key: "VOICE_AGENT_TV_EDESY_AGENT_NAME",
        label: "TV Edesy agent name",
        description: "Human-readable Edesy label for TV or awareness traffic if used.",
        placeholder: "Swara TV",
      },
    ],
  },
  {
    title: "Prompt Governance",
    description: "Keep the live voice behavior tied to explicit owners and approved prompt versions.",
    fields: [
      {
        key: "VOICE_AGENT_MAIN_PROMPT_VERSION",
        label: "Main prompt version",
        description: "Approved version currently live on the main line.",
        placeholder: "main-v1",
      },
      {
        key: "VOICE_AGENT_TV_PROMPT_VERSION",
        label: "TV prompt version",
        description: "Approved version currently live on the TV line.",
        placeholder: "tv-v1",
      },
      {
        key: "VOICE_AGENT_CLINICAL_REVIEW_OWNER",
        label: "Clinical review owner",
        description: "Doctor or senior clinical reviewer responsible for accuracy sign-off.",
        placeholder: "clinical@santaan.in",
      },
      {
        key: "VOICE_AGENT_OPS_OWNER",
        label: "Ops owner",
        description: "Operational owner accountable for quality, monitoring, and vendor setup.",
        placeholder: "ops@santaan.in",
      },
    ],
  },
  {
    title: "QA And Risk Log",
    description: "Use this area to keep the latest review and operating risk visible to the whole team.",
    fields: [
      {
        key: "VOICE_AGENT_LAST_QA_REVIEW_AT",
        label: "Last QA review at",
        description: "Store the most recent structured QA review date/time in ISO or plain text.",
        placeholder: "2026-04-02 18:30 IST",
      },
      {
        key: "VOICE_AGENT_LAST_QA_REVIEWER",
        label: "Last QA reviewer",
        description: "Who performed the latest quality pass or call review.",
        placeholder: "qa.lead@santaan.in",
      },
      {
        key: "VOICE_AGENT_LATEST_QA_SCORE",
        label: "Latest QA score",
        description: "Use the score from the reviewer sheet or QA scorecard.",
        placeholder: "44/50",
      },
      {
        key: "VOICE_AGENT_OPEN_RISKS",
        label: "Open risks",
        description: "Current issues, unsafe edge cases, vendor blockers, or gaps still being watched.",
        placeholder: "TV prompt too long for low-intent callers; Bhash template still pending.",
        multiline: true,
      },
      {
        key: "VOICE_AGENT_CHANGE_NOTES",
        label: "Change notes",
        description: "Short note on what changed in the live setup or what should change next.",
        placeholder: "Shifted IVF explanation later in the call and softened callback ask.",
        multiline: true,
      },
    ],
  },
  {
    title: "Audit Trail",
    description: "System-managed metadata to show the latest configuration write inside this panel.",
    fields: [
      {
        key: "VOICE_AGENT_LAST_UPDATED_BY",
        label: "Last updated by",
        description: "Automatically updated when someone saves a voice-ops field here.",
        readOnly: true,
      },
      {
        key: "VOICE_AGENT_LAST_UPDATED_AT",
        label: "Last updated at",
        description: "Automatically updated when someone saves a voice-ops field here.",
        readOnly: true,
      },
    ],
  },
];

function isMultilineField(field: VoiceField) {
  return Boolean(field.multiline);
}

function prettyDate(value?: string | null) {
  const raw = String(value || "").trim();
  if (!raw) return "Not yet";
  const millis = Date.parse(raw);
  if (!Number.isFinite(millis)) return raw;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(millis));
}

function titleizeToken(value?: string | null) {
  const token = String(value || "").trim();
  if (!token) return "Unknown";
  return token
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function badgeTone(value?: string | null) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["completed", "processed", "pushed", "sent", "live", "pilot", "linked_pending_live_calls"].includes(normalized)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (["pending", "received", "processing", "qa", "draft", "limited live", "limited-live"].includes(normalized)) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  if (["failed", "error", "skipped", "ignored"].includes(normalized)) {
    return "border-red-200 bg-red-50 text-red-800";
  }
  return "border-gray-200 bg-gray-50 text-gray-700";
}

export default function VoiceOpsManagement() {
  const [payload, setPayload] = useState<VoiceOpsPayload | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [dirtyKeys, setDirtyKeys] = useState<string[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchVoiceOps() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/voice-ops", { cache: "no-store" });
      const nextPayload = (await response.json()) as VoiceOpsPayload | { error?: string };
      if (!response.ok || !("ok" in nextPayload)) {
        throw new Error(("error" in nextPayload && nextPayload.error) || "Failed to load voice ops");
      }

      setPayload(nextPayload);
      setSettings(nextPayload.settings || {});
      setDirtyKeys([]);
      setSelectedDocId((prev) => prev || nextPayload.docs?.[0]?.id || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load voice ops");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVoiceOps();
  }, []);

  const selectedDoc = useMemo(
    () => payload?.docs.find((doc) => doc.id === selectedDocId) || payload?.docs[0] || null,
    [payload?.docs, selectedDocId]
  );

  const groupedDocs = useMemo(() => {
    const docs = payload?.docs || [];
    return docs.reduce(
      (acc, doc) => {
        if (!acc[doc.category]) acc[doc.category] = [];
        acc[doc.category].push(doc);
        return acc;
      },
      {} as Record<string, VoiceOpsDoc[]>
    );
  }, [payload?.docs]);

  const dirtyCount = dirtyKeys.length;
  const canManage = Boolean(payload?.canManage);

  function updateSetting(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setDirtyKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }

  async function saveAll() {
    if (!canManage) {
      setError("You have read-only access to voice operations.");
      return;
    }
    if (dirtyKeys.length === 0) {
      setNotice("No pending voice-ops changes.");
      return;
    }

    setSaving(true);
    setNotice(null);
    setError(null);
    try {
      for (const key of dirtyKeys) {
        const response = await fetch("/api/admin/voice-ops", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value: settings[key] ?? "" }),
        });
        const nextPayload = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(nextPayload.error || `Failed to save ${key}`);
        }
      }

      await fetchVoiceOps();
      setNotice(`Saved ${dirtyKeys.length} voice-ops field(s).`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save voice-ops changes");
    } finally {
      setSaving(false);
    }
  }

  async function copySelectedDoc() {
    if (!selectedDoc) return;
    try {
      await navigator.clipboard.writeText(selectedDoc.content);
      setNotice(`Copied ${selectedDoc.title}.`);
    } catch {
      setError("Unable to copy document to clipboard.");
    }
  }

  const cards = [
    {
      label: "Rollout",
      value: settings.VOICE_AGENT_ROLLOUT_STATUS || "Not set",
      icon: ShieldCheck,
    },
    {
      label: "Main Prompt",
      value: settings.VOICE_AGENT_MAIN_PROMPT_VERSION || "Not set",
      icon: PhoneCall,
    },
    {
      label: "TV Prompt",
      value: settings.VOICE_AGENT_TV_PROMPT_VERSION || "Not set",
      icon: PhoneCall,
    },
    {
      label: "Latest QA",
      value: settings.VOICE_AGENT_LATEST_QA_SCORE || "Not scored",
      icon: ClipboardCheck,
    },
  ];

  const qaCards = [
    {
      label: "Recent Calls",
      value: String(payload?.qa.stats.total ?? 0),
      hint: `${payload?.qa.stats.completed ?? 0} completed`,
    },
    {
      label: "Transcript Artifacts",
      value: String(payload?.qa.stats.transcriptReady ?? 0),
      hint: `${payload?.qa.stats.summaryReady ?? 0} summaries`,
    },
    {
      label: "CRM Linked",
      value: String(payload?.qa.stats.crmLinked ?? 0),
      hint: `${payload?.qa.stats.neodovePushed ?? 0} NeoDove pushed`,
    },
    {
      label: "WhatsApp Sent",
      value: String(payload?.qa.stats.whatsappSent ?? 0),
      hint: `${payload?.qa.stats.failedOps ?? 0} ops errors`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <PhoneCall className="h-4 w-4 text-santaan-teal" />
              Voice Ops
            </h3>
            <p className="mt-1 max-w-3xl text-sm text-gray-600">
              Govern the Santaan voice agent from one place: live routing metadata, approved prompt versions,
              QA status, risk notes, and the repo-backed operating documents.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={fetchVoiceOps} disabled={loading || saving}>
              Refresh
            </Button>
            <Button onClick={saveAll} disabled={saving || loading || dirtyCount === 0 || !canManage}>
              <Save className="mr-2 h-4 w-4" />
              Save {dirtyCount > 0 ? `(${dirtyCount})` : ""}
            </Button>
          </div>
        </div>

        {!canManage ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This view is read-only for your role. Leadership and telecalling managers can update live voice-ops
            fields from here.
          </div>
        ) : null}

        {notice ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {notice}
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                <card.icon className="h-4 w-4 text-santaan-teal" />
                {card.label}
              </div>
              <div className="mt-2 text-lg font-semibold text-gray-900">{card.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.95fr]">
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h4 className="text-base font-semibold text-gray-900">Voice QA cockpit</h4>
                <p className="mt-1 text-sm text-gray-600">
                  A non-technical operating view for live voice routing, the latest calls, and whether the CRM pipeline is healthy.
                </p>
              </div>
              <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
                Last call: {prettyDate(payload?.qa.latestCallAt)}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {qaCards.map((card) => (
                <div key={card.label} className="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">{card.value}</p>
                  <p className="mt-1 text-xs text-gray-500">{card.hint}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm font-semibold text-gray-900">Live routing</p>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
                    <span>Rollout</span>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${badgeTone(payload?.qa.currentRouting.rolloutStatus)}`}>
                      {titleizeToken(payload?.qa.currentRouting.rolloutStatus)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
                    <span>Edesy main line</span>
                    <span className="font-medium text-gray-900">{payload?.qa.currentRouting.mainEdesyNumber || "Not set"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
                    <span>Edesy agent</span>
                    <span className="font-medium text-gray-900">
                      {payload?.qa.currentRouting.mainEdesyAgentName || "Not set"}
                      {payload?.qa.currentRouting.mainEdesyAgentId ? ` (${payload?.qa.currentRouting.mainEdesyAgentId})` : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
                    <span>Bolna main line</span>
                    <span className="font-medium text-gray-900">{payload?.qa.currentRouting.mainBolnaNumber || "Not set"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
                    <span>TV line</span>
                    <span className="font-medium text-gray-900">
                      {payload?.qa.currentRouting.tvEdesyNumber || payload?.qa.currentRouting.tvBolnaNumber || "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
                    <span>Fallback capture line</span>
                    <span className="font-medium text-gray-900">{payload?.qa.currentRouting.backupNumber || "Not set"}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm font-semibold text-gray-900">How to review a live test</p>
                <div className="mt-3 space-y-3 text-sm text-gray-700">
                  <div className="flex items-start gap-3 rounded-lg bg-gray-50 px-3 py-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-santaan-teal" />
                    <div>
                      <p className="font-medium text-gray-900">Caller-side</p>
                      <p className="text-xs text-gray-600">Check greeting, warmth, pause handling, interruption handling, and whether Swara gives a clear next step.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg bg-gray-50 px-3 py-3">
                    <Link2 className="mt-0.5 h-4 w-4 text-santaan-teal" />
                    <div>
                      <p className="font-medium text-gray-900">CRM-side</p>
                      <p className="text-xs text-gray-600">Check whether the call row appears below, whether a transcript artifact exists, and whether CRM / NeoDove / WhatsApp statuses are healthy.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg bg-gray-50 px-3 py-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-santaan-amber" />
                    <div>
                      <p className="font-medium text-gray-900">Escalate when</p>
                      <p className="text-xs text-gray-600">wrong persona, no answer, transcript missing repeatedly, or any CRM push shows error.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg bg-amber-50 px-3 py-3">
                    <PhoneCall className="mt-0.5 h-4 w-4 text-santaan-amber" />
                    <div>
                      <p className="font-medium text-gray-900">Operational fallback</p>
                      <p className="text-xs text-gray-600">
                        If Swara voice QA is failing, route the caller to the fallback capture line so the call still completes as a normal inquiry and the caller is registered in CRM.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">Latest voice calls</p>
                <p className="mt-1 text-xs text-gray-500">This table is designed for non-tech QA first and technical drill-down second.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Call</th>
                      <th className="px-4 py-3 font-medium">Routing</th>
                      <th className="px-4 py-3 font-medium">Transcript</th>
                      <th className="px-4 py-3 font-medium">CRM</th>
                      <th className="px-4 py-3 font-medium">Ops</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {(payload?.qa.recentCalls || []).length ? (
                      payload?.qa.recentCalls.map((call) => (
                        <tr key={call.id}>
                          <td className="px-4 py-3 align-top">
                            <div className="space-y-1">
                              <p className="font-medium text-gray-900">
                                {call.contactName || call.callerName || call.fromNumber || "Unknown caller"}
                              </p>
                              <p className="text-xs text-gray-500">{prettyDate(call.receivedAt)}</p>
                              <p className="text-xs text-gray-600">
                                {call.fromNumber || "Unknown"} {call.toNumber ? `→ ${call.toNumber}` : ""}
                              </p>
                              <p className="text-xs text-gray-600">
                                {call.durationSec ? `${call.durationSec}s` : "Duration unavailable"}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="space-y-2">
                              <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${badgeTone(call.callStatus)}`}>
                                {titleizeToken(call.callStatus)}
                              </span>
                              <p className="text-xs text-gray-600">
                                {titleizeToken(call.provider)} · {titleizeToken(call.entryPoint)}
                              </p>
                              <p className="text-[11px] text-gray-500 break-all">{call.eventKey}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="space-y-2">
                              <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${badgeTone(call.hasTranscriptArtifact ? "processed" : "pending")}`}>
                                {call.hasTranscriptArtifact ? "Artifact ready" : "Missing"}
                              </span>
                              <p className="text-xs text-gray-600">
                                Summary: {call.hasSummary ? "Available" : "Missing"}
                              </p>
                              {call.transcriptUrl ? (
                                <a
                                  href={call.transcriptUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-medium text-santaan-teal hover:underline"
                                >
                                  Open artifact <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="space-y-2">
                              <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${badgeTone(call.processStatus)}`}>
                                {titleizeToken(call.processStatus)}
                              </span>
                              <p className="text-xs text-gray-600">
                                Contact: {call.contactName ? "Linked" : "Unlinked"}
                              </p>
                              {call.summary ? (
                                <p className="line-clamp-3 text-xs leading-5 text-gray-500">{call.summary}</p>
                              ) : (
                                <p className="text-xs text-gray-400">No summary captured yet.</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="space-y-2">
                              <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${badgeTone(call.neodovePushStatus)}`}>
                                NeoDove: {titleizeToken(call.neodovePushStatus)}
                              </span>
                              <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${badgeTone(call.whatsappPushStatus)}`}>
                                WhatsApp: {titleizeToken(call.whatsappPushStatus)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                          No voice-call logs have landed yet. Once a live test call completes, the Voice QA cockpit will start filling in automatically.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {FIELD_SECTIONS.map((section) => (
            <div key={section.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h4 className="text-base font-semibold text-gray-900">{section.title}</h4>
                <p className="mt-1 text-sm text-gray-600">{section.description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {section.fields.map((field) => {
                  const value = settings[field.key] || "";
                  const isReadOnly = Boolean(field.readOnly) || (!canManage && !field.readOnly);
                  const isWide = isMultilineField(field);

                  return (
                    <div key={field.key} className={isWide ? "md:col-span-2" : ""}>
                      <label className="block text-sm font-medium text-gray-900">{field.label}</label>
                      <p className="mt-1 text-xs leading-5 text-gray-500">{field.description}</p>
                      {isWide ? (
                        <textarea
                          value={value}
                          onChange={(event) => updateSetting(field.key, event.target.value)}
                          placeholder={field.placeholder}
                          readOnly={isReadOnly}
                          className="mt-2 min-h-[120px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50"
                        />
                      ) : (
                        <Input
                          value={value}
                          onChange={(event) => updateSetting(field.key, event.target.value)}
                          placeholder={field.placeholder}
                          readOnly={isReadOnly}
                          disabled={isReadOnly}
                          className="mt-2"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h4 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                <FileText className="h-4 w-4 text-santaan-teal" />
                Approved Voice Docs
              </h4>
              <p className="mt-1 text-sm text-gray-600">
                These files are loaded from the repo so the operating truth stays versioned and reviewable.
              </p>
            </div>
            <Button variant="outline" onClick={copySelectedDoc} disabled={!selectedDoc}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Doc
            </Button>
          </div>

          {loading && !payload ? (
            <div className="py-12 text-sm text-gray-500">Loading voice operations...</div>
          ) : null}

          {!loading && payload ? (
            <div className="mt-5 space-y-5">
              <div className="space-y-4">
                {Object.entries(groupedDocs).map(([category, docs]) => (
                  <div key={category}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{category}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {docs.map((doc) => (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => setSelectedDocId(doc.id)}
                          className={`rounded-full border px-3 py-1.5 text-sm transition ${
                            selectedDoc?.id === doc.id
                              ? "border-santaan-teal bg-santaan-teal/10 text-santaan-teal"
                              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {doc.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {selectedDoc ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50/40">
                  <div className="border-b border-gray-200 px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{selectedDoc.title}</p>
                      <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-600">
                        {selectedDoc.fileName}
                      </span>
                    </div>
                    {selectedDoc.extension === ".csv" ? (
                      <p className="mt-2 flex items-center gap-2 text-xs text-amber-700">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        CSV is shown as plain text for quick review inside the CRM.
                      </p>
                    ) : null}
                  </div>
                  <pre className="max-h-[780px] overflow-auto whitespace-pre-wrap px-4 py-4 text-xs leading-6 text-gray-800">
                    {selectedDoc.content}
                  </pre>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-sm text-gray-500">
                  No approved voice documents were found in the repo.
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
