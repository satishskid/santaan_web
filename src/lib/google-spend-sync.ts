import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { campaignSpend } from "@/db/schema";
import {
  fetchGoogleCampaignInsightsDebug,
  inferCenterFromGoogleCampaignName,
} from "@/lib/google-ads";
import { normalizeToken, parseDate } from "@/lib/ops-inputs";

const GOOGLE_SYNC_NOTE_PREFIX = "google_ads_api_sync";

function formatDateInTimeZone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

export function resolveDefaultGoogleReportDate(): string {
  const reportingTimeZone = process.env.GOOGLE_ADS_REPORTING_TIMEZONE || "Asia/Kolkata";
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return formatDateInTimeZone(yesterday, reportingTimeZone);
}

export function resolveGoogleReportDate(dateValue?: string | null): string {
  const parsed = parseDate(dateValue || null);
  return parsed || resolveDefaultGoogleReportDate();
}

export async function runGoogleSpendSync(reportDate: string) {
  const debug = await fetchGoogleCampaignInsightsDebug({ date: reportDate });
  const insights = debug.rows;

  await db
    .delete(campaignSpend)
    .where(
      and(
        eq(campaignSpend.channel, "google"),
        eq(campaignSpend.spendDate, reportDate),
        sql`${campaignSpend.notes} LIKE ${`${GOOGLE_SYNC_NOTE_PREFIX}:%`}`
      )
    );

  const rows = insights
    .map((item) => {
      const normalizedCampaign =
        normalizeToken(item.campaignName) || normalizeToken(item.campaignId) || "google_campaign_unknown";
      const normalizedAsset = normalizeToken(item.campaignId);
      const center = inferCenterFromGoogleCampaignName(item.campaignName);

      return {
        spendDate: item.date || reportDate,
        channel: "google",
        utmCampaign: normalizedCampaign,
        center,
        asset: normalizedAsset || null,
        amount: item.spend,
        notes: `${GOOGLE_SYNC_NOTE_PREFIX}:customer=${item.customerId};campaign_name=${item.campaignName};impressions=${item.impressions};clicks=${item.clicks}`,
      };
    })
    .filter((row) => row.amount > 0);

  if (rows.length > 0) {
    await db.insert(campaignSpend).values(rows);
  }

  const totalSpend = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const campaignCount = new Set(rows.map((row) => row.asset || row.utmCampaign)).size;
  const customers = debug.customersQueried.length;

  return {
    reportDate,
    syncedRows: rows.length,
    campaigns: campaignCount,
    customers,
    customersQueried: debug.customersQueried,
    perCustomer: debug.perCustomer,
    totalSpend: Math.round(totalSpend * 100) / 100,
  };
}

