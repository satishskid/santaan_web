import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAuthorizedAdmin, isAuthorizedOpsUser } from "@/lib/auth-helper";
import { runGoogleBusinessReviewSync } from "@/lib/google-business-profile";

export const runtime = "nodejs";

const WRITE_ROLES = new Set(["admin", "ceo", "crm_ops_admin", "agency_ops", "marketing_manager", "performance_marketer"]);

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
  const secret = process.env.GOOGLE_BUSINESS_SYNC_SECRET?.trim();
  if (!secret) return false;

  const url = new URL(request.url);
  const token =
    request.headers.get("x-sync-token") ||
    request.headers.get("x-google-business-sync-token") ||
    url.searchParams.get("token") ||
    "";

  return token.trim() === secret;
}

async function handle(request: NextRequest) {
  const tokenAuth = hasValidSyncToken(request);
  const authorized = tokenAuth ? true : await canTriggerSync();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runGoogleBusinessReviewSync();
    return NextResponse.json({
      success: true,
      source: "google_business_profile",
      syncedAt: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Google review sync failed",
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
