import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { fieldActivityLogs } from "@/db/schema";
import { isAuthorizedOpsUser } from "@/lib/auth-helper";
import {
  ALLOWED_ACTIVITY_TYPES,
  ALLOWED_CENTERS,
  isAllowedValue,
  normalizeToken,
  parseAmount,
  parseDate,
  parseNonNegativeInteger,
} from "@/lib/ops-inputs";

const READ_ROLES = new Set(["admin", "ceo", "crm_ops_admin", "field_exec", "marketing_manager", "agency_ops"]);
const WRITE_ROLES = new Set(["admin", "ceo", "crm_ops_admin", "field_exec", "marketing_manager", "agency_ops"]);

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

function normalizePhone(value?: string | null) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
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
    const activityType = normalizeToken(searchParams.get("activityType"));

    const conditions = [];
    if (from) conditions.push(gte(fieldActivityLogs.activityDate, from));
    if (to) conditions.push(lte(fieldActivityLogs.activityDate, to));
    if (center) conditions.push(eq(fieldActivityLogs.center, center));
    if (activityType) conditions.push(eq(fieldActivityLogs.activityType, activityType));

    const whereClause =
      conditions.length > 1 ? and(...conditions) : conditions.length === 1 ? conditions[0] : undefined;

    const rows = await db
      .select()
      .from(fieldActivityLogs)
      .where(whereClause)
      .orderBy(desc(fieldActivityLogs.activityDate), desc(fieldActivityLogs.id));

    return NextResponse.json(
      { rows },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Field activities GET error:", error);
    return NextResponse.json({ error: "Failed to fetch field activity rows" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, role } = await requireOpsAccess();
    if (!authorized || !WRITE_ROLES.has(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const activityDate = parseDate(body?.activityDate);
    const center = normalizeToken(body?.center);
    const activityType = normalizeToken(body?.activityType);
    const assetCode = normalizeToken(body?.assetCode);
    const location = String(body?.location || "").trim();
    const ownerName = String(body?.ownerName || "").trim();
    const utmCampaign = normalizeToken(body?.utmCampaign);
    const spend = parseAmount(body?.spend ?? 0);
    const estimatedReach = parseNonNegativeInteger(body?.estimatedReach, 0);
    const actualFootfall = parseNonNegativeInteger(body?.actualFootfall, 0);
    const leadsCollected = parseNonNegativeInteger(body?.leadsCollected, 0);
    const qualifiedLeads = parseNonNegativeInteger(body?.qualifiedLeads, 0);
    const registrations = parseNonNegativeInteger(body?.registrations, 0);

    const qrCodeId = normalizeToken(body?.qrCodeId || "", "");
    const callNumber = normalizePhone(body?.callNumber);
    const whatsappNumber = normalizePhone(body?.whatsappNumber);
    const proofUrl = String(body?.proofUrl || "").trim();

    if (!activityDate || !assetCode || !location || !ownerName || !utmCampaign) {
      return NextResponse.json(
        { error: "activityDate, assetCode, location, ownerName, and utmCampaign are required" },
        { status: 400 }
      );
    }
    if (!isAllowedValue(center, ALLOWED_CENTERS)) {
      return NextResponse.json({ error: "center must be bhubaneswar/berhampur/bangalore" }, { status: 400 });
    }
    if (!isAllowedValue(activityType, ALLOWED_ACTIVITY_TYPES)) {
      return NextResponse.json({ error: "activityType must be doctor_visit/hoarding/camp/event" }, { status: 400 });
    }
    if (
      spend === null ||
      estimatedReach === null ||
      actualFootfall === null ||
      leadsCollected === null ||
      qualifiedLeads === null ||
      registrations === null
    ) {
      return NextResponse.json({ error: "Numeric fields must be valid non-negative values" }, { status: 400 });
    }
    if (qualifiedLeads > leadsCollected) {
      return NextResponse.json({ error: "qualifiedLeads cannot be greater than leadsCollected" }, { status: 400 });
    }
    if (registrations > leadsCollected) {
      return NextResponse.json({ error: "registrations cannot be greater than leadsCollected" }, { status: 400 });
    }
    if (!qrCodeId && !callNumber && !whatsappNumber) {
      return NextResponse.json(
        { error: "At least one tracking handle is required: qrCodeId, callNumber, or whatsappNumber" },
        { status: 400 }
      );
    }

    const inserted = await db
      .insert(fieldActivityLogs)
      .values({
        activityDate,
        center,
        activityType,
        assetCode,
        location,
        ownerName,
        spend,
        estimatedReach,
        actualFootfall,
        leadsCollected,
        qualifiedLeads,
        registrations,
        utmCampaign,
        qrCodeId: qrCodeId || null,
        callNumber: callNumber || null,
        whatsappNumber: whatsappNumber || null,
        proofUrl: proofUrl || null,
        notes: typeof body?.notes === "string" ? body.notes.trim() : null,
      })
      .returning();

    return NextResponse.json({ success: true, row: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error("Field activities POST error:", error);
    return NextResponse.json({ error: "Failed to create field activity row" }, { status: 500 });
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

    await db.delete(fieldActivityLogs).where(eq(fieldActivityLogs.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Field activities DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete field activity row" }, { status: 500 });
  }
}
