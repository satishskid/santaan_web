import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { contacts, neodoveEvents } from "@/db/schema";
import { isAuthorizedOpsUser } from "@/lib/auth-helper";

type ReconciliationReason =
  | "missing_owner"
  | "missing_follow_up"
  | "status_drift"
  | "missing_lost_reason"
  | "missing_lead_id"
  | "stale_sync"
  | "owner_drift"
  | "sync_error";

function normalizeRole(role?: string | null) {
  return String(role || "").trim().toLowerCase();
}

async function requireOpsAccess() {
  const session = await auth();
  const sessionRole = normalizeRole((session?.user as { role?: string } | undefined)?.role);
  const authorized = await isAuthorizedOpsUser(session?.user?.email, sessionRole);
  return { authorized, role: sessionRole || "admin" };
}

function normalizeStatus(value?: string | null) {
  const token = String(value || "").trim().toLowerCase();
  if (!token) return "new";
  if (token.includes("convert") || token.includes("won")) return "converted";
  if (token.includes("lost") || token.includes("dispose") || token.includes("drop") || token.includes("closed")) return "lost";
  if (token.includes("qualif")) return "qualified";
  if (token.includes("contact") || token.includes("progress")) return "contacted";
  return "new";
}

function parseTs(value?: string | null) {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function hasNeodoveTag(tags?: string | null) {
  return String(tags || "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .includes("neodove");
}

function humanizeReason(reason: ReconciliationReason) {
  if (reason === "missing_owner") return "No owner synced from NeoDove";
  if (reason === "missing_follow_up") return "Active lead has no next follow-up";
  if (reason === "status_drift") return "CRM status differs from last NeoDove mapped status";
  if (reason === "missing_lost_reason") return "Lost lead has no structured lost reason";
  if (reason === "missing_lead_id") return "NeoDove lead id missing";
  if (reason === "stale_sync") return "No fresh NeoDove sync in 24h";
  if (reason === "owner_drift") return "CRM owner differs from NeoDove owner";
  return "NeoDove sync error";
}

export async function GET(request: NextRequest) {
  try {
    const { authorized } = await requireOpsAccess();
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lookbackDays = Math.max(1, Math.min(30, Number(new URL(request.url).searchParams.get("days") || 7)));
    const now = Date.now();
    const sinceMs = now - lookbackDays * 24 * 60 * 60 * 1000;

    const [allContacts, recentEvents] = await Promise.all([
      db.select().from(contacts).orderBy(desc(contacts.createdAt)).all(),
      db.select().from(neodoveEvents).orderBy(desc(neodoveEvents.receivedAt), desc(neodoveEvents.id)).all(),
    ]);

    const scopedEvents = recentEvents.filter((event) => {
      const ts = parseTs(event.receivedAt);
      return ts !== null && ts >= sinceMs;
    });

    const relevantContacts = allContacts.filter(
      (contact) =>
        String(contact.leadSource || "").trim().toLowerCase() === "neodove_webhook" ||
        Boolean(contact.neodoveLeadId) ||
        hasNeodoveTag(contact.tags)
    );

    const activeStatuses = new Set(["new", "contacted", "qualified"]);
    const exceptions = relevantContacts
      .map((contact) => {
        const reasons: ReconciliationReason[] = [];
        const status = normalizeStatus(contact.status);
        const syncTs = parseTs(contact.neodoveLastSyncAt || contact.neodoveLastEventAt);
        const ownerName = String(contact.ownerName || "").trim().toLowerCase();
        const neodoveOwnerName = String(contact.neodoveOwnerName || "").trim().toLowerCase();

        if (!contact.neodoveLeadId) reasons.push("missing_lead_id");
        if (contact.neodoveSyncStatus === "error") reasons.push("sync_error");
        if (activeStatuses.has(status) && !contact.nextFollowUpAt) reasons.push("missing_follow_up");
        if (activeStatuses.has(status) && !contact.neodoveOwnerName && !contact.ownerName) reasons.push("missing_owner");
        if (status === "lost" && !contact.neodoveDisposeReason) reasons.push("missing_lost_reason");
        if (contact.neodoveMappedStatus && normalizeStatus(contact.neodoveMappedStatus) !== status) reasons.push("status_drift");
        if (ownerName && neodoveOwnerName && ownerName !== neodoveOwnerName) reasons.push("owner_drift");
        if (activeStatuses.has(status) && (!syncTs || syncTs < now - 24 * 60 * 60 * 1000)) reasons.push("stale_sync");

        return reasons.length > 0
          ? {
              id: contact.id,
              name: contact.name,
              phone: contact.phone,
              status: contact.status,
              ownerName: contact.ownerName,
              neodoveOwnerName: contact.neodoveOwnerName,
              nextFollowUpAt: contact.nextFollowUpAt,
              neodoveLeadId: contact.neodoveLeadId,
              neodoveMappedStatus: contact.neodoveMappedStatus,
              neodoveLastSyncAt: contact.neodoveLastSyncAt,
              reasons,
            }
          : null;
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .sort((a, b) => b.reasons.length - a.reasons.length || a.name.localeCompare(b.name));

    const summary = {
      trackedContacts: relevantContacts.length,
      activeContacts: relevantContacts.filter((contact) => activeStatuses.has(normalizeStatus(contact.status))).length,
      exceptionCount: exceptions.length,
      duplicateEvents: scopedEvents.filter((event) => Boolean(event.isDuplicate)).length,
      errorEvents: scopedEvents.filter((event) => String(event.processStatus || "").toLowerCase() === "error").length,
      processedEvents: scopedEvents.filter((event) => String(event.processStatus || "").toLowerCase() === "processed").length,
      missingOwner: exceptions.filter((row) => row.reasons.includes("missing_owner")).length,
      missingFollowUp: exceptions.filter((row) => row.reasons.includes("missing_follow_up")).length,
      statusDrift: exceptions.filter((row) => row.reasons.includes("status_drift")).length,
      staleSync: exceptions.filter((row) => row.reasons.includes("stale_sync")).length,
    };

    return NextResponse.json({
      ok: true,
      windowDays: lookbackDays,
      summary,
      exceptions: exceptions.slice(0, 60).map((row) => ({
        ...row,
        reasonLabels: row.reasons.map(humanizeReason),
      })),
      recentEvents: scopedEvents.slice(0, 25).map((event) => ({
        id: event.id,
        eventKey: event.eventKey,
        eventName: event.eventName,
        leadId: event.leadId,
        mobile: event.mobile,
        campaign: event.campaign,
        mappedStatus: event.mappedStatus,
        assignedTo: event.assignedTo,
        followUpAt: event.followUpAt,
        receivedAt: event.receivedAt,
        processedAt: event.processedAt,
        processStatus: event.processStatus,
        isDuplicate: Boolean(event.isDuplicate),
        errorMessage: event.errorMessage,
      })),
    });
  } catch (error) {
    console.error("NeoDove reconciliation error:", error);
    return NextResponse.json({ error: "Failed to load NeoDove reconciliation" }, { status: 500 });
  }
}
