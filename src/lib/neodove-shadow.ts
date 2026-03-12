import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { neodoveCampaignMappings, neodoveEventLogs } from "@/db/schema";
import type { NeoDoveWebhookLead } from "@/lib/neodove";

export interface NeoDoveShadowSummary {
  windowDays: number;
  totalEvents: number;
  mappedEvents: number;
  unmappedEvents: number;
  connectedCalls: number;
  qualifiedSignals: number;
  activeMappings: number;
  uniqueCampaignsSeen: number;
}

function lower(value?: string | null) {
  return String(value || "").trim().toLowerCase();
}

export async function getNeoDoveCampaignMappings() {
  return db.select().from(neodoveCampaignMappings).orderBy(desc(neodoveCampaignMappings.updatedAt)).all();
}

export async function resolveNeoDoveMapping(webhookLead: NeoDoveWebhookLead) {
  const mappings = await getNeoDoveCampaignMappings();
  const campaignId = lower(webhookLead.campaignId);
  const campaignName = lower(webhookLead.campaign);

  return (
    mappings.find((mapping) => lower(mapping.neodoveCampaignId) === campaignId) ||
    mappings.find((mapping) => lower(mapping.neodoveCampaignName) === campaignName) ||
    null
  );
}

export async function logNeoDoveShadowEvent(args: {
  webhookLead: NeoDoveWebhookLead;
  rawPayload: unknown;
  mapping?: Awaited<ReturnType<typeof resolveNeoDoveMapping>> | null;
  processingNote?: string;
}) {
  const { webhookLead, rawPayload, mapping, processingNote } = args;

  const eventTimestamp = webhookLead.updatedAt || webhookLead.createdAt || new Date().toISOString();
  const stageText = lower(webhookLead.stageName || webhookLead.status);
  const qualifiedSignals =
    stageText.includes("qualif") ||
    lower(webhookLead.disposition).includes("qualif") ||
    lower(webhookLead.pipeline).includes("qualified");

  await db.insert(neodoveEventLogs).values({
    eventName: webhookLead.event,
    eventTimestamp,
    leadId: webhookLead.leadId,
    mobile: webhookLead.mobile,
    email: webhookLead.email,
    name: webhookLead.name,
    campaignId: webhookLead.campaignId,
    campaignName: webhookLead.campaign,
    stageName: webhookLead.stageName,
    statusCode: webhookLead.statusCode,
    disposition: webhookLead.disposition,
    disposeReason: webhookLead.disposeReason,
    pipeline: webhookLead.pipeline,
    center: webhookLead.center,
    assignedToId: webhookLead.assignedToId,
    assignedTo: webhookLead.assignedTo,
    callConnected: webhookLead.callConnected,
    callDurationSec: webhookLead.callDurationSec,
    followUpAt: webhookLead.followUpAt,
    matchedMappingId: mapping?.id || null,
    derivedSourceBucket: mapping?.sourceBucket || null,
    derivedCenter: mapping?.center || null,
    derivedUtmCampaign: mapping?.utmCampaign || null,
    processingStatus: mapping ? "mapped" : "unmapped",
    processingNote:
      processingNote ||
      (mapping
        ? qualifiedSignals
          ? "Mapped in shadow mode; qualified signal detected."
          : "Mapped in shadow mode."
        : "Captured in shadow mode without campaign mapping."),
    rawPayload: JSON.stringify(rawPayload),
  });
}

export async function computeNeoDoveShadowSnapshot(windowDays = 7) {
  const events = await db.select().from(neodoveEventLogs).orderBy(desc(neodoveEventLogs.eventTimestamp)).all();
  const mappings = await getNeoDoveCampaignMappings();
  const threshold = Date.now() - windowDays * 24 * 60 * 60 * 1000;

  const recentEvents = events.filter((event) => {
    const ts = Date.parse(event.eventTimestamp || event.createdAt || "");
    return Number.isFinite(ts) ? ts >= threshold : true;
  });

  const summary: NeoDoveShadowSummary = {
    windowDays,
    totalEvents: recentEvents.length,
    mappedEvents: recentEvents.filter((event) => event.processingStatus === "mapped").length,
    unmappedEvents: recentEvents.filter((event) => event.processingStatus !== "mapped").length,
    connectedCalls: recentEvents.filter((event) => Boolean(event.callConnected)).length,
    qualifiedSignals: recentEvents.filter((event) => lower(event.stageName).includes("qualif") || lower(event.disposition).includes("qualif")).length,
    activeMappings: mappings.filter((mapping) => mapping.isActive !== false).length,
    uniqueCampaignsSeen: new Set(recentEvents.map((event) => lower(event.campaignId || event.campaignName)).filter(Boolean)).size,
  };

  const byCampaign = Object.values(
    recentEvents.reduce<Record<string, {
      campaignId: string;
      campaignName: string;
      events: number;
      mapped: number;
      connectedCalls: number;
      lastEventAt: string;
      derivedSourceBucket?: string | null;
      derivedCenter?: string | null;
    }>>((acc, event) => {
      const key = lower(event.campaignId || event.campaignName);
      const safeKey = key || "unknown";
      if (!acc[safeKey]) {
        acc[safeKey] = {
          campaignId: event.campaignId || "",
          campaignName: event.campaignName || "Unknown campaign",
          events: 0,
          mapped: 0,
          connectedCalls: 0,
          lastEventAt: event.eventTimestamp,
          derivedSourceBucket: event.derivedSourceBucket,
          derivedCenter: event.derivedCenter,
        };
      }
      acc[safeKey].events += 1;
      if (event.processingStatus === "mapped") acc[safeKey].mapped += 1;
      if (event.callConnected) acc[safeKey].connectedCalls += 1;
      if (event.eventTimestamp > acc[safeKey].lastEventAt) acc[safeKey].lastEventAt = event.eventTimestamp;
      if (!acc[safeKey].derivedSourceBucket && event.derivedSourceBucket) acc[safeKey].derivedSourceBucket = event.derivedSourceBucket;
      if (!acc[safeKey].derivedCenter && event.derivedCenter) acc[safeKey].derivedCenter = event.derivedCenter;
      return acc;
    }, {})
  ).sort((a, b) => b.events - a.events);

  return {
    summary,
    recentEvents: recentEvents.slice(0, 25),
    mappings,
    byCampaign,
  };
}

export async function upsertNeoDoveCampaignMapping(input: {
  neodoveCampaignId: string;
  neodoveCampaignName: string;
  sourceBucket: string;
  center: string;
  utmCampaign: string;
  owner?: string;
  isActive?: boolean;
  notes?: string;
}) {
  const existing = await db
    .select()
    .from(neodoveCampaignMappings)
    .where(eq(neodoveCampaignMappings.neodoveCampaignId, input.neodoveCampaignId))
    .get();

  const now = new Date().toISOString();
  if (existing) {
    await db
      .update(neodoveCampaignMappings)
      .set({
        neodoveCampaignName: input.neodoveCampaignName,
        sourceBucket: input.sourceBucket,
        center: input.center,
        utmCampaign: input.utmCampaign,
        owner: input.owner || null,
        isActive: input.isActive ?? true,
        notes: input.notes || null,
        updatedAt: now,
      })
      .where(eq(neodoveCampaignMappings.id, existing.id));
    return { ...existing, ...input, owner: input.owner || null, notes: input.notes || null, updatedAt: now };
  }

  await db.insert(neodoveCampaignMappings).values({
    neodoveCampaignId: input.neodoveCampaignId,
    neodoveCampaignName: input.neodoveCampaignName,
    sourceBucket: input.sourceBucket,
    center: input.center,
    utmCampaign: input.utmCampaign,
    owner: input.owner || null,
    isActive: input.isActive ?? true,
    notes: input.notes || null,
  });

  return db
    .select()
    .from(neodoveCampaignMappings)
    .where(eq(neodoveCampaignMappings.neodoveCampaignId, input.neodoveCampaignId))
    .get();
}
