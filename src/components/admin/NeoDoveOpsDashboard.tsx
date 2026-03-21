"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, GitCompareArrows, RefreshCw, UserRoundX, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";

type ExceptionRow = {
  id: number;
  name: string;
  phone?: string | null;
  status: string;
  ownerName?: string | null;
  neodoveOwnerName?: string | null;
  nextFollowUpAt?: string | null;
  neodoveLeadId?: string | null;
  neodoveMappedStatus?: string | null;
  neodoveLastSyncAt?: string | null;
  reasons: string[];
  reasonLabels: string[];
};

type EventRow = {
  id: number;
  eventKey: string;
  eventName: string;
  leadId?: string | null;
  mobile?: string | null;
  campaign?: string | null;
  mappedStatus?: string | null;
  assignedTo?: string | null;
  followUpAt?: string | null;
  receivedAt?: string | null;
  processedAt?: string | null;
  processStatus?: string | null;
  isDuplicate: boolean;
  errorMessage?: string | null;
};

type ReconciliationPayload = {
  ok: boolean;
  windowDays: number;
  summary: {
    trackedContacts: number;
    activeContacts: number;
    exceptionCount: number;
    duplicateEvents: number;
    errorEvents: number;
    processedEvents: number;
    missingOwner: number;
    missingFollowUp: number;
    statusDrift: number;
    staleSync: number;
  };
  exceptions: ExceptionRow[];
  recentEvents: EventRow[];
};

function prettyDate(value?: string | null) {
  if (!value) return "—";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleString("en-IN");
}

export default function NeoDoveOpsDashboard() {
  const [payload, setPayload] = useState<ReconciliationPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/neodove/reconciliation", { cache: "no-store" });
      const result = (await response.json()) as ReconciliationPayload & { error?: string };
      if (!response.ok) throw new Error(result?.error || "Failed to load NeoDove reconciliation");
      setPayload(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load NeoDove reconciliation");
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const summaryCards = useMemo(() => {
    if (!payload) return [];
    return [
      { label: "Tracked NeoDove Leads", value: payload.summary.trackedContacts, icon: Users, tone: "slate" },
      { label: "Active Leads", value: payload.summary.activeContacts, icon: CheckCircle2, tone: "emerald" },
      { label: "Exceptions", value: payload.summary.exceptionCount, icon: AlertTriangle, tone: "rose" },
      { label: "Missing Follow-up", value: payload.summary.missingFollowUp, icon: Clock3, tone: "amber" },
      { label: "Missing Owner", value: payload.summary.missingOwner, icon: UserRoundX, tone: "rose" },
      { label: "Status Drift", value: payload.summary.statusDrift, icon: GitCompareArrows, tone: "amber" },
    ];
  }, [payload]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">NeoDove Ops Reconciliation</h3>
            <p className="text-sm text-gray-600 mt-1">
              Use this view to catch owner gaps, missing follow-ups, stale sync, and duplicate/error webhooks before leads leak out of the funnel.
            </p>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        {error ? <p className="text-sm text-rose-700 mt-3">{error}</p> : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">{card.label}</p>
              <card.icon className="w-4 h-4 text-gray-500" />
            </div>
            <p className="text-2xl font-semibold text-gray-900 mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h4 className="text-base font-semibold text-gray-900">Priority Exceptions</h4>
            <p className="text-xs text-gray-500 mt-1">Top leads that need CRM Ops or IVR manager intervention now.</p>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-5 text-sm text-gray-500">Loading exceptions...</div>
            ) : !payload || payload.exceptions.length === 0 ? (
              <div className="p-5 text-sm text-emerald-700">No active NeoDove exceptions found in the current window.</div>
            ) : (
              payload.exceptions.map((item) => (
                <div key={item.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.phone || "No phone"} · CRM {item.status} · NeoDove {item.neodoveMappedStatus || "—"}
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <p>Owner: {item.ownerName || "—"}</p>
                      <p>NeoDove owner: {item.neodoveOwnerName || "—"}</p>
                      <p>Next follow-up: {prettyDate(item.nextFollowUpAt)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.reasonLabels.map((reason) => (
                      <span key={reason} className="px-2 py-1 rounded-full text-[11px] bg-rose-50 text-rose-700 border border-rose-100">
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h4 className="text-base font-semibold text-gray-900">Recent NeoDove Events</h4>
            <p className="text-xs text-gray-500 mt-1">Webhook audit trail with duplicate/error visibility.</p>
          </div>
          <div className="divide-y divide-gray-100 max-h-[620px] overflow-y-auto">
            {loading ? (
              <div className="p-5 text-sm text-gray-500">Loading recent events...</div>
            ) : !payload || payload.recentEvents.length === 0 ? (
              <div className="p-5 text-sm text-gray-500">No NeoDove events recorded yet.</div>
            ) : (
              payload.recentEvents.map((event) => (
                <div key={`${event.id}-${event.eventKey}`} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {event.eventName} {event.isDuplicate ? "(duplicate)" : ""}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        lead {event.leadId || "—"} · {event.mobile || "—"} · {event.campaign || "—"}
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <p>Status: {event.mappedStatus || "—"}</p>
                      <p>Owner: {event.assignedTo || "—"}</p>
                      <p>{prettyDate(event.receivedAt)}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="px-2 py-1 rounded-full text-[11px] bg-slate-50 text-slate-700 border border-slate-200">
                      {event.processStatus || "received"}
                    </span>
                    {event.followUpAt ? (
                      <span className="px-2 py-1 rounded-full text-[11px] bg-amber-50 text-amber-700 border border-amber-200">
                        follow-up {prettyDate(event.followUpAt)}
                      </span>
                    ) : null}
                    {event.errorMessage ? (
                      <span className="px-2 py-1 rounded-full text-[11px] bg-rose-50 text-rose-700 border border-rose-200">
                        {event.errorMessage}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
