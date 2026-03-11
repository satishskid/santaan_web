import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { campaignSpend } from "@/db/schema";
import { isAuthorizedAdmin, isAuthorizedOpsUser } from "@/lib/auth-helper";
import { fetchMetaCampaignInsights, inferCenterFromCampaignName } from "@/lib/meta-ads";
import { normalizeToken, parseDate } from "@/lib/ops-inputs";

export const runtime = "nodejs";

const META_SYNC_NOTE_PREFIX = "meta_api_sync";

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
  const reportingTimeZone = process.env.META_REPORTING_TIMEZONE || "Asia/Kolkata";
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return formatDateInTimeZone(yesterday, reportingTimeZone);
}

function resolveDate(request: NextRequest, bodyDate?: string | null): string {
  const queryDate = parseDate(new URL(request.url).searchParams.get("date"));
  const bodyParsedDate = parseDate(bodyDate || null);
  return queryDate || bodyParsedDate || resolveDefaultDate();
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
  const secret = process.env.META_SPEND_SYNC_SECRET?.trim();
  if (!secret) return false;

  const url = new URL(request.url);
  const token =
    request.headers.get("x-sync-token") ||
    request.headers.get("x-meta-sync-token") ||
    url.searchParams.get("token") ||
    "";

  return token.trim() === secret;
}

async function runMetaSync(reportDate: string, explicitAccountIds?: string[]) {
  const insights = await fetchMetaCampaignInsights({ date: reportDate, accountIds: explicitAccountIds });

  await db
    .delete(campaignSpend)
    .where(
      and(
        eq(campaignSpend.channel, "meta"),
        eq(campaignSpend.spendDate, reportDate),
        sql`${campaignSpend.notes} LIKE ${`${META_SYNC_NOTE_PREFIX}:%`}`
      )
    );

  const rows = insights
    .map((item) => {
      const normalizedCampaign =
        normalizeToken(item.campaignName) || normalizeToken(item.campaignId) || "meta_campaign_unknown";
      const normalizedAsset = normalizeToken(item.campaignId);
      const center = inferCenterFromCampaignName(item.campaignName);

      return {
        spendDate: item.dateStart || reportDate,
        channel: "meta",
        utmCampaign: normalizedCampaign,
        center,
        asset: normalizedAsset || null,
        amount: item.spend,
        notes: `${META_SYNC_NOTE_PREFIX}:account=${item.accountId};campaign_name=${item.campaignName};impressions=${item.impressions};clicks=${item.clicks}`,
      };
    })
    .filter((row) => row.amount > 0);

  if (rows.length > 0) {
    await db.insert(campaignSpend).values(rows);
  }

  const totalSpend = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const campaignCount = new Set(rows.map((row) => row.asset || row.utmCampaign)).size;
  const perAccountMap = new Map<string, number>();
  for (const item of insights) {
    const current = perAccountMap.get(item.accountId) || 0;
    perAccountMap.set(item.accountId, current + Number(item.spend || 0));
  }
  const accountsQueried = Array.from(perAccountMap.keys());
  const perAccount = Array.from(perAccountMap.entries()).map(([accountId, spend]) => ({
    accountId,
    spend: Math.round(spend * 100) / 100,
  }));

  return {
    reportDate,
    syncedRows: rows.length,
    campaigns: campaignCount,
    accountsQueried,
    perAccount,
    totalSpend: Math.round(totalSpend * 100) / 100,
  };
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
  const accountParam = new URL(request.url).searchParams.get("account");
  const explicitAccountIds = accountParam
    ? accountParam
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : undefined;

  try {
    const result = await runMetaSync(reportDate, explicitAccountIds);
    return NextResponse.json({
      success: true,
      source: "meta_graph_api",
      ...result,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Meta spend sync failed:", error);
    return NextResponse.json(
      {
        error: "Meta spend sync failed",
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
