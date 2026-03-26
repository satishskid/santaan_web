import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte, isNull, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { isAuthorizedOpsUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";
import { contacts, neodoveEvents, metaConversionEvents } from "@/db/schema";
import { fetchMetaDashboardSnapshot, readMetaAdsConfig } from "@/lib/meta-ads";

export const runtime = "nodejs";

const AUTHORIZED_ROLES = new Set([
  "admin",
  "ceo",
  "crm_ops_admin",
  "marketing_manager",
  "agency_ops",
]);

function normalizeRole(role?: string | null) {
  return String(role || "").trim().toLowerCase();
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const role = normalizeRole((session?.user as { role?: string } | undefined)?.role);
    const authorized = await isAuthorizedOpsUser(session?.user?.email, role);

    if (!authorized || !AUTHORIZED_ROLES.has(role || "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks: any[] = [];
    const now = new Date().toISOString();
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // 1. NeoDove Sync Errors (Last 24h)
    const syncErrors = await db
      .select()
      .from(neodoveEvents)
      .where(
        and(
          eq(neodoveEvents.processStatus, "error"),
          gte(neodoveEvents.receivedAt, last24h)
        )
      )
      .limit(5);

    syncErrors.forEach((err) => {
      tasks.push({
        id: `neodove_err_${err.id}`,
        type: "system",
        priority: "high",
        title: "NeoDove Sync Error",
        description: `Failed to push lead ${err.mobile || "unknown"} to NeoDove: ${err.errorMessage}`,
        status: "pending",
        actionLabel: "Fix & Retry",
        metadata: { eventId: err.id, mobile: err.mobile },
      });
    });

    // 2. Meta CAPI Errors (Last 24h)
    const capiErrors = await db
      .select()
      .from(metaConversionEvents)
      .where(
        and(
          eq(metaConversionEvents.processStatus, "error"),
          gte(metaConversionEvents.receivedAt, last24h)
        )
      )
      .limit(5);

    capiErrors.forEach((err) => {
      tasks.push({
        id: `meta_capi_err_${err.id}`,
        type: "system",
        priority: "medium",
        title: "Meta Signal Error",
        description: `Failed to send conversion signal for lead ${err.contactId}: ${err.errorMessage}`,
        status: "pending",
        actionLabel: "Check Signal",
        metadata: { eventId: err.id, contactId: err.contactId },
      });
    });

    // 3. Missing Follow-ups for Qualified Leads
    const missingFollowups = await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.neodoveMappedStatus, "Qualified"),
          isNull(contacts.nextFollowUpAt)
        )
      )
      .limit(5);

    missingFollowups.forEach((contact) => {
      tasks.push({
        id: `followup_${contact.id}`,
        type: "followup",
        priority: "high",
        title: "Missing Follow-up Date",
        description: `Lead ${contact.name || contact.phone} is Qualified but has no follow-up date scheduled.`,
        status: "pending",
        actionLabel: "Schedule Call",
        contactId: contact.id,
      });
    });

    // 4. Hot Leads Needing Immediate Action
    const hotLeads = await db
      .select()
      .from(contacts)
      .where(
        and(
          sql`${contacts.leadScore} >= 80`,
          gte(contacts.lastContact, last24h)
        )
      )
      .limit(5);

    hotLeads.forEach((contact) => {
      tasks.push({
        id: `hot_lead_${contact.id}`,
        type: "call",
        priority: "high",
        title: "Hot Lead: Instant Follow-up",
        description: `${contact.name || contact.phone} has a high lead score (${contact.leadScore}). Engage immediately.`,
        status: "pending",
        actionLabel: "Call Now",
        contactId: contact.id,
      });
    });

    // 5. Meta Performance Insight (Spend > ₹3k, Leads = 0)
    try {
      const metaConfig = readMetaAdsConfig();
      if (metaConfig) {
        const reportingTimeZone = process.env.META_REPORTING_TIMEZONE || "Asia/Kolkata";
        const untilDate = new Date();
        const sinceDate = new Date();
        sinceDate.setDate(untilDate.getDate() - 6); // Last 7 days

        const formatDate = (date: Date) => {
          return new Intl.DateTimeFormat("en-CA", {
            timeZone: reportingTimeZone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(date);
        };

        const snapshot = await fetchMetaDashboardSnapshot({
          since: formatDate(sinceDate),
          until: formatDate(untilDate),
          windowDays: 7,
        });

        const underperforming = snapshot.campaigns.filter(c => c.spend > 3000 && c.leads === 0);
        underperforming.forEach(c => {
          tasks.push({
            id: `meta_perf_${c.campaignId || 'unknown'}`,
            type: "marketing",
            priority: "medium",
            title: "Underperforming Ad Campaign",
            description: `Campaign '${c.campaignName || 'Unknown'}' has spent ₹${Math.round(c.spend)} with 0 leads in 7 days.`,
            status: "pending",
            actionLabel: "Review Budget",
            metadata: { campaignId: c.campaignId, spend: c.spend },
          });
        });
      }
    } catch (metaErr) {
      console.error("Action board Meta check error:", metaErr);
    }

    return NextResponse.json({
      ok: true,
      tasks: tasks.sort((a, b) => {
        const priorityScore = { high: 3, medium: 2, low: 1 };
        return (priorityScore[b.priority as keyof typeof priorityScore] || 0) - (priorityScore[a.priority as keyof typeof priorityScore] || 0);
      }),
    });
  } catch (error) {
    console.error("Action board tasks API error:", error);
    return NextResponse.json({ error: "Failed to load action tasks" }, { status: 500 });
  }
}
