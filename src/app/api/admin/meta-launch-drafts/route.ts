import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { metaLaunchDrafts } from "@/db/schema";
import { isAuthorizedOpsUser } from "@/lib/auth-helper";
import {
  buildAdsManagerLink,
  centerFromAccount,
  defaultPlacementsForAccount,
  formatPlacementsForStorage,
} from "@/lib/meta-launch";

const READ_ROLES = new Set([
  "admin",
  "ceo",
  "crm_ops_admin",
  "marketing_manager",
  "agency_ops",
  "performance_marketer",
  "content_manager",
]);

const CREATE_ROLES = new Set([
  "admin",
  "ceo",
  "crm_ops_admin",
  "marketing_manager",
  "agency_ops",
  "performance_marketer",
  "content_manager",
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

function toText(value: unknown) {
  const text = String(value || "").trim();
  return text || null;
}

function toBudget(value: unknown) {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100) / 100;
}

export async function GET() {
  try {
    const { authorized, role } = await requireOpsAccess();
    if (!authorized || !READ_ROLES.has(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const drafts = await db.select().from(metaLaunchDrafts).orderBy(desc(metaLaunchDrafts.updatedAt), desc(metaLaunchDrafts.id));
    return NextResponse.json({ drafts });
  } catch (error) {
    console.error("Fetch meta launch drafts error:", error);
    return NextResponse.json({ error: "Failed to fetch Meta launch drafts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { authorized, role, identity } = await requireOpsAccess();
    if (!authorized || !CREATE_ROLES.has(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const accountId = String(body?.accountId || "").replace(/^act_/, "").trim();
    const campaignName = String(body?.campaignName || "").trim();

    if (!accountId || !campaignName) {
      return NextResponse.json({ error: "Account and campaign name are required" }, { status: 400 });
    }

    const placements = Array.isArray(body?.placements)
      ? formatPlacementsForStorage(body.placements.map((value: unknown) => String(value)))
      : formatPlacementsForStorage(defaultPlacementsForAccount(accountId));

    const [created] = await db
      .insert(metaLaunchDrafts)
      .values({
        channel: "meta",
        accountId,
        center: toText(body?.center) || centerFromAccount(accountId),
        objective: toText(body?.objective) || "OUTCOME_LEADS",
        campaignName,
        adsetName: toText(body?.adsetName),
        adName: toText(body?.adName),
        status: toText(body?.status) || "draft",
        priority: toText(body?.priority) || "medium",
        audienceSummary: toText(body?.audienceSummary),
        geoTargets: toText(body?.geoTargets),
        placements,
        budgetType: toText(body?.budgetType) || "daily",
        budgetInr: toBudget(body?.budgetInr),
        budgetNotes: toText(body?.budgetNotes),
        utmCampaign: toText(body?.utmCampaign),
        landingUrl: toText(body?.landingUrl),
        contentAngle: toText(body?.contentAngle),
        hook: toText(body?.hook),
        primaryText: toText(body?.primaryText),
        headline: toText(body?.headline),
        description: toText(body?.description),
        cta: toText(body?.cta),
        creativeFormat: toText(body?.creativeFormat),
        creativeBrief: toText(body?.creativeBrief),
        contentKeywords: toText(body?.contentKeywords),
        contentOwnerName: toText(body?.contentOwnerName),
        performanceOwnerName: toText(body?.performanceOwnerName),
        requestedByEmail: identity.email || null,
        requestedByName: identity.name || null,
        approvalRequestedAt: toText(body?.approvalRequestedAt),
        adsManagerLink: toText(body?.adsManagerLink) || buildAdsManagerLink(accountId),
        launchChecklist: toText(body?.launchChecklist),
        launchNotes: toText(body?.launchNotes),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({ success: true, draft: created }, { status: 201 });
  } catch (error) {
    console.error("Create meta launch draft error:", error);
    return NextResponse.json({ error: "Failed to create Meta launch draft" }, { status: 500 });
  }
}
