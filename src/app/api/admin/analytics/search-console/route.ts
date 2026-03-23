import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAuthorizedOpsUser } from "@/lib/auth-helper";
import { fetchSearchConsoleSnapshot, normalizeSiteUrl, readSearchConsoleConfig } from "@/lib/search-console";
import { db } from "@/lib/db";
import { settings } from "@/db/schema";
import { inArray } from "drizzle-orm";

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

async function resolveSiteUrlOverride() {
  const rows = await db
    .select({ key: settings.key, value: settings.value })
    .from(settings)
    .where(
      inArray(settings.key, [
        "SEARCH_CONSOLE_SITE_URL",
        "GOOGLE_SEARCH_CONSOLE_SITE_URL",
      ])
    );
  const override = rows.find((row) => row.value && row.value.trim().length > 0)?.value || "";
  const normalized = normalizeSiteUrl(override);
  return normalized || "";
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const role = normalizeRole((session?.user as { role?: string } | undefined)?.role);
    const authorized = await isAuthorizedOpsUser(session?.user?.email, role);

    if (!authorized || !READ_ROLES.has(role || "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = readSearchConsoleConfig();
    if (!config) {
      return NextResponse.json({
        configured: false,
        message: "Search Console service account credentials are missing",
      });
    }

    const overrideSiteUrl = await resolveSiteUrlOverride();
    if (overrideSiteUrl) {
      config.siteUrl = overrideSiteUrl;
    }

    const days = parseDays(request);
    const snapshot = await fetchSearchConsoleSnapshot(config, days);

    return NextResponse.json({
      configured: true,
      generatedAt: new Date().toISOString(),
      ...snapshot,
    });
  } catch (error) {
    console.error("Search Console API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch Search Console metrics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
