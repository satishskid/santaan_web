import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAuthorizedOpsUser } from "@/lib/auth-helper";
import { fetchMetaDashboardSnapshot, readMetaAdsConfig } from "@/lib/meta-ads";

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
  if (rounded > 30) return 30;
  return rounded;
}

function formatDateInTimeZone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

function resolveWindow(days: number) {
  const reportingTimeZone = process.env.META_REPORTING_TIMEZONE || "Asia/Kolkata";
  const untilDate = new Date();
  const sinceDate = new Date();
  sinceDate.setDate(untilDate.getDate() - Math.max(0, days - 1));
  return {
    since: formatDateInTimeZone(sinceDate, reportingTimeZone),
    until: formatDateInTimeZone(untilDate, reportingTimeZone),
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const role = normalizeRole((session?.user as { role?: string } | undefined)?.role);
    const authorized = await isAuthorizedOpsUser(session?.user?.email, role);

    if (!authorized || !READ_ROLES.has(role || "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = readMetaAdsConfig();
    if (!config) {
      return NextResponse.json({
        configured: false,
        message: "Meta access token or account ids are missing",
      });
    }

    const days = parseDays(request);
    const window = resolveWindow(days);
    const snapshot = await fetchMetaDashboardSnapshot({
      ...window,
      windowDays: days,
    });

    return NextResponse.json({
      configured: true,
      accountCount: config.accountIds.length,
      appSecretConfigured: config.appSecretConfigured,
      generatedAt: new Date().toISOString(),
      ...snapshot,
    });
  } catch (error) {
    console.error("Meta analytics API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch Meta analytics metrics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
