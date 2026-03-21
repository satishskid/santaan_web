import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { metaLaunchDrafts } from "@/db/schema";
import { isAuthorizedOpsUser } from "@/lib/auth-helper";
import { buildAdsManagerLink, centerFromAccount, formatPlacementsForStorage } from "@/lib/meta-launch";

const UPDATE_ROLES = new Set([
  "admin",
  "ceo",
  "crm_ops_admin",
  "marketing_manager",
  "agency_ops",
  "performance_marketer",
  "content_manager",
]);

const APPROVAL_ROLES = new Set([
  "admin",
  "ceo",
  "crm_ops_admin",
  "marketing_manager",
  "agency_ops",
  "performance_marketer",
]);

function normalizeRole(role?: string | null) {
  return String(role || "").trim().toLowerCase();
}

async function requireOpsAccess() {
  const session = await auth();
  const role = normalizeRole((session?.user as { role?: string } | undefined)?.role);
  const authorized = await isAuthorizedOpsUser(session?.user?.email, role);
  const identity = {
    email: session?.user?.email ? String(session.user.email).trim().toLowerCase() : "",
    name: session?.user?.name ? String(session.user.name).trim() : "",
  };
  return { authorized, role: role || "admin", identity };
}

function parseId(value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function toText(value: unknown) {
  const text = String(value || "").trim();
  return text || null;
}

function toBudget(value: unknown) {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100) / 100;
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { authorized, role, identity } = await requireOpsAccess();
    if (!authorized || !UPDATE_ROLES.has(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idParam } = await context.params;
    const id = parseId(idParam);
    if (!id) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await request.json();
    type DraftInsert = typeof metaLaunchDrafts.$inferInsert;
    const update: Partial<DraftInsert> = {
      updatedAt: new Date().toISOString(),
    };

    if (body?.accountId !== undefined) {
      const accountId = String(body.accountId || "").replace(/^act_/, "").trim();
      update.accountId = accountId;
      if (!body?.center) {
        update.center = centerFromAccount(accountId);
      }
      if (!body?.adsManagerLink) {
        update.adsManagerLink = buildAdsManagerLink(accountId);
      }
    }

    const editableFields: (keyof DraftInsert)[] = [
      "channel",
      "center",
      "objective",
      "campaignName",
      "adsetName",
      "adName",
      "status",
      "priority",
      "audienceSummary",
      "geoTargets",
      "budgetType",
      "budgetNotes",
      "utmCampaign",
      "landingUrl",
      "contentAngle",
      "hook",
      "primaryText",
      "headline",
      "description",
      "cta",
      "creativeFormat",
      "creativeBrief",
      "contentKeywords",
      "contentOwnerName",
      "performanceOwnerName",
      "requestedByEmail",
      "requestedByName",
      "approvalRequestedAt",
      "approvalNotes",
      "launchChecklist",
      "launchNotes",
      "adsManagerLink",
      "launchedAt",
    ];

    for (const field of editableFields) {
      if (body?.[field] !== undefined) {
        if (field === "budgetNotes" || field === "landingUrl" || field === "hook" || field === "primaryText" || field === "headline" || field === "description" || field === "cta" || field === "creativeFormat" || field === "creativeBrief" || field === "contentKeywords" || field === "contentAngle" || field === "audienceSummary" || field === "geoTargets" || field === "utmCampaign" || field === "campaignName" || field === "adsetName" || field === "adName" || field === "priority" || field === "budgetType" || field === "channel" || field === "center" || field === "objective" || field === "contentOwnerName" || field === "performanceOwnerName" || field === "requestedByEmail" || field === "requestedByName" || field === "approvalRequestedAt" || field === "approvalNotes" || field === "launchChecklist" || field === "launchNotes" || field === "adsManagerLink" || field === "launchedAt" || field === "status") {
          update[field] = toText(body[field]) as never;
        } else {
          update[field] = body[field];
        }
      }
    }

    if (body?.budgetInr !== undefined) {
      update.budgetInr = toBudget(body.budgetInr);
    }

    if (Array.isArray(body?.placements)) {
      update.placements = formatPlacementsForStorage(body.placements.map((value: unknown) => String(value)));
    } else if (body?.placements !== undefined) {
      update.placements = toText(body.placements);
    }

    const nextStatus = String(body?.status || update.status || "").trim().toLowerCase();
    if (nextStatus === "approved" || nextStatus === "launched") {
      if (!APPROVAL_ROLES.has(role)) {
        return NextResponse.json({ error: "Only performance/leadership roles can approve or launch drafts" }, { status: 403 });
      }
      update.approvedByEmail = identity.email || null;
      update.approvedByName = identity.name || null;
      update.approvedAt = new Date().toISOString();
    }

    if (nextStatus === "launched") {
      update.launchedAt = new Date().toISOString();
    }

    const [draft] = await db.update(metaLaunchDrafts).set(update).where(eq(metaLaunchDrafts.id, id)).returning();
    if (!draft) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, draft });
  } catch (error) {
    console.error("Update meta launch draft error:", error);
    return NextResponse.json({ error: "Failed to update Meta launch draft" }, { status: 500 });
  }
}
