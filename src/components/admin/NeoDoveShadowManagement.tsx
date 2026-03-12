"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Link2, PhoneCall, Save, SignalHigh } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import FieldWithHelp from "@/components/admin/FieldWithHelp";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ShadowSummary {
  windowDays: number;
  totalEvents: number;
  mappedEvents: number;
  unmappedEvents: number;
  connectedCalls: number;
  qualifiedSignals: number;
  activeMappings: number;
  uniqueCampaignsSeen: number;
}

interface CampaignMapping {
  id: number;
  neodoveCampaignId: string;
  neodoveCampaignName: string;
  sourceBucket: string;
  center: string;
  utmCampaign: string;
  owner?: string | null;
  isActive?: boolean | null;
  notes?: string | null;
  updatedAt?: string;
}

interface CampaignRollup {
  campaignId: string;
  campaignName: string;
  events: number;
  mapped: number;
  connectedCalls: number;
  lastEventAt: string;
  derivedSourceBucket?: string | null;
  derivedCenter?: string | null;
}

interface ShadowEvent {
  id: number;
  eventName: string;
  eventTimestamp: string;
  campaignId?: string | null;
  campaignName?: string | null;
  leadId?: string | null;
  stageName?: string | null;
  disposition?: string | null;
  processingStatus?: string | null;
  derivedSourceBucket?: string | null;
  derivedCenter?: string | null;
  callConnected?: boolean | null;
  processingNote?: string | null;
}

interface ShadowPayload {
  summary: ShadowSummary;
  mappings: CampaignMapping[];
  byCampaign: CampaignRollup[];
  recentEvents: ShadowEvent[];
}

function StatCard({
  title,
  value,
  subtext,
  tone = "slate",
}: {
  title: string;
  value: string | number;
  subtext: string;
  tone?: "slate" | "emerald" | "amber";
}) {
  const toneClasses =
    tone === "emerald"
      ? "bg-emerald-50 border-emerald-100 text-emerald-900"
      : tone === "amber"
      ? "bg-amber-50 border-amber-100 text-amber-900"
      : "bg-white border-gray-200 text-slate-900";

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${toneClasses}`}>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      <p className="text-xs mt-1 text-slate-500">{subtext}</p>
    </div>
  );
}

const EMPTY_FORM = {
  neodoveCampaignId: "",
  neodoveCampaignName: "",
  sourceBucket: "",
  center: "network",
  utmCampaign: "",
  owner: "",
  notes: "",
};

export default function NeoDoveShadowManagement() {
  const [payload, setPayload] = useState<ShadowPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  async function loadSnapshot() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/neodove-shadow");
      const nextPayload = await response.json();
      if (!response.ok) {
        throw new Error(nextPayload?.error || "Failed to fetch NeoDove shadow dashboard");
      }
      setPayload(nextPayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch NeoDove shadow dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSnapshot();
  }, []);

  async function saveMapping() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/neodove-shadow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const nextPayload = await response.json();
      if (!response.ok) {
        throw new Error(nextPayload?.error || "Failed to save mapping");
      }
      setNotice(`Saved mapping for ${form.neodoveCampaignName}.`);
      setForm(EMPTY_FORM);
      await loadSnapshot();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save mapping");
    } finally {
      setSaving(false);
    }
  }

  const unmappedCampaigns = useMemo(
    () => (payload?.byCampaign || []).filter((campaign) => !campaign.derivedSourceBucket).slice(0, 8),
    [payload]
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Shadow mode</p>
            <h2 className="text-2xl font-semibold mt-2">NeoDove Event Ingestion</h2>
            <p className="text-sm text-slate-200 mt-2 max-w-3xl">
              This view captures NeoDove traffic in parallel without changing current CRM attribution. Use it to validate
              campaign mapping, queue discipline, and webhook health before we promote NeoDove into the primary lead-truth layer.
            </p>
          </div>
          <Button variant="outline" onClick={loadSnapshot} className="border-white/20 text-white hover:bg-white/10">
            Refresh Shadow Health
          </Button>
        </div>
      </div>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      {notice ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Events in last 7 days"
          value={payload?.summary.totalEvents ?? "—"}
          subtext="Every NeoDove webhook captured in shadow mode."
        />
        <StatCard
          title="Mapped events"
          value={payload?.summary.mappedEvents ?? "—"}
          subtext="Events that already match a NeoDove campaign mapping."
          tone="emerald"
        />
        <StatCard
          title="Unmapped events"
          value={payload?.summary.unmappedEvents ?? "—"}
          subtext="These are the campaigns still breaking attribution."
          tone="amber"
        />
        <StatCard
          title="Connected calls"
          value={payload?.summary.connectedCalls ?? "—"}
          subtext="Shadow signal from call-connected events."
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-santaan-teal" />
            <h3 className="text-lg font-semibold text-gray-900">Create or update NeoDove campaign mapping</h3>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            One row here becomes the bridge from NeoDove campaign to Santaan source bucket, center, and reporting UTM.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <FieldWithHelp label="NeoDove Campaign ID" required help="Use the exact NeoDove campaign ID from the admin team.">
              <Input value={form.neodoveCampaignId} onChange={(e) => setForm((p) => ({ ...p, neodoveCampaignId: e.target.value }))} placeholder="be8ef37e-c0cd-..." />
            </FieldWithHelp>
            <FieldWithHelp label="NeoDove Campaign Name" required help="Use the exact campaign name visible in NeoDove.">
              <Input value={form.neodoveCampaignName} onChange={(e) => setForm((p) => ({ ...p, neodoveCampaignName: e.target.value }))} placeholder="META_BBSR_CALL" />
            </FieldWithHelp>
            <FieldWithHelp label="Source Bucket" required help="Stable source bucket used in Growth OS reporting. Example: meta_bbsr_call.">
              <Input value={form.sourceBucket} onChange={(e) => setForm((p) => ({ ...p, sourceBucket: e.target.value }))} placeholder="meta_bbsr_call" />
            </FieldWithHelp>
            <FieldWithHelp label="Center" required help="Use bbsr, bam, blr, ang, or network.">
              <Input value={form.center} onChange={(e) => setForm((p) => ({ ...p, center: e.target.value.toLowerCase() }))} placeholder="bbsr" />
            </FieldWithHelp>
            <FieldWithHelp label="UTM Campaign" required help="This is what the CRM will use later for campaign-level attribution.">
              <Input value={form.utmCampaign} onChange={(e) => setForm((p) => ({ ...p, utmCampaign: e.target.value }))} placeholder="bbsr_call_leads_campaign" />
            </FieldWithHelp>
            <FieldWithHelp label="Owner" help="Who owns this queue or campaign mapping.">
              <Input value={form.owner} onChange={(e) => setForm((p) => ({ ...p, owner: e.target.value }))} placeholder="Agency SPOC / Telecalling Lead" />
            </FieldWithHelp>
          </div>

          <div className="mt-3">
            <FieldWithHelp label="Notes" help="Use this for number mapping, IVR details, or rollout comments.">
              <textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                className="w-full min-h-[92px] rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Example: routes to Bhubaneswar paid-call line; owned by NeoDove Team Lead."
              />
            </FieldWithHelp>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={saveMapping} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Mapping"}
            </Button>
            <Button variant="outline" onClick={() => setForm(EMPTY_FORM)} disabled={saving}>
              Reset
            </Button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-900">Immediate action queue</h3>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            These campaigns were seen in NeoDove but are not mapped yet. They are the highest-priority blockers for attribution.
          </p>
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-gray-500">Loading shadow events...</p>
            ) : unmappedCampaigns.length === 0 ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                All recently seen NeoDove campaigns are mapped. This is the state we want before turning on full automation.
              </div>
            ) : (
              unmappedCampaigns.map((campaign) => (
                <div key={`${campaign.campaignId}-${campaign.campaignName}`} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="font-medium text-amber-900">{campaign.campaignName}</p>
                  <p className="text-xs text-amber-800 mt-1">Campaign ID: {campaign.campaignId || "not provided"}</p>
                  <p className="text-xs text-amber-800 mt-1">
                    Events: {campaign.events} | Connected calls: {campaign.connectedCalls}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
          <SignalHigh className="w-4 h-4 text-santaan-teal" />
          <h3 className="text-lg font-semibold text-gray-900">Campaign coverage</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Source bucket</TableHead>
              <TableHead>Center</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>Mapped</TableHead>
              <TableHead>Connected</TableHead>
              <TableHead>Last event</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Loading campaign coverage...
                </TableCell>
              </TableRow>
            ) : (payload?.byCampaign || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No NeoDove events captured yet.
                </TableCell>
              </TableRow>
            ) : (
              payload?.byCampaign.map((campaign) => (
                <TableRow key={`${campaign.campaignId}-${campaign.campaignName}`}>
                  <TableCell>
                    <div className="font-medium text-gray-900">{campaign.campaignName}</div>
                    <div className="text-xs text-gray-500">{campaign.campaignId || "No campaign ID in event"}</div>
                  </TableCell>
                  <TableCell>{campaign.derivedSourceBucket || <span className="text-amber-700">Unmapped</span>}</TableCell>
                  <TableCell>{campaign.derivedCenter || "—"}</TableCell>
                  <TableCell>{campaign.events}</TableCell>
                  <TableCell>{campaign.mapped}</TableCell>
                  <TableCell>{campaign.connectedCalls}</TableCell>
                  <TableCell className="text-xs text-gray-500">{campaign.lastEventAt || "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-santaan-teal" />
            <h3 className="text-lg font-semibold text-gray-900">Active campaign mappings</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <p className="px-5 py-6 text-sm text-gray-500">Loading mappings...</p>
            ) : (payload?.mappings || []).length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-500">No NeoDove campaign mappings saved yet.</p>
            ) : (
              payload?.mappings.map((mapping) => (
                <div key={mapping.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{mapping.neodoveCampaignName}</p>
                      <p className="text-xs text-gray-500 mt-1">Campaign ID: {mapping.neodoveCampaignId}</p>
                      <p className="text-sm text-gray-700 mt-2">
                        {mapping.sourceBucket} → {mapping.center} → {mapping.utmCampaign}
                      </p>
                      {mapping.notes ? <p className="text-xs text-gray-500 mt-2">{mapping.notes}</p> : null}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${mapping.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {mapping.isActive ? "Active" : "Paused"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-santaan-teal" />
            <h3 className="text-lg font-semibold text-gray-900">Recent NeoDove events</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-[520px] overflow-y-auto">
            {loading ? (
              <p className="px-5 py-6 text-sm text-gray-500">Loading recent events...</p>
            ) : (payload?.recentEvents || []).length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-500">No shadow events captured yet.</p>
            ) : (
              payload?.recentEvents.map((event) => (
                <div key={event.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{event.eventName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {event.campaignName || "Unknown campaign"} {event.leadId ? `• lead ${event.leadId}` : ""}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Stage: {event.stageName || "—"} | Disposition: {event.disposition || "—"} | Connected:{" "}
                        {event.callConnected ? "yes" : "no"}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">{event.processingNote || "Shadow event logged."}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          event.processingStatus === "mapped" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {event.processingStatus}
                      </span>
                      <p className="text-xs text-gray-500 mt-2">{event.eventTimestamp}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
        <div className="flex items-start gap-3">
          <PhoneCall className="w-4 h-4 mt-0.5 text-slate-500" />
          <div>
            <p className="font-medium text-slate-900">How to use shadow mode</p>
            <p className="mt-1">
              First, let NeoDove events accumulate here. Second, map every live NeoDove campaign to a source bucket and UTM campaign.
              Only after mapped events become stable should we promote NeoDove data into campaign-level lead truth in Santaan CRM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
