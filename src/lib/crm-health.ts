import { eq, gte, sql } from "drizzle-orm";
import {
  agencyPerformanceLogs,
  campaignSpend,
  contacts,
  fieldActivityLogs,
  metaConversionEvents,
  neodoveEvents,
  opsTaskUpdates,
  tvAdLogs,
  voiceCallLogs,
} from "@/db/schema";
import { db } from "@/lib/db";
import { OPS_PROFILE_LIST, OPS_TASK_TEMPLATES } from "@/lib/ops-workboard";
import { readGa4Config } from "@/lib/ga4";
import { readMetaAdsConfig } from "@/lib/meta-ads";
import { readSearchConsoleConfig } from "@/lib/search-console";
import { readZohoCliqConfig } from "@/lib/zoho-cliq";

type ContactHealthRow = Pick<
  typeof contacts.$inferSelect,
  | "id"
  | "status"
  | "leadSource"
  | "utmSource"
  | "utmMedium"
  | "utmCampaign"
  | "preferredChannel"
  | "tags"
  | "lastContact"
  | "createdAt"
  | "lastMessageAt"
  | "nextFollowUpAt"
>;

type OpsUpdateRow = typeof opsTaskUpdates.$inferSelect;

export type CrmHealthSeverity = "critical" | "warning" | "info";
export type CrmHealthStatus = "healthy" | "warning" | "critical";

export type CrmHealthAlert = {
  id: string;
  severity: CrmHealthSeverity;
  area: "pipeline" | "integrations" | "ops" | "wiring";
  title: string;
  detail: string;
  owner: string;
  actionHint: string;
};

export type CrmHealthSnapshot = {
  status: CrmHealthStatus;
  generatedAt: string;
  summary: {
    openAlerts: number;
    criticalAlerts: number;
    warningAlerts: number;
    totalContacts: number;
    pendingOlderThan24h: number;
    hotLeadSlaBreaches: number;
    overdueFollowUps: number;
    attributionCoverage7d: number;
    leads24h: number;
    voiceCalls24h: number;
    voiceWebhookErrors24h: number;
    voiceNeoDoveFailures24h: number;
    integrationsReady: number;
    integrationsTotal: number;
    opsCompletionRate: number;
    blockedOpsTasks: number;
    missingOpsSubmissions: number;
    neodoveErrors24h: number;
    metaErrors24h: number;
  };
  integrations: {
    ga4: boolean;
    searchConsole: boolean;
    metaAds: boolean;
    zohoCliq: boolean;
    neodove: boolean;
  };
  ops: {
    date: string;
    totalTasks: number;
    doneTasks: number;
    blockedTasks: number;
    pendingTasks: number;
    completionRate: number;
    submissions: {
      agency: number;
      field: number;
      tv: number;
    };
    missingSubmissions: string[];
  };
  wiring: {
    spendLastSeenAt: string | null;
    channels: Record<
      string,
      {
        total24h: number;
        lastSeenAt: string | null;
      }
    >;
  };
  alerts: CrmHealthAlert[];
};

function normalizeToken(value?: string | null) {
  return String(value || "").trim().toLowerCase();
}

function normalizeStatus(status?: string | null) {
  return normalizeToken(status);
}

function normalizeTags(value?: string | null) {
  return String(value || "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

function parseTimestamp(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  const parsed = Date.parse(trimmed);
  if (!Number.isNaN(parsed)) return parsed;

  const sqliteLike = trimmed.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(\.\d+)?$/);
  if (!sqliteLike) return null;

  const iso = `${sqliteLike[1]}T${sqliteLike[2]}${sqliteLike[3] || ""}Z`;
  const reparsed = Date.parse(iso);
  return Number.isNaN(reparsed) ? null : reparsed;
}

function sourceBucket(contact: ContactHealthRow) {
  const leadSource = normalizeToken(contact.leadSource);
  const utmSource = normalizeToken(contact.utmSource);
  const preferredChannel = normalizeToken(contact.preferredChannel);
  const tags = normalizeTags(contact.tags);
  const haystack = `${leadSource} ${utmSource} ${preferredChannel} ${tags.join(" ")}`.trim();

  if (leadSource === "neodove_webhook" || haystack.includes("neodove")) return "neodove";
  if (leadSource === "voice_ai_inbound" || haystack.includes("voice_ai")) return "voice_ai";
  if (leadSource === "call_inbound" || haystack.includes("call")) return "calls";
  if (leadSource.startsWith("cta_") || haystack.includes("cta_")) return "website_cta";
  if (leadSource === "whatsapp_inbound" || preferredChannel === "whatsapp" || haystack.includes("whatsapp")) return "whatsapp";
  if (leadSource === "telegram" || preferredChannel === "telegram" || haystack.includes("telegram")) return "telegram";
  if (leadSource === "at_home_page" || haystack.includes("at_home_test")) return "at_home";
  if (tags.includes("newsletter") || (leadSource === "website" && tags.includes("newsletter"))) return "newsletter";
  if ((contact.leadSource === null && tags.includes("seminar")) || tags.includes("seminar_registered")) return "seminar";
  return "other";
}

function buildOpsSummary(date: string, updates: OpsUpdateRow[]) {
  const updateMap = new Map(
    updates.map((update) => [
      `${update.taskDate}|${update.profileKey}|${update.center || "network"}|${update.taskCode}`,
      update,
    ])
  );

  const rows = OPS_PROFILE_LIST.flatMap((profile) =>
    OPS_TASK_TEMPLATES.filter((task) => task.profileKey === profile.key).map((task) => {
      const key = `${date}|${profile.key}|${profile.center}|${task.code}`;
      return updateMap.get(key)?.status || "pending";
    })
  );

  const totalTasks = rows.length;
  const doneTasks = rows.filter((status) => status === "done").length;
  const blockedTasks = rows.filter((status) => status === "blocked").length;
  const inProgressTasks = rows.filter((status) => status === "in_progress").length;
  const pendingTasks = totalTasks - doneTasks - blockedTasks - inProgressTasks;

  return {
    totalTasks,
    doneTasks,
    blockedTasks,
    pendingTasks,
    completionRate: totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0,
  };
}

function buildAlert(
  id: string,
  severity: CrmHealthSeverity,
  area: CrmHealthAlert["area"],
  title: string,
  detail: string,
  owner: string,
  actionHint: string
): CrmHealthAlert {
  return { id, severity, area, title, detail, owner, actionHint };
}

function sortAlerts(alerts: CrmHealthAlert[]) {
  const severityScore: Record<CrmHealthSeverity, number> = {
    critical: 3,
    warning: 2,
    info: 1,
  };

  return alerts.sort((left, right) => severityScore[right.severity] - severityScore[left.severity]);
}

function isMissingTableError(error: unknown) {
  if (!(error instanceof Error)) return false;
  if (error.message.toLowerCase().includes("no such table")) return true;
  if (error.message.toLowerCase().includes("no such column")) return true;

  const nestedCause =
    "cause" in error && error.cause instanceof Error ? error.cause.message.toLowerCase() : "";
  return nestedCause.includes("no such table") || nestedCause.includes("no such column");
}

async function queryOrFallback<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    if (isMissingTableError(error)) {
      return fallback;
    }
    throw error;
  }
}

export async function loadCrmHealthSnapshot(): Promise<CrmHealthSnapshot> {
  const now = Date.now();
  const generatedAt = new Date(now).toISOString();
  const today = generatedAt.slice(0, 10);
  const since24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const since7d = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    contactRows,
    neodoveErrorsRow,
    metaErrorsRow,
    voiceSummaryRow,
    spendRow,
    opsUpdates,
    agencyTodayRow,
    fieldTodayRow,
    tvTodayRow,
  ] = await Promise.all([
    queryOrFallback(
      () =>
        db
          .select({
            id: contacts.id,
            status: contacts.status,
            leadSource: contacts.leadSource,
            utmSource: contacts.utmSource,
            utmMedium: contacts.utmMedium,
            utmCampaign: contacts.utmCampaign,
            preferredChannel: contacts.preferredChannel,
            tags: contacts.tags,
            lastContact: contacts.lastContact,
            createdAt: contacts.createdAt,
            lastMessageAt: contacts.lastMessageAt,
            nextFollowUpAt: contacts.nextFollowUpAt,
          })
          .from(contacts),
      [] as ContactHealthRow[]
    ),
    queryOrFallback(
      () =>
        db
          .select({
            errors: sql<number>`COUNT(*)`,
          })
          .from(neodoveEvents)
          .where(
            sql`${neodoveEvents.processStatus} = 'error' AND ${neodoveEvents.receivedAt} >= ${since24h}`
          )
          .get(),
      { errors: 0 }
    ),
    queryOrFallback(
      () =>
        db
          .select({
            errors: sql<number>`COUNT(*)`,
          })
          .from(metaConversionEvents)
          .where(
            sql`${metaConversionEvents.processStatus} = 'error' AND ${metaConversionEvents.receivedAt} >= ${since24h}`
          )
          .get(),
      { errors: 0 }
    ),
    queryOrFallback(
      () =>
        db
          .select({
            total: sql<number>`COUNT(*)`,
            processingErrors: sql<number>`COALESCE(SUM(CASE WHEN ${voiceCallLogs.processStatus} = 'error' THEN 1 ELSE 0 END), 0)`,
            neodoveFailures: sql<number>`COALESCE(SUM(CASE WHEN ${voiceCallLogs.neodovePushStatus} = 'error' THEN 1 ELSE 0 END), 0)`,
          })
          .from(voiceCallLogs)
          .where(gte(voiceCallLogs.receivedAt, since24h))
          .get(),
      { total: 0, processingErrors: 0, neodoveFailures: 0 }
    ),
    queryOrFallback(
      () =>
        db
          .select({
            count: sql<number>`COUNT(*)`,
            total: sql<number>`COALESCE(SUM(${campaignSpend.amount}), 0)`,
            lastSeenAt: sql<string | null>`MAX(${campaignSpend.updatedAt})`,
          })
          .from(campaignSpend)
          .where(gte(campaignSpend.spendDate, since7d.slice(0, 10)))
          .get(),
      { count: 0, total: 0, lastSeenAt: null }
    ),
    queryOrFallback(
      () => db.select().from(opsTaskUpdates).where(eq(opsTaskUpdates.taskDate, today)),
      [] as OpsUpdateRow[]
    ),
    queryOrFallback(
      () =>
        db
          .select({ count: sql<number>`COUNT(*)` })
          .from(agencyPerformanceLogs)
          .where(eq(agencyPerformanceLogs.reportDate, today))
          .get(),
      { count: 0 }
    ),
    queryOrFallback(
      () =>
        db
          .select({ count: sql<number>`COUNT(*)` })
          .from(fieldActivityLogs)
          .where(eq(fieldActivityLogs.activityDate, today))
          .get(),
      { count: 0 }
    ),
    queryOrFallback(
      () =>
        db
          .select({ count: sql<number>`COUNT(*)` })
          .from(tvAdLogs)
          .where(eq(tvAdLogs.airingDate, today))
          .get(),
      { count: 0 }
    ),
  ]);

  const requiredBuckets = ["neodove", "voice_ai", "calls", "website_cta", "whatsapp", "telegram", "at_home", "newsletter", "seminar"];
  const channels = Object.fromEntries(
    requiredBuckets.map((bucket) => [
      bucket,
      {
        total24h: 0,
        lastSeenAt: null as string | null,
      },
    ])
  );

  let pendingOlderThan24h = 0;
  let hotLeadSlaBreaches = 0;
  let overdueFollowUps = 0;
  let leads24h = 0;
  let leads7d = 0;
  let unattributedLeads7d = 0;

  for (const contact of contactRows) {
    const status = normalizeStatus(contact.status);
    const activityAnchor =
      parseTimestamp(contact.lastMessageAt) ||
      parseTimestamp(contact.lastContact) ||
      parseTimestamp(contact.createdAt);
    const bucket = sourceBucket(contact);

    if (activityAnchor !== null) {
      if (bucket in channels) {
        channels[bucket].lastSeenAt = channels[bucket].lastSeenAt
          ? new Date(
              Math.max(activityAnchor, Date.parse(channels[bucket].lastSeenAt as string))
            ).toISOString()
          : new Date(activityAnchor).toISOString();
      }

      if (activityAnchor >= now - 24 * 60 * 60 * 1000) {
        leads24h += 1;
        if (bucket in channels) {
          channels[bucket].total24h += 1;
        }
      }

      if (activityAnchor >= now - 7 * 24 * 60 * 60 * 1000) {
        leads7d += 1;
        if (!contact.utmSource && !contact.utmMedium && !contact.utmCampaign) {
          unattributedLeads7d += 1;
        }
      }
    }

    const isOpen = !["converted", "lost", "closed"].includes(status);
    if (isOpen && activityAnchor !== null && now - activityAnchor >= 24 * 60 * 60 * 1000) {
      pendingOlderThan24h += 1;
    }

    const sourceText = `${contact.leadSource || ""} ${contact.utmSource || ""} ${contact.preferredChannel || ""} ${contact.tags || ""}`.toLowerCase();
    const isHotlineLead =
      sourceText.includes("call") ||
      sourceText.includes("phone") ||
      sourceText.includes("whatsapp") ||
      sourceText.includes("voice_ai");
    if (isOpen && isHotlineLead && activityAnchor !== null && now - activityAnchor >= 2 * 60 * 60 * 1000) {
      hotLeadSlaBreaches += 1;
    }

    const dueAt = parseTimestamp(contact.nextFollowUpAt);
    if (isOpen && dueAt !== null && dueAt < now) {
      overdueFollowUps += 1;
    }
  }

  const attributionCoverage7d = leads7d > 0 ? ((leads7d - unattributedLeads7d) / leads7d) * 100 : 100;
  const opsSummary = buildOpsSummary(today, opsUpdates);
  const submissions = {
    agency: Number(agencyTodayRow?.count || 0),
    field: Number(fieldTodayRow?.count || 0),
    tv: Number(tvTodayRow?.count || 0),
  };
  const missingSubmissions = Object.entries(submissions)
    .filter(([, count]) => count === 0)
    .map(([key]) => key);

  const integrations = {
    ga4: Boolean(readGa4Config()),
    searchConsole: Boolean(readSearchConsoleConfig()),
    metaAds: Boolean(readMetaAdsConfig()),
    zohoCliq: Boolean(readZohoCliqConfig()),
    neodove: Boolean(
      process.env.NEODOVE_WEBHOOK_SECRET?.trim() ||
        process.env.NEODOVE_CUSTOM_INTEGRATION_URL?.trim() ||
        process.env.NEODOVE_INTEGRATION_ID?.trim()
    ),
  };

  const alerts: CrmHealthAlert[] = [];
  const neodoveErrors24h = Number(neodoveErrorsRow?.errors || 0);
  const metaErrors24h = Number(metaErrorsRow?.errors || 0);
  const voiceCalls24h = Number(voiceSummaryRow?.total || 0);
  const voiceWebhookErrors24h = Number(voiceSummaryRow?.processingErrors || 0);
  const voiceNeoDoveFailures24h = Number(voiceSummaryRow?.neodoveFailures || 0);
  const readyIntegrations = Object.values(integrations).filter(Boolean).length;

  if (!integrations.neodove) {
    alerts.push(
      buildAlert(
        "integration-neodove-missing",
        "critical",
        "integrations",
        "NeoDove integration is not configured",
        "CRM will lose inbound call-center visibility until the webhook/config is restored.",
        "CRM Ops",
        "Check NeoDove env vars and `/api/admin/analytics/integrations` first."
      )
    );
  }

  if (neodoveErrors24h > 0) {
    alerts.push(
      buildAlert(
        "integration-neodove-errors",
        "critical",
        "integrations",
        `${neodoveErrors24h} NeoDove sync errors in the last 24h`,
        "Lead sync failures can create missing or stale CRM records.",
        "IVR / CRM Ops",
        "Inspect `neodove_events` errors and the NeoDove Ops dashboard."
      )
    );
  }

  if (metaErrors24h > 0) {
    alerts.push(
      buildAlert(
        "integration-meta-errors",
        "warning",
        "integrations",
        `${metaErrors24h} Meta conversion signal errors in the last 24h`,
        "Attribution and optimization loops are degraded while Meta signals fail.",
        "Performance Team",
        "Inspect `meta_conversion_events` and Meta analytics health."
      )
    );
  }

  if (voiceWebhookErrors24h > 0) {
    alerts.push(
      buildAlert(
        "integration-voice-errors",
        voiceWebhookErrors24h >= 3 ? "critical" : "warning",
        "integrations",
        `${voiceWebhookErrors24h} Voice AI webhook errors in the last 24h`,
        "Bolna post-call payloads are failing before they become CRM actions.",
        "IVR / CRM Ops",
        "Inspect `voice_call_logs` rows with `processStatus=error` and compare raw payloads."
      )
    );
  }

  if (voiceNeoDoveFailures24h > 0) {
    alerts.push(
      buildAlert(
        "integration-voice-neodove",
        "warning",
        "integrations",
        `${voiceNeoDoveFailures24h} Voice AI leads failed to push into NeoDove in the last 24h`,
        "Calls may be reaching CRM but not reaching telecaller execution queues.",
        "CRM Ops",
        "Check `voice_call_logs.neodovePushStatus` and validate NeoDove field mapping."
      )
    );
  }

  if (hotLeadSlaBreaches > 0) {
    alerts.push(
      buildAlert(
        "pipeline-hotline-sla",
        hotLeadSlaBreaches >= 5 ? "critical" : "warning",
        "pipeline",
        `${hotLeadSlaBreaches} call/WhatsApp leads breached the 2-hour SLA`,
        "Speed-to-lead is slipping on the highest-intent contact channels.",
        "Call Center Lead",
        "Filter open phone/WhatsApp leads and trigger callback recovery."
      )
    );
  }

  if (pendingOlderThan24h > 0) {
    alerts.push(
      buildAlert(
        "pipeline-pending-24h",
        pendingOlderThan24h >= 10 ? "critical" : "warning",
        "pipeline",
        `${pendingOlderThan24h} open leads have been untouched for more than 24 hours`,
        "This is direct pipeline leakage and should be treated as same-day cleanup.",
        "CRM Team",
        "Open pending leads older than 24h and assign owners before end of day."
      )
    );
  }

  if (overdueFollowUps > 0) {
    alerts.push(
      buildAlert(
        "pipeline-overdue-followups",
        overdueFollowUps >= 10 ? "critical" : "warning",
        "pipeline",
        `${overdueFollowUps} follow-ups are overdue`,
        "Booked callbacks are slipping, which lowers qualification and closure reliability.",
        "Counselling Lead",
        "Audit `nextFollowUpAt` backlog and close the oldest missed callbacks first."
      )
    );
  }

  if (leads7d >= 10 && attributionCoverage7d < 85) {
    alerts.push(
      buildAlert(
        "wiring-attribution",
        attributionCoverage7d < 75 ? "critical" : "warning",
        "wiring",
        `Attribution coverage is ${attributionCoverage7d.toFixed(1)}% over the last 7 days`,
        "Paid and campaign performance cannot be trusted while source tagging is incomplete.",
        "Marketing Manager",
        "Inspect UTM discipline, landing links, and missing-source contact rows."
      )
    );
  }

  if (opsSummary.blockedTasks > 0) {
    alerts.push(
      buildAlert(
        "ops-blocked",
        "critical",
        "ops",
        `${opsSummary.blockedTasks} workboard tasks are blocked today`,
        "Execution blockers are open in the daily command workflow.",
        "Leadership",
        "Review the workboard blockers and assign removal owners immediately."
      )
    );
  }

  if (opsSummary.totalTasks > 0 && opsSummary.completionRate < 85) {
    alerts.push(
      buildAlert(
        "ops-compliance",
        opsSummary.completionRate < 70 ? "critical" : "warning",
        "ops",
        `Daily command completion is ${opsSummary.completionRate.toFixed(1)}%`,
        "The ops rhythm is behind target and may hide downstream execution misses.",
        "Leadership",
        "Open Daily Command and chase the remaining pending tasks by role."
      )
    );
  }

  if (missingSubmissions.length > 0) {
    alerts.push(
      buildAlert(
        "ops-submissions",
        "warning",
        "ops",
        `Missing ops inputs today: ${missingSubmissions.join(", ")}`,
        "The CEO view is incomplete until all daily operational logs are submitted.",
        "Ops Owners",
        "Check Agency, Field, and TV inputs for today and backfill missing rows."
      )
    );
  }

  const spendLastSeenAt = spendRow?.lastSeenAt || null;
  if (leads7d >= 10 && Number(spendRow?.count || 0) === 0) {
    alerts.push(
      buildAlert(
        "wiring-spend-log",
        "warning",
        "wiring",
        "No spend rows logged in the last 7 days",
        "Lead flow exists, but spend-to-outcome visibility is missing.",
        "Performance Team",
        "Update the Spend tab or agency reports so CPL/CPP remains usable."
      )
    );
  }

  const sortedAlerts = sortAlerts(alerts);
  const criticalAlerts = sortedAlerts.filter((alert) => alert.severity === "critical").length;
  const warningAlerts = sortedAlerts.filter((alert) => alert.severity === "warning").length;
  const status: CrmHealthStatus = criticalAlerts > 0 ? "critical" : warningAlerts > 0 ? "warning" : "healthy";

  return {
    status,
    generatedAt,
    summary: {
      openAlerts: sortedAlerts.length,
      criticalAlerts,
      warningAlerts,
      totalContacts: contactRows.length,
      pendingOlderThan24h,
      hotLeadSlaBreaches,
      overdueFollowUps,
      attributionCoverage7d,
      leads24h,
      voiceCalls24h,
      voiceWebhookErrors24h,
      voiceNeoDoveFailures24h,
      integrationsReady: readyIntegrations,
      integrationsTotal: Object.keys(integrations).length,
      opsCompletionRate: opsSummary.completionRate,
      blockedOpsTasks: opsSummary.blockedTasks,
      missingOpsSubmissions: missingSubmissions.length,
      neodoveErrors24h,
      metaErrors24h,
    },
    integrations,
    ops: {
      date: today,
      totalTasks: opsSummary.totalTasks,
      doneTasks: opsSummary.doneTasks,
      blockedTasks: opsSummary.blockedTasks,
      pendingTasks: opsSummary.pendingTasks,
      completionRate: opsSummary.completionRate,
      submissions,
      missingSubmissions,
    },
    wiring: {
      spendLastSeenAt,
      channels,
    },
    alerts: sortedAlerts,
  };
}
