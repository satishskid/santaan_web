import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAuthorizedAdmin, isAuthorizedOpsUser } from "@/lib/auth-helper";
import { parseDate } from "@/lib/ops-inputs";
import { resolveDefaultGoogleReportDate, runGoogleSpendSync } from "@/lib/google-spend-sync";

export const runtime = "nodejs";

function resolveDate(request: NextRequest, bodyDate?: string | null): string {
  const queryDate = parseDate(new URL(request.url).searchParams.get("date"));
  const bodyParsedDate = parseDate(bodyDate || null);
  return queryDate || bodyParsedDate || resolveDefaultGoogleReportDate();
}

const WRITE_ROLES = new Set([
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

async function canTriggerSync() {
  const session = await auth();
  const role = normalizeRole((session?.user as { role?: string } | undefined)?.role);
  if (role && WRITE_ROLES.has(role)) return true;

  const opsAccess = await isAuthorizedOpsUser(session?.user?.email, role || null);
  if (opsAccess && (!role || WRITE_ROLES.has(role))) return true;

  return isAuthorizedAdmin(session?.user?.email);
}

function hasValidSyncToken(request: NextRequest): boolean {
  const secret = process.env.GOOGLE_SPEND_SYNC_SECRET?.trim();
  if (!secret) return false;

  const url = new URL(request.url);
  const token =
    request.headers.get("x-sync-token") ||
    request.headers.get("x-google-sync-token") ||
    url.searchParams.get("token") ||
    "";

  return token.trim() === secret;
}

async function handle(request: NextRequest) {
  const tokenAuth = hasValidSyncToken(request);
  const adminAuth = tokenAuth ? true : await canTriggerSync();
  if (!adminAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let bodyDate: string | null = null;
  if (request.method === "POST") {
    try {
      const body = (await request.json()) as { date?: string };
      bodyDate = body?.date || null;
    } catch {
      bodyDate = null;
    }
  }

  const reportDate = resolveDate(request, bodyDate);

  try {
    const result = await runGoogleSpendSync(reportDate);
    return NextResponse.json({
      success: true,
      source: "google_ads_api",
      ...result,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Google spend sync failed:", error);
    return NextResponse.json(
      {
        error: "Google spend sync failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
