"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, Loader2, Target, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";

type OpsStatus = "pending" | "in_progress" | "done" | "blocked";
type OpsSlot = "morning" | "midday" | "afternoon" | "evening";

interface OpsProfile {
  key: string;
  label: string;
  role: string;
  center: string;
}

interface OpsTaskRow {
  date: string;
  profileKey: string;
  profileLabel: string;
  role: string;
  center: string;
  taskCode: string;
  slot: OpsSlot;
  timeLabel: string;
  title: string;
  inputTarget: string;
  sla: string;
  ownerHint: string;
  status: OpsStatus;
  note: string;
  updatedByEmail: string | null;
  updatedByName: string | null;
  updatedAt: string | null;
}

interface OpsSummaryRow {
  profileKey: string;
  profileLabel: string;
  center: string;
  total: number;
  done: number;
  inProgress: number;
  blocked: number;
  pending: number;
  completionRate: number;
}

interface OpsPayload {
  date: string;
  role: string | null;
  defaultProfileKey: string;
  profiles: OpsProfile[];
  tasks: OpsTaskRow[];
  summary: OpsSummaryRow[];
}

type PerformanceRecommendation = {
  campaign: string;
  qualified: number;
  spend: number;
  qualifiedCpa: number;
};

type PerformanceRulesPayload = {
  ok: boolean;
  windowDays: number;
  rules: {
    minQualified: number;
    maxQualifiedCpa: number;
    pauseSpendThreshold: number;
    maxQualifiedCpaForPause: number;
  };
  scaleQualified: PerformanceRecommendation[];
  pauseQualified: PerformanceRecommendation[];
};

const LEADERSHIP_ROLES = new Set(["admin", "ceo", "crm_ops_admin"]);

const STATUS_LABEL: Record<OpsStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
  blocked: "Blocked",
};

const SLOT_LABEL: Record<OpsSlot, string> = {
  morning: "Morning",
  midday: "Midday",
  afternoon: "Afternoon",
  evening: "Evening",
};

function normalizeRole(role?: string | null) {
  return String(role || "")
    .trim()
    .toLowerCase();
}

function formatCenter(center: string) {
  if (!center || center === "network") return "Network";
  return center.charAt(0).toUpperCase() + center.slice(1);
}

function formatUpdatedBy(task: OpsTaskRow) {
  return task.updatedByName || task.updatedByEmail || "Not updated";
}

function taskKey(task: OpsTaskRow) {
  return `${task.date}|${task.profileKey}|${task.center}|${task.taskCode}`;
}

function statusChipClass(status: OpsStatus) {
  if (status === "done") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "in_progress") return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "blocked") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

export default function DailyCommandCenter() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [payload, setPayload] = useState<OpsPayload | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceRulesPayload | null>(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [performanceError, setPerformanceError] = useState<string | null>(null);
  const [activeProfileKey, setActiveProfileKey] = useState("");
  const [savingTask, setSavingTask] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/ops-workboard?date=${encodeURIComponent(date)}`, {
          cache: "no-store",
        });
        const result = (await response.json()) as OpsPayload & { error?: string };
        if (!response.ok) throw new Error(result?.error || "Failed to load daily command data");
        if (!active) return;
        setPayload(result);
        setActiveProfileKey((current) => {
          if (current && result.profiles.some((profile) => profile.key === current)) return current;
          if (result.defaultProfileKey && result.profiles.some((profile) => profile.key === result.defaultProfileKey)) {
            return result.defaultProfileKey;
          }
          return result.profiles[0]?.key || "";
        });
        const seededNotes: Record<string, string> = {};
        for (const task of result.tasks) {
          seededNotes[taskKey(task)] = task.note || "";
        }
        setNotes(seededNotes);
      } catch (loadError) {
        if (!active) return;
        setPayload(null);
        setError(loadError instanceof Error ? loadError.message : "Failed to load daily command data");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [date, refreshTick]);

  const normalizedRole = normalizeRole(payload?.role);
  const isLeadership = LEADERSHIP_ROLES.has(normalizedRole);
  const profiles = payload?.profiles || [];
  const summary = payload?.summary || [];
  const allTasks = payload?.tasks || [];

  const currentProfile = useMemo(
    () => profiles.find((profile) => profile.key === activeProfileKey) || profiles[0] || null,
    [profiles, activeProfileKey]
  );

  const checklist = useMemo(() => {
    if (!currentProfile) return [] as OpsTaskRow[];
    return allTasks
      .filter((task) => task.profileKey === currentProfile.key)
      .sort((a, b) => {
        const slotOrder = ["morning", "midday", "afternoon", "evening"];
        return slotOrder.indexOf(a.slot) - slotOrder.indexOf(b.slot);
      });
  }, [allTasks, currentProfile]);

  const dueNow = useMemo(
    () => allTasks.filter((task) => task.status !== "done").slice(0, 12),
    [allTasks]
  );

  const overall = useMemo(() => {
    const total = summary.reduce((sum, row) => sum + row.total, 0);
    const done = summary.reduce((sum, row) => sum + row.done, 0);
    const blocked = summary.reduce((sum, row) => sum + row.blocked, 0);
    const rate = total > 0 ? (done / total) * 100 : 0;
    return { total, done, blocked, rate };
  }, [summary]);

  const risks = useMemo(
    () => summary.filter((row) => row.blocked > 0 || row.completionRate < 80),
    [summary]
  );

  useEffect(() => {
    let active = true;
    async function loadPerformance() {
      setPerformanceLoading(true);
      setPerformanceError(null);
      try {
        const response = await fetch("/api/admin/analytics/performance-rules?days=30", { cache: "no-store" });
        const payload = (await response.json()) as PerformanceRulesPayload & { error?: string };
        if (!response.ok) throw new Error(payload?.error || "Failed to load performance recommendations");
        if (!active) return;
        setPerformanceData(payload);
      } catch (error) {
        if (!active) return;
        setPerformanceError(error instanceof Error ? error.message : "Failed to load performance recommendations");
      } finally {
        if (active) setPerformanceLoading(false);
      }
    }
    if (isLeadership) {
      loadPerformance();
    }
    return () => {
      active = false;
    };
  }, [isLeadership]);

  async function saveTask(task: OpsTaskRow, status: OpsStatus) {
    const key = taskKey(task);
    setSavingTask(key);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/ops-workboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskDate: task.date,
          profileKey: task.profileKey,
          center: task.center,
          taskCode: task.taskCode,
          status,
          note: (notes[key] || "").slice(0, 1000),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Failed to update task");
      setNotice("Daily command updated.");
      setRefreshTick((value) => value + 1);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to update task");
    } finally {
      setSavingTask(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-santaan-teal" />
              Daily Command
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Role-based checklist with live completion tracking. Update tasks here so CEO sees daily accountability.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-[170px]"
            />
            <Button variant="outline" onClick={() => setRefreshTick((value) => value + 1)} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CalendarDays className="w-4 h-4 mr-2" />}
              Refresh
            </Button>
          </div>
        </div>
        {notice ? <p className="text-sm text-emerald-700 mt-3">{notice}</p> : null}
        {error ? <p className="text-sm text-rose-700 mt-3">{error}</p> : null}
      </div>

      {isLeadership ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-santaan-teal" />
                CRM-Qualified CPA Recommendations
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Built from 30-day spend + CRM-qualified outcomes. Use this during standup to set scale/pause actions.
              </p>
            </div>
          </div>
          {performanceLoading ? (
            <p className="text-sm text-gray-500 mt-3">Loading recommendations...</p>
          ) : performanceError ? (
            <p className="text-sm text-rose-700 mt-3">{performanceError}</p>
          ) : performanceData ? (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-xs font-semibold text-emerald-900">Scale candidates</p>
                <div className="mt-3 space-y-2">
                  {performanceData.scaleQualified.length > 0 ? (
                    performanceData.scaleQualified.map((row) => (
                      <div key={`scale-${row.campaign}`} className="flex items-start justify-between gap-3 text-xs text-emerald-900">
                        <span className="font-semibold">{row.campaign}</span>
                        <span className="whitespace-nowrap">qCPA ₹{Math.round(row.qualifiedCpa)} · q {row.qualified}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-emerald-900/80">No scale flags at current rules.</p>
                  )}
                </div>
              </div>
              <div className="rounded-lg border border-rose-100 bg-rose-50 p-4">
                <p className="text-xs font-semibold text-rose-900">Pause candidates</p>
                <div className="mt-3 space-y-2">
                  {performanceData.pauseQualified.length > 0 ? (
                    performanceData.pauseQualified.map((row) => (
                      <div key={`pause-${row.campaign}`} className="flex items-start justify-between gap-3 text-xs text-rose-900">
                        <span className="font-semibold">{row.campaign}</span>
                        <span className="whitespace-nowrap">spend ₹{Math.round(row.spend)} · q {row.qualified}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-rose-900/80">No pause flags at current rules.</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {loading && !payload ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-3" />
          Loading daily command...
        </div>
      ) : null}

      {!loading && payload ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Network Completion</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{Math.round(overall.rate)}%</p>
              <p className="text-xs text-gray-500 mt-1">{overall.done}/{overall.total} tasks done</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Blocked Items</p>
              <p className="text-2xl font-bold text-rose-700 mt-2">{overall.blocked}</p>
              <p className="text-xs text-gray-500 mt-1">Needs owner escalation</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Role View</p>
              <p className="text-lg font-semibold text-gray-900 mt-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-santaan-teal" />
                {payload.role || "unknown"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Access-scoped checklist</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-semibold text-gray-900">Role Checklist</h4>
                <p className="text-sm text-gray-600">Select role profile and update daily tasks.</p>
              </div>
              <select
                value={currentProfile?.key || ""}
                onChange={(event) => setActiveProfileKey(event.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[260px]"
              >
                {profiles.map((profile) => (
                  <option key={profile.key} value={profile.key}>
                    {profile.label} ({formatCenter(profile.center)})
                  </option>
                ))}
              </select>
            </div>

            {checklist.length === 0 ? (
              <p className="text-sm text-gray-500">No checklist tasks found for this profile/date.</p>
            ) : (
              <div className="space-y-3">
                {checklist.map((task) => {
                  const key = taskKey(task);
                  const isSaving = savingTask === key;
                  return (
                    <div key={key} className="rounded-xl border border-gray-200 p-4 bg-gray-50/50">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-gray-500">
                            {SLOT_LABEL[task.slot]} • {task.timeLabel}
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">{task.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Input: <span className="font-medium text-gray-700">{task.inputTarget}</span> | SLA: {task.sla}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Last update: <span className="font-medium text-gray-700">{formatUpdatedBy(task)}</span>
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs border ${statusChipClass(task.status)}`}>
                          {STATUS_LABEL[task.status]}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={task.status === "done"}
                            onChange={(event) => saveTask(task, event.target.checked ? "done" : "pending")}
                            disabled={isSaving}
                          />
                          Mark done
                        </label>
                        <Button size="sm" variant="outline" onClick={() => saveTask(task, "in_progress")} disabled={isSaving}>
                          In Progress
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => saveTask(task, "blocked")} disabled={isSaving}>
                          Blocked
                        </Button>
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-gray-500" /> : null}
                      </div>

                      <div className="mt-3">
                        <Input
                          value={notes[key] || ""}
                          onChange={(event) =>
                            setNotes((prev) => ({ ...prev, [key]: event.target.value.slice(0, 1000) }))
                          }
                          placeholder="Add note: completed action, blocker, or handoff context"
                        />
                      </div>

                      <div className="mt-3">
                        <Button size="sm" onClick={() => saveTask(task, task.status)} disabled={isSaving}>
                          Save Note
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {isLeadership ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Compliance Risks
                </h4>
                <p className="text-sm text-gray-600 mt-1">Profiles below 80% completion or with blocked tasks.</p>
                {risks.length === 0 ? (
                  <p className="text-sm text-emerald-700 mt-3">No major compliance risks for selected date.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {risks.map((risk) => (
                      <div key={risk.profileKey} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                        <p className="text-sm font-semibold text-amber-900">
                          {risk.profileLabel} ({formatCenter(risk.center)})
                        </p>
                        <p className="text-xs text-amber-800 mt-1">
                          Completion: {Math.round(risk.completionRate)}% • Blocked: {risk.blocked} • Pending: {risk.pending}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Clock3 className="w-4 h-4 text-santaan-teal" />
                  Pending Queue
                </h4>
                <p className="text-sm text-gray-600 mt-1">Open items requiring execution today.</p>
                {dueNow.length === 0 ? (
                  <p className="text-sm text-emerald-700 mt-3">All tasks completed.</p>
                ) : (
                  <div className="mt-3 space-y-2 max-h-[360px] overflow-auto pr-1">
                    {dueNow.map((task) => (
                      <div key={taskKey(task)} className="rounded-lg border border-gray-200 px-3 py-2">
                        <p className="text-sm font-medium text-gray-900">{task.profileLabel}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {task.timeLabel} • {task.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Current: {STATUS_LABEL[task.status]}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
