import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAuthorizedAdmin, isAuthorizedOpsUser } from "@/lib/auth-helper";
import { fetchGoogleCampaignInsightsDebug } from "@/lib/google-ads";
import { parseDate } from "@/lib/ops-inputs";

export const runtime = "nodejs";

const READ_ROLES = new Set([
  "admin",
  "ceo",
  "crm_ops_admin",
  "agency_ops",
  "marketing_manager",
  "performance_marketer",
]);

function normalizeRole(value?: string | null) {
  return String(value || "").trim().toLowerCase();
}

async function canReadDebug() {
  const session = await auth();
  const role = normalizeRole((session?.user as { role?: string } | undefined)?.role);

  if (role && READ_ROLES.has(role)) return true;

  const opsAccess = await isAuthorizedOpsUser(session?.user?.email, role || null);
  if (opsAccess && (!role || READ_ROLES.has(role))) return true;

  return isAuthorizedAdmin(session?.user?.email);
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

function resolveDefaultDate(): string {
  const reportingTimeZone = process.env.GOOGLE_ADS_REPORTING_TIMEZONE || "Asia/Kolkata";
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return formatDateInTimeZone(yesterday, reportingTimeZone);
}

export async function GET(request: NextRequest) {
  if (!(await canReadDebug())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const queryDate = parseDate(new URL(request.url).searchParams.get("date"));
  const reportDate = queryDate || resolveDefaultDate();

  try {
    const debug = await fetchGoogleCampaignInsightsDebug({ date: reportDate });
    const totalSpend = debug.rows.reduce((sum, row) => sum + Number(row.spend || 0), 0);
    const campaignCount = new Set(
      debug.rows.map((row) => row.campaignId || row.campaignName).filter(Boolean)
    ).size;

    return NextResponse.json({
      success: true,
      reportDate,
      customersQueried: debug.customersQueried,
      perCustomer: debug.perCustomer,
      summary: {
        rows: debug.rows.length,
        campaigns: campaignCount,
        customers: debug.customersQueried.length,
        totalSpend: Math.round(totalSpend * 100) / 100,
      },
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Google debug fetch failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
