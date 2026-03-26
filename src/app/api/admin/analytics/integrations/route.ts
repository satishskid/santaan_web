import { NextResponse } from "next/server";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { isAuthorizedOpsUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";
import { campaignSpend, contacts, metaConversionEvents, neodoveEvents } from "@/db/schema";
import { readGa4Config } from "@/lib/ga4";
import { readMetaAdsConfig } from "@/lib/meta-ads";
import { readMetaConversionsConfig } from "@/lib/meta-conversions";
import { readSearchConsoleConfig } from "@/lib/search-console";
import { readZohoCliqConfig } from "@/lib/zoho-cliq";

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

function recentIso(msAgo: number) {
  return new Date(Date.now() - msAgo).toISOString();
}

export async function GET() {
  try {
    const session = await auth();
    const role = normalizeRole((session?.user as { role?: string } | undefined)?.role);
    const authorized = await isAuthorizedOpsUser(session?.user?.email, role);

    if (!authorized || !READ_ROLES.has(role || "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [neodoveSummary, spendSummary, neodoveLeadSummary, neodoveLastEvent, metaSignalSummary, metaSignalLastEvent] = await Promise.all([
      db
        .select({
          processed: sql<number>`SUM(CASE WHEN ${neodoveEvents.processStatus} = 'processed' THEN 1 ELSE 0 END)`,
          errors: sql<number>`SUM(CASE WHEN ${neodoveEvents.processStatus} = 'error' THEN 1 ELSE 0 END)`,
          duplicates: sql<number>`SUM(CASE WHEN ${neodoveEvents.isDuplicate} = 1 THEN 1 ELSE 0 END)`,
        })
        .from(neodoveEvents)
        .where(gte(neodoveEvents.receivedAt, recentIso(24 * 60 * 60 * 1000)))
        .get(),
      db
        .select({
          count: sql<number>`COUNT(*)`,
          total: sql<number>`COALESCE(SUM(${campaignSpend.amount}), 0)`,
          lastSeenAt: sql<string | null>`MAX(${campaignSpend.updatedAt})`,
        })
        .from(campaignSpend)
        .where(gte(campaignSpend.spendDate, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)))
        .get(),
      db
        .select({
          tracked: sql<number>`COUNT(*)`,
          syncErrors: sql<number>`SUM(CASE WHEN ${contacts.neodoveSyncStatus} = 'error' THEN 1 ELSE 0 END)`,
          missingFollowUp: sql<number>`SUM(CASE WHEN ${contacts.neodoveSyncStatus} = 'needs_followup' THEN 1 ELSE 0 END)`,
        })
        .from(contacts)
        .where(
          and(
            sql`${contacts.neodoveLeadId} IS NOT NULL`,
            eq(contacts.leadSource, "neodove_webhook")
          )
        )
        .get(),
      db.select().from(neodoveEvents).orderBy(desc(neodoveEvents.receivedAt), desc(neodoveEvents.id)).get(),
      db
        .select({
          processed: sql<number>`SUM(CASE WHEN ${metaConversionEvents.processStatus} = 'processed' THEN 1 ELSE 0 END)`,
          errors: sql<number>`SUM(CASE WHEN ${metaConversionEvents.processStatus} = 'error' THEN 1 ELSE 0 END)`,
          skipped: sql<number>`SUM(CASE WHEN ${metaConversionEvents.processStatus} = 'skipped' THEN 1 ELSE 0 END)`,
          qualified: sql<number>`SUM(CASE WHEN ${metaConversionEvents.signalType} = 'lead_qualified' THEN 1 ELSE 0 END)`,
          converted: sql<number>`SUM(CASE WHEN ${metaConversionEvents.signalType} = 'patient_converted' THEN 1 ELSE 0 END)`,
        })
        .from(metaConversionEvents)
        .where(gte(metaConversionEvents.receivedAt, recentIso(24 * 60 * 60 * 1000)))
        .get(),
      db.select().from(metaConversionEvents).orderBy(desc(metaConversionEvents.receivedAt), desc(metaConversionEvents.id)).get(),
    ]);

    const ga4Config = readGa4Config();
    const searchConsoleConfig = readSearchConsoleConfig();
    const metaConfig = readMetaAdsConfig();
    const metaConversionsConfig = readMetaConversionsConfig();
    const zohoCliqConfig = readZohoCliqConfig();
    const neodoveConfigured = Boolean(
      process.env.NEODOVE_WEBHOOK_SECRET?.trim() ||
        process.env.NEODOVE_CUSTOM_INTEGRATION_URL?.trim() ||
        process.env.NEODOVE_INTEGRATION_ID?.trim()
    );

    return NextResponse.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      services: {
        ga4: {
          configured: Boolean(ga4Config),
          status: ga4Config ? "ready" : "missing",
          propertyId: ga4Config?.propertyId || null,
          message: ga4Config ? "GA4 service account and property id are configured." : "GA4 service account credentials are missing.",
        },
        searchConsole: {
          configured: Boolean(searchConsoleConfig),
          status: searchConsoleConfig ? "ready" : "missing",
          siteUrl: searchConsoleConfig?.siteUrl || null,
          message: searchConsoleConfig ? "Search Console service account is configured." : "Search Console service account credentials are missing.",
        },
        meta: {
          configured: Boolean(metaConfig),
          status: metaConfig ? "ready" : "missing",
          accountCount: metaConfig?.accountIds.length || 0,
          appSecretConfigured: Boolean(metaConfig?.appSecretConfigured),
          conversionsConfigured: Boolean(metaConversionsConfig),
          spendRows7d: Number(spendSummary?.count || 0),
          spendTotal7d: Number(spendSummary?.total || 0),
          lastSpendAt: spendSummary?.lastSeenAt || null,
          conversionsProcessed24h: Number(metaSignalSummary?.processed || 0),
          conversionsErrors24h: Number(metaSignalSummary?.errors || 0),
          conversionsSkipped24h: Number(metaSignalSummary?.skipped || 0),
          qualifiedSignals24h: Number(metaSignalSummary?.qualified || 0),
          convertedSignals24h: Number(metaSignalSummary?.converted || 0),
          lastConversionAt: metaSignalLastEvent?.receivedAt || null,
          message: metaConfig ? "Meta API credentials are configured." : "Meta access token or account ids are missing.",
        },
        zohoCliq: {
          configured: Boolean(zohoCliqConfig),
          status: zohoCliqConfig ? "ready" : "missing",
          channel: zohoCliqConfig?.channelUniqueName || null,
          message: zohoCliqConfig
            ? "Zoho Cliq OAuth credentials and channel are configured."
            : "Zoho Cliq OAuth credentials are missing.",
        },
        neodove: {
          configured: neodoveConfigured,
          status: !neodoveConfigured ? "missing" : "ready",
          processed24h: Number(neodoveSummary?.processed || 0),
          errors24h: Number(neodoveSummary?.errors || 0),
          duplicates24h: Number(neodoveSummary?.duplicates || 0),
          trackedContacts: Number(neodoveLeadSummary?.tracked || 0),
          syncErrors: Number(neodoveLeadSummary?.syncErrors || 0),
          missingFollowUp: Number(neodoveLeadSummary?.missingFollowUp || 0),
          lastEventAt: neodoveLastEvent?.receivedAt || null,
          message: neodoveConfigured
            ? "NeoDove webhook and sync fields are available."
            : "NeoDove webhook secret or integration config is missing.",
        },
      },
    });
  } catch (error) {
    console.error("Analytics integration status error:", error);
    return NextResponse.json({ error: "Failed to load integration status" }, { status: 500 });
  }
}
