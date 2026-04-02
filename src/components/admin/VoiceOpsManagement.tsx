"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ClipboardCheck, Copy, FileText, PhoneCall, Save, ShieldCheck } from "lucide-react";
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
    description: "Track what is live in Bolna and where the rollout stands right now.",
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
        label: "Backup / test number",
        description: "Keep one spare DID for sandbox tests, failover, or future channel expansion.",
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
