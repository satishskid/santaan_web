import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAuthorizedOpsUser } from "@/lib/auth-helper";
import {
  getMetaConversionEventSummary,
  listRecentMetaConversionEvents,
  retryMetaConversionEvent,
} from "@/lib/meta-conversions";

export const runtime = "nodejs";

const READ_ROLES = new Set([
  "admin",
  "ceo",
  "crm_ops_admin",
  "marketing_manager",
  "agency_ops",
  "performance_marketer",
  "content_manager",
  "ivr_manager",
  "telecaller_manager",
]);

function normalizeRole(role?: string | null) {
  return String(role || "").trim().toLowerCase();
}

async function requireAccess() {
  const session = await auth();
  const role = normalizeRole((session?.user as { role?: string } | undefined)?.role);
  const authorized = await isAuthorizedOpsUser(session?.user?.email, role);
  return {
    authorized,
    role,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { authorized, role } = await requireAccess();
    if (!authorized || !READ_ROLES.has(role || "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = Number(new URL(req.url).searchParams.get("limit") || 30);
    const [summary, events] = await Promise.all([
      getMetaConversionEventSummary(),
      listRecentMetaConversionEvents(limit),
    ]);

    return NextResponse.json({
      ok: true,
      summary,
      events,
    });
  } catch (error) {
    console.error("Meta conversion events fetch error:", error);
    return NextResponse.json({ error: "Failed to load Meta conversion events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, role } = await requireAccess();
    if (!authorized || !READ_ROLES.has(role || "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as { eventId?: number };
    const eventId = Number(body?.eventId || 0);
    if (!Number.isInteger(eventId) || eventId <= 0) {
      return NextResponse.json({ error: "Valid eventId is required" }, { status: 400 });
    }

    await retryMetaConversionEvent(eventId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Meta conversion event retry error:", error);
    const message = error instanceof Error ? error.message : "Failed to retry Meta conversion event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
