import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAuthorizedOpsUser } from "@/lib/auth-helper";
import { fetchGa4DashboardSnapshot, readGa4Config } from "@/lib/ga4";

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

function parseDays(request: NextRequest) {
  const raw = new URL(request.url).searchParams.get("days");
  const parsed = Number(raw || 7);
  if (!Number.isFinite(parsed)) return 7;
  const rounded = Math.round(parsed);
  if (rounded < 1) return 1;
  if (rounded > 90) return 90;
  return rounded;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const role = normalizeRole((session?.user as { role?: string } | undefined)?.role);
    const authorized = await isAuthorizedOpsUser(session?.user?.email, role);

    if (!authorized || !READ_ROLES.has(role || "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = readGa4Config();
    if (!config) {
      return NextResponse.json({
        configured: false,
        message: "GA4 service account credentials are missing",
      });
    }

    const days = parseDays(request);
    const snapshot = await fetchGa4DashboardSnapshot(config, days);

    return NextResponse.json({
      configured: true,
      propertyId: config.propertyId,
      generatedAt: new Date().toISOString(),
      ...snapshot,
    });
  } catch (error) {
    console.error("GA4 dashboard API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch GA4 dashboard metrics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
