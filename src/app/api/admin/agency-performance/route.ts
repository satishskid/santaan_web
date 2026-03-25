import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { agencyPerformanceLogs } from "@/db/schema";
import { isAuthorizedOpsUser } from "@/lib/auth-helper";
import {
  ALLOWED_CENTERS,
  ALLOWED_PLATFORMS,
  ALLOWED_UTM_MEDIUM,
  isAllowedValue,
  normalizeToken,
  parseAmount,
  parseDate,
  parseNonNegativeInteger,
} from "@/lib/ops-inputs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const READ_ROLES = new Set(["admin", "ceo", "crm_ops_admin", "marketing_manager", "agency_ops", "performance_marketer"]);
const WRITE_ROLES = new Set(["admin", "ceo", "crm_ops_admin", "marketing_manager", "agency_ops", "performance_marketer"]);

function normalizeRole(role?: string | null) {
  return String(role || "").trim().toLowerCase();
}

async function requireOpsAccess() {
  const session = await auth();
  const sessionRole = normalizeRole((session?.user as { role?: string } | undefined)?.role);
  const authorized = await isAuthorizedOpsUser(session?.user?.email, sessionRole);
  const role = sessionRole || "admin";
  return { authorized, role };
}

export async function GET(request: NextRequest) {
  try {
    const { authorized, role } = await requireOpsAccess();
    if (!authorized || !READ_ROLES.has(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = parseDate(searchParams.get("from"));
    const to = parseDate(searchParams.get("to"));
    const center = normalizeToken(searchParams.get("center"));
    const platform = normalizeToken(searchParams.get("platform"));

    const conditions = [];
    if (from) conditions.push(gte(agencyPerformanceLogs.reportDate, from));
    if (to) conditions.push(lte(agencyPerformanceLogs.reportDate, to));
    if (center) conditions.push(eq(agencyPerformanceLogs.center, center));
    if (platform) conditions.push(eq(agencyPerformanceLogs.platform, platform));

    const whereClause =
      conditions.length > 1 ? and(...conditions) : conditions.length === 1 ? conditions[0] : undefined;

    const rows = await db
      .select()
      .from(agencyPerformanceLogs)
      .where(whereClause)
      .orderBy(desc(agencyPerformanceLogs.reportDate), desc(agencyPerformanceLogs.id));

    return NextResponse.json(
      { rows },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Agency performance GET error:", error);
    return NextResponse.json({ error: "Failed to fetch agency performance rows" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, role } = await requireOpsAccess();
    if (!authorized || !WRITE_ROLES.has(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const reportDate = parseDate(body?.reportDate);
    const platform = normalizeToken(body?.platform);
    const center = normalizeToken(body?.center);
    const campaignId = normalizeToken(body?.campaignId);
    const campaignName = String(body?.campaignName || "").trim();
    const utmSource = normalizeToken(body?.utmSource || platform);
    const utmMedium = normalizeToken(body?.utmMedium);
    const utmCampaign = normalizeToken(body?.utmCampaign);
    const spend = parseAmount(body?.spend);
    const impressions = parseNonNegativeInteger(body?.impressions, 0);
    const clicks = parseNonNegativeInteger(body?.clicks, 0);
    const leads = parseNonNegativeInteger(body?.leads, 0);
    const qualifiedLeads = parseNonNegativeInteger(body?.qualifiedLeads, 0);
    const registrations = parseNonNegativeInteger(body?.registrations, 0);

    if (!reportDate || !campaignId || !campaignName || !utmCampaign || spend === null) {
      return NextResponse.json(
        { error: "reportDate, campaignId, campaignName, utmCampaign, and spend are required" },
        { status: 400 }
      );
    }
    if (!isAllowedValue(platform, ALLOWED_PLATFORMS)) {
      return NextResponse.json({ error: "platform must be meta/google/youtube" }, { status: 400 });
    }
    if (!isAllowedValue(center, ALLOWED_CENTERS)) {
      return NextResponse.json({ error: "center must be bhubaneswar/berhampur/bangalore" }, { status: 400 });
    }
    if (!isAllowedValue(utmSource, ALLOWED_PLATFORMS)) {
      return NextResponse.json({ error: "utmSource must be meta/google/youtube" }, { status: 400 });
    }
    if (!isAllowedValue(utmMedium, ALLOWED_UTM_MEDIUM)) {
      return NextResponse.json({ error: "utmMedium must be paid_social/cpc/video" }, { status: 400 });
    }
    if (
      impressions === null ||
      clicks === null ||
      leads === null ||
      qualifiedLeads === null ||
      registrations === null
    ) {
      return NextResponse.json({ error: "impressions, clicks, leads, qualifiedLeads, registrations must be >= 0" }, { status: 400 });
    }
    if (qualifiedLeads > leads) {
      return NextResponse.json({ error: "qualifiedLeads cannot be greater than leads" }, { status: 400 });
    }
    if (registrations > leads) {
      return NextResponse.json({ error: "registrations cannot be greater than leads" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(agencyPerformanceLogs)
      .where(
        and(
          eq(agencyPerformanceLogs.reportDate, reportDate),
          eq(agencyPerformanceLogs.platform, platform),
          eq(agencyPerformanceLogs.center, center),
          eq(agencyPerformanceLogs.campaignId, campaignId),
          eq(agencyPerformanceLogs.utmCampaign, utmCampaign),
        ),
      )
      .get();

    if (existing?.id) {
      const updated = await db
        .update(agencyPerformanceLogs)
        .set({
          campaignName,
          utmSource,
          utmMedium,
          spend,
          impressions,
          clicks,
          leads,
          qualifiedLeads,
          registrations,
          notes: typeof body?.notes === "string" ? body.notes.trim() : null,
        })
        .where(eq(agencyPerformanceLogs.id, existing.id))
        .returning();

      return NextResponse.json({ success: true, row: updated[0], deduped: true }, { status: 200 });
    }

    const inserted = await db
      .insert(agencyPerformanceLogs)
      .values({
        reportDate,
        platform,
        center,
        campaignId,
        campaignName,
        utmSource,
        utmMedium,
        utmCampaign,
        spend,
        impressions,
        clicks,
        leads,
        qualifiedLeads,
        registrations,
        notes: typeof body?.notes === "string" ? body.notes.trim() : null,
      })
      .returning();

    return NextResponse.json({ success: true, row: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error("Agency performance POST error:", error);
    return NextResponse.json({ error: "Failed to create agency performance row" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { authorized, role } = await requireOpsAccess();
    if (!authorized || !WRITE_ROLES.has(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Valid id is required" }, { status: 400 });
    }

    await db.delete(agencyPerformanceLogs).where(eq(agencyPerformanceLogs.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Agency performance DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete agency performance row" }, { status: 500 });
  }
}
