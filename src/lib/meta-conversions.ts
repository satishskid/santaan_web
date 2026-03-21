import { createHash, createHmac } from "node:crypto";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { contacts, metaConversionEvents } from "@/db/schema";
import { getSiteUrl } from "@/lib/site";

type ContactRow = typeof contacts.$inferSelect;
type MetaConversionEventRow = typeof metaConversionEvents.$inferSelect;

export type MetaSignalType =
  | "lead_qualified"
  | "consultation_booked"
  | "consultation_completed"
  | "patient_converted";

type MetaSignalCandidate = {
  signalType: MetaSignalType;
  eventName: string;
  crmStatus: string;
  eventTime: string;
  sourceChannel: string;
  center: string;
  actionSource: string;
  eventSourceUrl: string;
};

type MetaConversionsConfig = {
  accessToken: string;
  pixelId: string;
  apiVersion: string;
  testEventCode?: string;
};

type RawMetaApiResponse = {
  events_received?: number;
  fbtrace_id?: string;
  messages?: string[];
  error?: {
    message?: string;
    code?: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
};

type MetaEventPayload = {
  event_name: string;
  event_time: number;
  action_source: string;
  event_source_url?: string;
  user_data: Record<string, unknown>;
  custom_data: Record<string, unknown>;
};

type EmitMetaSignalsInput = {
  before: ContactRow | null;
  after: ContactRow;
  explicitSignals?: string[];
};

const CONSULTATION_BOOKED_TAGS = new Set([
  "consultation_booked",
  "appointment_booked",
  "demo_booked",
  "doctor_consult_booked",
]);

const CONSULTATION_COMPLETED_TAGS = new Set([
  "consultation_done",
  "consultation_completed",
  "appointment_completed",
  "demo_done",
]);

const VALID_SIGNAL_TYPES = new Set<MetaSignalType>([
  "lead_qualified",
  "consultation_booked",
  "consultation_completed",
  "patient_converted",
]);

const STATUS_NORMALIZATION: Record<string, string> = {
  hot_lead: "new",
  "hot lead": "new",
  "hot-lead": "new",
};

function normalizeStatus(value?: string | null) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "new";
  const normalized = STATUS_NORMALIZATION[raw] || raw;
  if (normalized.includes("convert") || normalized.includes("won")) return "converted";
  if (normalized.includes("qualif")) return "qualified";
  if (normalized.includes("contact") || normalized.includes("progress")) return "contacted";
  if (normalized.includes("lost") || normalized.includes("drop") || normalized.includes("closed")) return "lost";
  return normalized;
}

function normalizePhone(value?: string | null) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function hashEmail(value?: string | null) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized || normalized.endsWith("@pending.santaan.in")) return null;
  return hashValue(normalized);
}

function hashPhone(value?: string | null) {
  const normalized = normalizePhone(value);
  if (!normalized) return null;
  return hashValue(normalized);
}

function hashExternalId(contactId?: number | null) {
  if (!contactId) return null;
  return hashValue(`crm_contact:${contactId}`);
}

function getTags(value?: string | null) {
  return new Set(
    String(value || "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
  );
}

function hasNewTag(before: Set<string>, after: Set<string>, candidates: Set<string>) {
  for (const value of candidates) {
    if (after.has(value) && !before.has(value)) return true;
  }
  return false;
}

function actionSourceForContact(contact: ContactRow) {
  const preferred = String(contact.preferredChannel || "").toLowerCase();
  const leadSource = String(contact.leadSource || "").toLowerCase();
  const tags = getTags(contact.tags);

  if (preferred === "whatsapp" || leadSource.includes("whatsapp") || tags.has("whatsapp")) return "chat";
  if (preferred === "phone" || leadSource.includes("call") || leadSource.includes("neodove")) return "phone_call";
  if (preferred === "email" || leadSource.includes("email")) return "email";
  return "website";
}

function inferCenter(contact: ContactRow) {
  const tags = getTags(contact.tags);
  const campaign = String(contact.utmCampaign || "").toLowerCase();
  const landing = String(contact.landingPath || "").toLowerCase();

  if (tags.has("center_bhubaneswar") || campaign.includes("bhubaneswar") || landing.includes("bhubaneswar")) return "bhubaneswar";
  if (tags.has("center_berhampur") || campaign.includes("berhampur") || landing.includes("berhampur")) return "berhampur";
  if (tags.has("center_bangalore") || campaign.includes("bangalore") || landing.includes("bangalore")) return "bangalore";
  return "network";
}

function explicitSignalList(input?: string[]) {
  return (input || [])
    .map((value) => String(value || "").trim().toLowerCase())
    .filter((value): value is MetaSignalType => VALID_SIGNAL_TYPES.has(value as MetaSignalType));
}

function eventTimeForContact(contact: ContactRow) {
  const candidates = [contact.lastContact, contact.lastMessageAt, contact.createdAt];
  for (const value of candidates) {
    const ts = Date.parse(String(value || ""));
    if (!Number.isNaN(ts)) return new Date(ts).toISOString();
  }
  return new Date().toISOString();
}

function signalEventName(signalType: MetaSignalType) {
  if (signalType === "lead_qualified") return "Lead";
  if (signalType === "consultation_booked") return "Schedule";
  if (signalType === "consultation_completed") return "Contact";
  return "CompleteRegistration";
}

function buildEventSourceUrl(contact: ContactRow) {
  const site = getSiteUrl();
  const landingPath = String(contact.landingPath || "").trim();
  if (!landingPath) return site;
  try {
    return new URL(landingPath, `${site}/`).toString();
  } catch {
    return site;
  }
}

export function readMetaConversionsConfig(): MetaConversionsConfig | null {
  const accessToken = String(process.env.META_ACCESS_TOKEN || "").trim();
  const pixelId = String(
    process.env.META_CAPI_PIXEL_ID ||
      process.env.META_PIXEL_ID ||
      process.env.FACEBOOK_PIXEL_ID ||
      ""
  ).trim();

  if (!accessToken || !pixelId) return null;

  return {
    accessToken,
    pixelId,
    apiVersion: String(process.env.META_GRAPH_API_VERSION || "v25.0").trim() || "v25.0",
    testEventCode: String(process.env.META_TEST_EVENT_CODE || "").trim() || undefined,
  };
}

function createAppSecretProof(accessToken: string) {
  const appSecret = String(process.env.META_APP_SECRET || "").trim();
  if (!appSecret) return null;
  return createHmac("sha256", appSecret).update(accessToken).digest("hex");
}

function buildSignalCandidates(input: EmitMetaSignalsInput): MetaSignalCandidate[] {
  const beforeStatus = normalizeStatus(input.before?.status);
  const afterStatus = normalizeStatus(input.after.status);
  const beforeTags = getTags(input.before?.tags);
  const afterTags = getTags(input.after.tags);
  const eventTime = eventTimeForContact(input.after);
  const sourceChannel = String(input.after.preferredChannel || input.after.leadSource || "crm").toLowerCase() || "crm";
  const center = inferCenter(input.after);
  const actionSource = actionSourceForContact(input.after);
  const eventSourceUrl = buildEventSourceUrl(input.after);
  const signals = new Set<MetaSignalType>();

  if (afterStatus === "qualified" && beforeStatus !== "qualified" && beforeStatus !== "converted") {
    signals.add("lead_qualified");
  }

  if (afterStatus === "converted" && beforeStatus !== "converted") {
    signals.add("patient_converted");
  }

  if (hasNewTag(beforeTags, afterTags, CONSULTATION_BOOKED_TAGS)) {
    signals.add("consultation_booked");
  }

  if (hasNewTag(beforeTags, afterTags, CONSULTATION_COMPLETED_TAGS)) {
    signals.add("consultation_completed");
  }

  for (const signal of explicitSignalList(input.explicitSignals)) {
    signals.add(signal);
  }

  return Array.from(signals).map((signalType) => ({
    signalType,
    eventName: signalEventName(signalType),
    crmStatus: String(input.after.status || "New"),
    eventTime,
    sourceChannel,
    center,
    actionSource,
    eventSourceUrl,
  }));
}

function buildMetaEventPayload(contact: ContactRow, candidate: MetaSignalCandidate): MetaEventPayload {
  const emailHash = hashEmail(contact.email);
  const phoneHash = hashPhone(contact.phone || contact.whatsappNumber);
  const externalIdHash = hashExternalId(contact.id);

  return {
    event_name: candidate.eventName,
    event_time: Math.floor(new Date(candidate.eventTime).getTime() / 1000),
    action_source: candidate.actionSource,
    event_source_url: candidate.eventSourceUrl,
    user_data: {
      ...(emailHash ? { em: [emailHash] } : {}),
      ...(phoneHash ? { ph: [phoneHash] } : {}),
      ...(externalIdHash ? { external_id: [externalIdHash] } : {}),
    },
    custom_data: {
      crm_stage: candidate.signalType,
      crm_status: candidate.crmStatus,
      center: candidate.center,
      preferred_channel: contact.preferredChannel || null,
      lead_source: contact.leadSource || null,
      utm_campaign: contact.utmCampaign || null,
      utm_source: contact.utmSource || null,
      utm_medium: contact.utmMedium || null,
      owner_name: contact.ownerName || null,
      next_follow_up_at: contact.nextFollowUpAt || null,
      neodove_lead_id: contact.neodoveLeadId || null,
      lead_score: contact.leadScore || 0,
      value: 1,
      currency: "INR",
    },
  };
}

function buildEventKey(contactId: number, candidate: MetaSignalCandidate) {
  const seed = [
    contactId,
    candidate.signalType,
    candidate.crmStatus,
    candidate.eventTime,
    candidate.center,
    candidate.sourceChannel,
  ].join(":");
  return createHash("sha1").update(seed).digest("hex");
}

async function sendMetaEventPayload(config: MetaConversionsConfig, payload: MetaEventPayload) {
  const url = new URL(`https://graph.facebook.com/${config.apiVersion}/${config.pixelId}/events`);
  url.searchParams.set("access_token", config.accessToken);

  const proof = createAppSecretProof(config.accessToken);
  if (proof) {
    url.searchParams.set("appsecret_proof", proof);
  }

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      data: [payload],
      ...(config.testEventCode ? { test_event_code: config.testEventCode } : {}),
      partner_agent: "santaan_crm_meta_signal_loop",
    }),
    cache: "no-store",
  });

  let result: RawMetaApiResponse | null = null;
  try {
    result = (await response.json()) as RawMetaApiResponse;
  } catch {
    result = null;
  }

  if (!response.ok || result?.error) {
    const message = result?.error?.message || `Meta Conversions API request failed with status ${response.status}`;
    throw new Error(message);
  }

  return result;
}

async function storeSkippedSignal(
  contact: ContactRow,
  candidate: MetaSignalCandidate,
  payload: MetaEventPayload,
  reason: string
) {
  const eventKey = buildEventKey(contact.id, candidate);
  const existing = await db.select().from(metaConversionEvents).where(eq(metaConversionEvents.eventKey, eventKey)).get();
  if (existing) return existing;

  const emailHash = hashEmail(contact.email);
  const phoneHash = hashPhone(contact.phone || contact.whatsappNumber);
  const externalIdHash = hashExternalId(contact.id);

  const inserted = await db
    .insert(metaConversionEvents)
    .values({
      eventKey,
      contactId: contact.id,
      eventName: candidate.eventName,
      signalType: candidate.signalType,
      crmStatus: candidate.crmStatus,
      center: candidate.center,
      sourceChannel: candidate.sourceChannel,
      actionSource: candidate.actionSource,
      pixelId: null,
      leadSource: contact.leadSource || null,
      utmCampaign: contact.utmCampaign || null,
      eventTime: candidate.eventTime,
      emailHash,
      phoneHash,
      externalIdHash,
      payload: JSON.stringify(payload),
      processStatus: "skipped",
      processedAt: new Date().toISOString(),
      errorMessage: reason,
    })
    .returning();

  return inserted[0];
}

export async function emitMetaSignalsForContactChange(input: EmitMetaSignalsInput) {
  const candidates = buildSignalCandidates(input);
  if (!candidates.length) {
    return { queued: 0, processed: 0, skipped: 0, errors: 0 };
  }

  const config = readMetaConversionsConfig();
  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const candidate of candidates) {
    const payload = buildMetaEventPayload(input.after, candidate);
    const eventKey = buildEventKey(input.after.id, candidate);

    const existingEvent = await db.select().from(metaConversionEvents).where(eq(metaConversionEvents.eventKey, eventKey)).get();
    if (existingEvent) {
      continue;
    }

    if (!config) {
      await storeSkippedSignal(input.after, candidate, payload, "Meta Conversions API is not configured.");
      skipped += 1;
      continue;
    }

    const emailHash = hashEmail(input.after.email);
    const phoneHash = hashPhone(input.after.phone || input.after.whatsappNumber);
    const externalIdHash = hashExternalId(input.after.id);

    const insertedRows = await db
      .insert(metaConversionEvents)
      .values({
        eventKey,
        contactId: input.after.id,
        eventName: candidate.eventName,
        signalType: candidate.signalType,
        crmStatus: candidate.crmStatus,
        center: candidate.center,
        sourceChannel: candidate.sourceChannel,
        actionSource: candidate.actionSource,
        pixelId: config.pixelId,
        leadSource: input.after.leadSource || null,
        utmCampaign: input.after.utmCampaign || null,
        eventTime: candidate.eventTime,
        emailHash,
        phoneHash,
        externalIdHash,
        payload: JSON.stringify(payload),
        processStatus: "processing",
      })
      .returning();

    const eventRow = insertedRows[0];

    try {
      const result = await sendMetaEventPayload(config, payload);
      processed += 1;
      await db
        .update(metaConversionEvents)
        .set({
          processStatus: "processed",
          processedAt: new Date().toISOString(),
          responsePayload: JSON.stringify(result),
        })
        .where(eq(metaConversionEvents.id, eventRow.id));
    } catch (error) {
      errors += 1;
      const message = error instanceof Error ? error.message : "Meta signal failed";
      await db
        .update(metaConversionEvents)
        .set({
          processStatus: "error",
          processedAt: new Date().toISOString(),
          errorMessage: message,
        })
        .where(eq(metaConversionEvents.id, eventRow.id));
    }
  }

  return { queued: candidates.length, processed, skipped, errors };
}

export async function retryMetaConversionEvent(eventId: number) {
  const row = await db.select().from(metaConversionEvents).where(eq(metaConversionEvents.id, eventId)).get();
  if (!row) {
    throw new Error("Meta conversion event not found");
  }

  const config = readMetaConversionsConfig();
  if (!config) {
    throw new Error("Meta Conversions API is not configured.");
  }

  const payload = JSON.parse(row.payload) as MetaEventPayload;
  await db
    .update(metaConversionEvents)
    .set({
      processStatus: "processing",
      retryCount: sql`${metaConversionEvents.retryCount} + 1`,
      errorMessage: null,
    })
    .where(eq(metaConversionEvents.id, row.id));

  try {
    const result = await sendMetaEventPayload(config, payload);
    await db
      .update(metaConversionEvents)
      .set({
        processStatus: "processed",
        processedAt: new Date().toISOString(),
        responsePayload: JSON.stringify(result),
        errorMessage: null,
        pixelId: config.pixelId,
      })
      .where(eq(metaConversionEvents.id, row.id));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Meta signal retry failed";
    await db
      .update(metaConversionEvents)
      .set({
        processStatus: "error",
        processedAt: new Date().toISOString(),
        errorMessage: message,
      })
      .where(eq(metaConversionEvents.id, row.id));
    throw error;
  }
}

export async function listRecentMetaConversionEvents(limit = 30) {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  return db.select().from(metaConversionEvents).orderBy(desc(metaConversionEvents.receivedAt), desc(metaConversionEvents.id)).limit(safeLimit);
}

export async function getMetaConversionEventSummary() {
  const recent24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [summary, lastEvent] = await Promise.all([
    db
      .select({
        processed24h: sql<number>`SUM(CASE WHEN ${metaConversionEvents.processStatus} = 'processed' AND ${metaConversionEvents.receivedAt} >= ${recent24h} THEN 1 ELSE 0 END)`,
        errors24h: sql<number>`SUM(CASE WHEN ${metaConversionEvents.processStatus} = 'error' AND ${metaConversionEvents.receivedAt} >= ${recent24h} THEN 1 ELSE 0 END)`,
        skipped24h: sql<number>`SUM(CASE WHEN ${metaConversionEvents.processStatus} = 'skipped' AND ${metaConversionEvents.receivedAt} >= ${recent24h} THEN 1 ELSE 0 END)`,
        qualified24h: sql<number>`SUM(CASE WHEN ${metaConversionEvents.signalType} = 'lead_qualified' AND ${metaConversionEvents.receivedAt} >= ${recent24h} THEN 1 ELSE 0 END)`,
        converted24h: sql<number>`SUM(CASE WHEN ${metaConversionEvents.signalType} = 'patient_converted' AND ${metaConversionEvents.receivedAt} >= ${recent24h} THEN 1 ELSE 0 END)`,
      })
      .from(metaConversionEvents)
      .get(),
    db.select().from(metaConversionEvents).orderBy(desc(metaConversionEvents.receivedAt), desc(metaConversionEvents.id)).get(),
  ]);

  return {
    processed24h: Number(summary?.processed24h || 0),
    errors24h: Number(summary?.errors24h || 0),
    skipped24h: Number(summary?.skipped24h || 0),
    qualified24h: Number(summary?.qualified24h || 0),
    converted24h: Number(summary?.converted24h || 0),
    lastEventAt: lastEvent?.receivedAt || null,
  };
}

export function isMetaSignalRelevantStage(value?: string | null) {
  const normalized = normalizeStatus(value);
  return normalized === "qualified" || normalized === "converted";
}

export function getContactSignalPreview(contact: ContactRow) {
  return buildSignalCandidates({ before: null, after: contact });
}
