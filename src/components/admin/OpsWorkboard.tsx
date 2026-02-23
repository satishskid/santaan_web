"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, Filter, Loader2, RotateCcw, Save, Target, Users } from "lucide-react";
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

type DraftState = {
  status: OpsStatus;
  note: string;
  saving?: boolean;
  error?: string | null;
};

const SLOT_ORDER: OpsSlot[] = ["morning", "midday", "afternoon", "evening"];

const SLOT_LABEL: Record<OpsSlot, string> = {
  morning: "Morning",
  midday: "Midday",
  afternoon: "Afternoon",
  evening: "Evening",
};

const STATUS_LABEL: Record<OpsStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
  blocked: "Blocked",
};

const STATUS_CLASS: Record<OpsStatus, string> = {
  pending: "bg-slate-100 text-slate-700 border-slate-200",
  in_progress: "bg-amber-100 text-amber-800 border-amber-200",
  done: "bg-emerald-100 text-emerald-800 border-emerald-200",
  blocked: "bg-rose-100 text-rose-800 border-rose-200",
};

const LEADERSHIP_ROLES = new Set(["admin", "ceo", "crm_ops_admin"]);
const EMPTY_PROFILES: OpsProfile[] = [];
const EMPTY_TASKS: OpsTaskRow[] = [];
const EMPTY_SUMMARY: OpsSummaryRow[] = [];

function normalizeRole(role?: string | null) {
  return String(role || "")
    .trim()
    .toLowerCase();
}

function taskDraftKey(task: OpsTaskRow) {
  return `${task.date}|${task.profileKey}|${task.center}|${task.taskCode}`;
}

function formatCenter(center: string) {
  if (!center) return "Network";
  if (center === "network") return "Network";
  return center.charAt(0).toUpperCase() + center.slice(1);
}

function formatUpdatedAt(value?: string | null) {
  if (!value) return "Not updated yet";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleString("en-IN");
}

export default function OpsWorkboard() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [payload, setPayload] = useState<OpsPayload | null>(null);
  const [activeProfileKey, setActiveProfileKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, DraftState>>({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchWorkboard() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/ops-workboard?date=${encodeURIComponent(date)}`, {
          cache: "no-store",
        });
        const result = (await response.json()) as OpsPayload & { error?: string };
        if (!response.ok) throw new Error(result?.error || "Failed to load workboard");
        if (!active) return;
        setPayload(result);
        setActiveProfileKey((current) => {
          if (current && result.profiles.some((profile) => profile.key === current)) return current;
          if (result.defaultProfileKey && result.profiles.some((profile) => profile.key === result.defaultProfileKey)) {
            return result.defaultProfileKey;
          }
          return result.profiles[0]?.key || "";
        });
        setDrafts({});
      } catch (err) {
        if (!active) return;
        setPayload(null);
        setError(err instanceof Error ? err.message : "Failed to load workboard");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchWorkboard();
    return () => {
      active = false;
    };
  }, [date, refreshTick]);

  const normalizedRole = normalizeRole(payload?.role);
  const isLeadership = LEADERSHIP_ROLES.has(normalizedRole);
  const profiles = payload?.profiles || EMPTY_PROFILES;
  const allTasks = payload?.tasks || EMPTY_TASKS;
  const summary = payload?.summary || EMPTY_SUMMARY;

  const currentProfile = useMemo(
    () => profiles.find((profile) => profile.key === activeProfileKey) || profiles[0] || null,
    [profiles, activeProfileKey]
  );

  const tasksForProfile = useMemo(() => {
    if (!currentProfile) return [] as OpsTaskRow[];
    return allTasks.filter((task) => task.profileKey === currentProfile.key);
  }, [allTasks, currentProfile]);

  const groupedTasks = useMemo(() => {
    return SLOT_ORDER.map((slot) => ({
      slot,
      label: SLOT_LABEL[slot],
      rows: tasksForProfile.filter((task) => task.slot === slot),
    })).filter((group) => group.rows.length > 0);
  }, [tasksForProfile]);

  const recentUpdates = useMemo(() => {
    return [...allTasks]
      .filter((task) => task.updatedAt)
      .sort((a, b) => Date.parse(b.updatedAt || "") - Date.parse(a.updatedAt || ""))
      .slice(0, 12);
  }, [allTasks]);

  const getTaskState = (task: OpsTaskRow) => {
    const key = taskDraftKey(task);
    const draft = drafts[key];
    return {
      status: draft?.status || task.status,
      note: draft?.note ?? task.note ?? "",
      saving: Boolean(draft?.saving),
      error: draft?.error || null,
    };
  };

  const updateDraft = (task: OpsTaskRow, patch: Partial<DraftState>) => {
    const key = taskDraftKey(task);
    setDrafts((prev) => {
      const current = prev[key] || {
        status: task.status,
        note: task.note || "",
      };
      return {
        ...prev,
        [key]: {
          ...current,
          ...patch,
        },
      };
    });
  };

  const saveTask = async (task: OpsTaskRow) => {
    const key = taskDraftKey(task);
    const state = getTaskState(task);
    updateDraft(task, { saving: true, error: null });
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
          status: state.status,
          note: state.note,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Failed to save task");
      setNotice("Task status updated.");
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setRefreshTick((value) => value + 1);
    } catch (err) {
      updateDraft(task, {
        saving: false,
        error: err instanceof Error ? err.message : "Failed to save task",
      });
    }
  };

  const resetTask = async (task: OpsTaskRow) => {
    const key = taskDraftKey(task);
    setNotice(null);
    updateDraft(task, { saving: true, error: null });
    try {
      const query = new URLSearchParams({
        taskDate: task.date,
        profileKey: task.profileKey,
        center: task.center,
        taskCode: task.taskCode,
      });
      const response = await fetch(`/api/admin/ops-workboard?${query.toString()}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Failed to reset task");
      setNotice("Task reset to pending.");
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setRefreshTick((value) => value + 1);
    } catch (err) {
      updateDraft(task, {
        saving: false,
        error: err instanceof Error ? err.message : "Failed to reset task",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-santaan-teal" />
              Daily Ops Workboard
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Time-slot execution board for each role. Mark each task with status and notes so leadership sees action, not noise.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-[170px]" />
            <Button variant="outline" onClick={() => setRefreshTick((value) => value + 1)} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RotateCcw className="w-4 h-4 mr-2" />}
              Refresh
            </Button>
          </div>
        </div>

        {notice ? <p className="text-sm text-emerald-700 mt-3">{notice}</p> : null}
        {error ? <p className="text-sm text-rose-700 mt-3">{error}</p> : null}
      </div>

      {loading && !payload ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-3" />
          Loading workboard...
        </div>
      ) : null}

      {!loading && payload ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {summary.map((item) => (
              <div key={item.profileKey} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.profileLabel}</p>
                    <p className="text-xs text-gray-500">{formatCenter(item.center)}</p>
                  </div>
                  <span className="text-sm font-semibold text-santaan-teal">{Math.round(item.completionRate)}%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-santaan-teal" style={{ width: `${Math.max(0, Math.min(100, item.completionRate))}%` }} />
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                  <div className="rounded-lg bg-slate-50 p-2 text-center">
                    <p className="text-gray-500">Done</p>
                    <p className="font-semibold text-gray-900">{item.done}</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-2 text-center">
                    <p className="text-amber-700">In Prog</p>
                    <p className="font-semibold text-amber-900">{item.inProgress}</p>
                  </div>
                  <div className="rounded-lg bg-rose-50 p-2 text-center">
                    <p className="text-rose-700">Blocked</p>
                    <p className="font-semibold text-rose-900">{item.blocked}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-2 text-center">
                    <p className="text-gray-500">Pending</p>
                    <p className="font-semibold text-gray-900">{item.pending}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Role View: {payload.role || "unknown"}
                </p>
                <h4 className="text-xl font-semibold text-gray-900 mt-1">
                  {currentProfile?.label || "Select profile"} Daily Timeline
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={currentProfile?.key || ""}
                  onChange={(event) => setActiveProfileKey(event.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[240px]"
                >
                  {profiles.map((profile) => (
                    <option key={profile.key} value={profile.key}>
                      {profile.label} ({formatCenter(profile.center)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {groupedTasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500">
                No tasks defined for this profile/date.
              </div>
            ) : (
              <div className="space-y-6">
                {groupedTasks.map((group) => (
                  <div key={group.slot} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock3 className="w-4 h-4 text-santaan-teal" />
                      <h5 className="text-sm font-semibold text-gray-800">{group.label}</h5>
                    </div>
                    <div className="space-y-3">
                      {group.rows.map((task) => {
                        const currentState = getTaskState(task);
                        const dirty = currentState.status !== task.status || currentState.note !== (task.note || "");
                        return (
                          <div key={task.taskCode} className="rounded-xl border border-gray-200 p-4 bg-gray-50/40">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-xs text-gray-500">{task.timeLabel}</p>
                                <p className="text-sm font-semibold text-gray-900 mt-1">{task.title}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Owner: <span className="font-medium text-gray-700">{task.ownerHint}</span> | Input:{" "}
                                  <span className="font-medium text-gray-700">{task.inputTarget}</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">SLA: {task.sla}</p>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full border text-xs font-medium ${STATUS_CLASS[currentState.status]}`}>
                                {STATUS_LABEL[currentState.status]}
                              </span>
                            </div>

                            <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
                              <select
                                value={currentState.status}
                                onChange={(event) =>
                                  updateDraft(task, { status: event.target.value as OpsStatus, error: null })
                                }
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                              >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="done">Done</option>
                                <option value="blocked">Blocked</option>
                              </select>

                              <Input
                                value={currentState.note}
                                onChange={(event) => updateDraft(task, { note: event.target.value.slice(0, 1000), error: null })}
                                placeholder="Action note (what was done, blocker, owner)"
                                className="lg:col-span-2"
                              />
                            </div>

                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                              <p className="text-xs text-gray-500">
                                Last update:{" "}
                                <span className="font-medium text-gray-700">
                                  {task.updatedByName || task.updatedByEmail || "Not updated"}
                                </span>{" "}
                                | {formatUpdatedAt(task.updatedAt)}
                              </p>

                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => resetTask(task)} disabled={currentState.saving}>
                                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                                  Reset
                                </Button>
                                <Button size="sm" onClick={() => saveTask(task)} disabled={!dirty || currentState.saving}>
                                  {currentState.saving ? (
                                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                  ) : (
                                    <Save className="w-3.5 h-3.5 mr-1.5" />
                                  )}
                                  Save
                                </Button>
                              </div>
                            </div>

                            {currentState.error ? <p className="mt-2 text-xs text-rose-700">{currentState.error}</p> : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isLeadership ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-santaan-teal" />
                CEO Action Feed
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Latest role updates across teams. Use this to run daily accountability and unblock execution.
              </p>

              {recentUpdates.length === 0 ? (
                <p className="text-sm text-gray-500 mt-4">No updates logged for this date.</p>
              ) : (
                <div className="mt-4 space-y-2">
                  {recentUpdates.map((task) => (
                    <div
                      key={`${task.profileKey}-${task.taskCode}-${task.updatedAt}`}
                      className="rounded-lg border border-gray-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {task.profileLabel} • {task.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {task.updatedByName || task.updatedByEmail || "Unknown"} • {formatUpdatedAt(task.updatedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs border ${STATUS_CLASS[task.status]}`}>
                          {STATUS_LABEL[task.status]}
                        </span>
                        {task.status === "done" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Clock3 className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
