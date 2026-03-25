import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { tvAdLogs } from "@/db/schema";
import { isAuthorizedOpsUser } from "@/lib/auth-helper";
import {
  ALLOWED_CENTERS,
  isAllowedValue,
  normalizeToken,
  parseAmount,
  parseDate,
  parseNonNegativeInteger,
} from "@/lib/ops-inputs";

const READ_ROLES = new Set(["admin", "ceo", "crm_ops_admin", "marketing_manager", "agency_ops", "performance_marketer"]);
const WRITE_ROLES = new Set(["admin", "ceo", "crm_ops_admin", "marketing_manager", "agency_ops", "performance_marketer"]);

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

    const conditions = [];
    if (from) conditions.push(gte(tvAdLogs.airingDate, from));
    if (to) conditions.push(lte(tvAdLogs.airingDate, to));
    if (center) conditions.push(eq(tvAdLogs.center, center));

    const whereClause =
      conditions.length > 1 ? and(...conditions) : conditions.length === 1 ? conditions[0] : undefined;

    const rows = await db
      .select()
      .from(tvAdLogs)
      .where(whereClause)
      .orderBy(desc(tvAdLogs.airingDate), desc(tvAdLogs.id));

    return NextResponse.json(
      { rows },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("TV ads GET error:", error);
    return NextResponse.json({ error: "Failed to fetch TV ad rows" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, role } = await requireOpsAccess();
    if (!authorized || !WRITE_ROLES.has(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const airingDate = parseDate(body?.airingDate);
    const center = normalizeToken(body?.center);
    const channelName = String(body?.channelName || "").trim();
    const programName = String(body?.programName || "").trim();
    const timeSlot = String(body?.timeSlot || "").trim();
    const creativeCode = normalizeToken(body?.creativeCode);
    const tvCampaignCode = normalizeToken(body?.tvCampaignCode);
    const utmCampaign = normalizeToken(body?.utmCampaign);
    const spotDurationSec = parseNonNegativeInteger(body?.spotDurationSec, 20);
    const spotsCount = parseNonNegativeInteger(body?.spotsCount, 1);
    const spend = parseAmount(body?.spend ?? 0);

    const qrCodeId = normalizeToken(body?.qrCodeId || "", "");
    const ivrNumber = normalizePhone(body?.ivrNumber);
    const whatsappKeyword = normalizeToken(body?.whatsappKeyword || "", "");

    if (
      !airingDate ||
      !channelName ||
      !programName ||
      !timeSlot ||
      !creativeCode ||
      !tvCampaignCode ||
      !utmCampaign
    ) {
      return NextResponse.json(
        { error: "airingDate, channelName, programName, timeSlot, creativeCode, tvCampaignCode, utmCampaign are required" },
        { status: 400 }
      );
    }
    if (!isAllowedValue(center, ALLOWED_CENTERS)) {
      return NextResponse.json({ error: "center must be bhubaneswar/berhampur/bangalore" }, { status: 400 });
    }
    if (spotDurationSec === null || spotDurationSec <= 0) {
      return NextResponse.json({ error: "spotDurationSec must be greater than 0" }, { status: 400 });
    }
    if (spotsCount === null || spotsCount <= 0) {
      return NextResponse.json({ error: "spotsCount must be greater than 0" }, { status: 400 });
    }
    if (spend === null) {
      return NextResponse.json({ error: "spend must be a valid number" }, { status: 400 });
    }
    if (!qrCodeId && !ivrNumber && !whatsappKeyword) {
      return NextResponse.json(
        { error: "At least one tracking handle is required: qrCodeId, ivrNumber, or whatsappKeyword" },
        { status: 400 }
      );
    }

    const inserted = await db
      .insert(tvAdLogs)
      .values({
        airingDate,
        center,
        channelName,
        programName,
        timeSlot,
        spotDurationSec,
        spotsCount,
        spend,
        creativeCode,
        tvCampaignCode,
        utmCampaign,
        qrCodeId: qrCodeId || null,
        ivrNumber: ivrNumber || null,
        whatsappKeyword: whatsappKeyword || null,
        notes: typeof body?.notes === "string" ? body.notes.trim() : null,
      })
      .returning();

    return NextResponse.json({ success: true, row: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error("TV ads POST error:", error);
    return NextResponse.json({ error: "Failed to create TV ad row" }, { status: 500 });
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

    await db.delete(tvAdLogs).where(eq(tvAdLogs.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("TV ads DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete TV ad row" }, { status: 500 });
  }
}
