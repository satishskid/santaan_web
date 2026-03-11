import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { settings } from "@/db/schema";
import { resolveGoogleReportDate, runGoogleSpendSync } from "@/lib/google-spend-sync";

export const runtime = "nodejs";
const GOOGLE_AUTO_SYNC_STATUS_KEY = "google_auto_sync_status";

type GoogleAutoSyncStatus = {
  status: "success" | "failed";
  lastAttemptAt: string;
  lastSuccessAt: string | null;
  reportDate: string;
  syncedRows: number;
  totalSpend: number;
  customers: number;
  error: string | null;
};

function isAuthorizedCronRequest(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) return false;

  const authHeader = request.headers.get("authorization") || "";
  if (authHeader === `Bearer ${cronSecret}`) return true;

  const token = new URL(request.url).searchParams.get("token") || "";
  return token.trim() === cronSecret;
}

async function readExistingStatus() {
  const row = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, GOOGLE_AUTO_SYNC_STATUS_KEY))
    .get();

  if (!row?.value) return null;
  try {
    return JSON.parse(row.value) as GoogleAutoSyncStatus;
  } catch {
    return null;
  }
}

async function writeStatus(status: GoogleAutoSyncStatus) {
  await db
    .insert(settings)
    .values({
      key: GOOGLE_AUTO_SYNC_STATUS_KEY,
      value: JSON.stringify(status),
    })
    .onConflictDoUpdate({
      target: settings.key,
      set: {
        value: JSON.stringify(status),
        updatedAt: new Date().toISOString(),
      },
    });
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = new URL(request.url).searchParams.get("date");
  const reportDate = resolveGoogleReportDate(date);
  const attemptedAt = new Date().toISOString();

  try {
    const result = await runGoogleSpendSync(reportDate);
    await writeStatus({
      status: "success",
      lastAttemptAt: attemptedAt,
      lastSuccessAt: attemptedAt,
      reportDate: result.reportDate,
      syncedRows: result.syncedRows,
      totalSpend: result.totalSpend,
      customers: result.customers,
      error: null,
    });

    return NextResponse.json({
      success: true,
      source: "google_ads_api_cron",
      ...result,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Google cron sync failed:", error);
    const existing = await readExistingStatus();
    await writeStatus({
      status: "failed",
      lastAttemptAt: attemptedAt,
      lastSuccessAt: existing?.lastSuccessAt || null,
      reportDate,
      syncedRows: 0,
      totalSpend: 0,
      customers: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        error: "Google cron sync failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
