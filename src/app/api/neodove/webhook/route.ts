import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { contacts, neodoveEvents } from "@/db/schema";
import { ensureMandatoryUtm } from "@/lib/utm";
import { resolveCenter } from "@/lib/lead-attribution";
import { emitMetaSignalsForContactChange } from "@/lib/meta-conversions";
import {
  mapNeoDoveStatus,
  normalizeIndianMobile,
  parseNeoDoveWebhookLead,
  toNeoDoveCampaignTag,
} from "@/lib/neodove";
import { analyzeTelecallerNote } from "@/lib/ai/note-analyzer";

const MAX_MESSAGE_LENGTH = 1800;
const ACTIVE_STATUSES = new Set(["New", "Contacted", "Qualified"]);

function mergeTags(existing: string | null, additions: string[]) {
  const set = new Set((existing || "").split(",").map((tag) => tag.trim()).filter(Boolean));
  additions.filter(Boolean).forEach((tag) => set.add(tag));
  return Array.from(set).join(",");
}

function appendMessage(existing: string | null, nextLine: string) {
  if (!existing) return nextLine.slice(0, MAX_MESSAGE_LENGTH);
  const merged = `${existing}\n${nextLine}`.trim();
  if (merged.length <= MAX_MESSAGE_LENGTH) return merged;
  return merged.slice(merged.length - MAX_MESSAGE_LENGTH);
}

function eventTag(input: string) {
  return `neodove_event_${input.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "lead_update"}`;
}

function toTag(input: string, value?: string) {
  if (!value) return "";
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return slug ? `${input}_${slug}` : "";
}

function normalizeTimestamp(value?: string) {
  if (!value) return null;
  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
  return null;
}

function eventTimeForLead(updatedAt?: string, createdAt?: string) {
  return normalizeTimestamp(updatedAt) || normalizeTimestamp(createdAt) || new Date().toISOString();
}

function safeJsonParse(raw: string) {
  try {
    return { ok: true, value: JSON.parse(raw) as unknown };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Invalid JSON" };
  }
}

function parseRawBody(rawBody: string, contentType: string | null) {
  const trimmed = rawBody.trim();
  if (!trimmed) return { body: null, error: "empty_body" };

  const asJson = safeJsonParse(trimmed);
  if (asJson.ok) return { body: asJson.value, error: undefined };

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return { body: null, error: asJson.error || "invalid_json" };
  }

  if (contentType?.includes("application/x-www-form-urlencoded") || trimmed.includes("=")) {
    const params = new URLSearchParams(trimmed);
    const payloadKeys = ["payload", "data", "body", "request"];
    for (const key of payloadKeys) {
      const value = params.get(key);
      if (!value) continue;
      const parsed = safeJsonParse(value);
      if (parsed.ok) return { body: parsed.value, error: undefined };
    }
    return { body: Object.fromEntries(params.entries()), error: asJson.error || undefined };
  }

  return { body: { raw: trimmed }, error: asJson.error || "unsupported_payload" };
}

function buildEventKey(rawPayload: unknown, webhookLead: ReturnType<typeof parseNeoDoveWebhookLead>) {
  const seed = JSON.stringify({
    leadId: webhookLead?.leadId || "",
    mobile: webhookLead?.mobile || "",
    email: webhookLead?.email || "",
    event: webhookLead?.event || "",
    campaignId: webhookLead?.campaignId || "",
    campaign: webhookLead?.campaign || "",
    stageName: webhookLead?.stageName || "",
    statusCode: webhookLead?.statusCode || "",
    status: webhookLead?.status || "",
    disposition: webhookLead?.disposition || "",
    disposeReason: webhookLead?.disposeReason || "",
    assignedToId: webhookLead?.assignedToId || "",
    assignedTo: webhookLead?.assignedTo || "",
    followUpAt: webhookLead?.followUpAt || "",
    createdAt: webhookLead?.createdAt || "",
    updatedAt: webhookLead?.updatedAt || "",
    notes: webhookLead?.notes || "",
    rawPayload,
  });
  return createHash("sha1").update(seed).digest("hex");
}

function buildIgnoredEventKey(rawPayload: string) {
  const seed = rawPayload || `ignored_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return createHash("sha1").update(seed).digest("hex");
}

function scoreDelta(mappedStatus: string, callConnected?: boolean, callDurationSec?: number) {
  if (mappedStatus === "Converted") return 24;
  if (mappedStatus === "Qualified") return 16;
  if (callConnected && (callDurationSec || 0) >= 45) return 12;
  if (callConnected) return 8;
  return 5;
}

async function findByPhone(phone: string) {
  const normalized = normalizeIndianMobile(phone);
  if (!normalized) return null;

  const direct = await db.select().from(contacts).where(eq(contacts.phone, normalized)).get();
  if (direct) return direct;

  const all = await db.select().from(contacts).all();
  return (
    all.find((contact) => {
      const candidate = normalizeIndianMobile(contact.phone || contact.whatsappNumber || null);
      return candidate === normalized;
    }) || null
  );
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "neodove-webhook",
    date: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  let rawBody = "";
  let eventRowId: number | null = null;
  let pendingEventKey: string | null = null;

  try {
    const requiredSecret = process.env.NEODOVE_WEBHOOK_SECRET?.trim();
    if (requiredSecret) {
      const tokenHeader = req.headers.get("x-neodove-token") || req.headers.get("x-webhook-token");
      const tokenQuery = new URL(req.url).searchParams.get("token");
      if (tokenHeader !== requiredSecret && tokenQuery !== requiredSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    rawBody = await req.text();
    const { body, error: parseError } = parseRawBody(rawBody, req.headers.get("content-type"));
    const webhookLead = body ? parseNeoDoveWebhookLead(body) : null;

    if (!webhookLead) {
      const now = new Date().toISOString();
      await db.insert(neodoveEvents).values({
        eventKey: buildIgnoredEventKey(rawBody),
        eventName: "ignored_payload",
        rawPayload: rawBody || "raw body unavailable",
        receivedAt: now,
        processedAt: now,
        processStatus: "ignored",
        errorMessage: parseError ? `Ignored payload: ${parseError}` : "Ignored payload: missing lead identifiers",
      });
      return NextResponse.json({ success: true, ignored: true });
    }

    const center = resolveCenter({
      center: webhookLead.center,
      landingPath: webhookLead.campaign || "",
      target: webhookLead.mobile || "",
    });

    const utm = ensureMandatoryUtm({
      utm_source: "neodove",
      utm_medium: "crm",
      utm_campaign: webhookLead.campaign || `neodove_${center.toLowerCase()}`,
      utm_content: webhookLead.event,
      center: center.toLowerCase(),
      landing_path: `/neodove/${center.toLowerCase()}`,
    });

    const now = new Date().toISOString();
    const eventAt = eventTimeForLead(webhookLead.updatedAt, webhookLead.createdAt);
    const normalizedEvent = webhookLead.event.toLowerCase();
    const statusSignal =
      normalizedEvent.includes("dispose")
        ? "dispose"
        : webhookLead.stageName || webhookLead.status || webhookLead.statusCode || webhookLead.event;
    const mappedStatus = mapNeoDoveStatus(statusSignal);
    const eventKey = buildEventKey(body, webhookLead);
    pendingEventKey = eventKey;
    const note = [
      `[${now}] NEODOVE`,
      webhookLead.leadId ? `lead_id=${webhookLead.leadId}` : "",
      `event=${webhookLead.event}`,
      webhookLead.stageName ? `stage=${webhookLead.stageName}` : "",
      webhookLead.statusCode ? `status_code=${webhookLead.statusCode}` : "",
      webhookLead.status ? `status=${webhookLead.status}` : "",
      webhookLead.disposition ? `disposition=${webhookLead.disposition}` : "",
      webhookLead.disposeReason ? `dispose_reason=${webhookLead.disposeReason}` : "",
      webhookLead.campaignId ? `campaign_id=${webhookLead.campaignId}` : "",
      webhookLead.campaign ? `campaign=${webhookLead.campaign}` : "",
      webhookLead.pipeline ? `pipeline=${webhookLead.pipeline}` : "",
      webhookLead.assignedToId ? `owner_id=${webhookLead.assignedToId}` : "",
      webhookLead.assignedTo ? `owner=${webhookLead.assignedTo}` : "",
      webhookLead.callConnected !== undefined ? `call_connected=${webhookLead.callConnected}` : "",
      webhookLead.callDurationSec !== undefined ? `call_duration_sec=${webhookLead.callDurationSec}` : "",
      webhookLead.followUpAt ? `next_follow_up=${webhookLead.followUpAt}` : "",
      webhookLead.updatedAt ? `updated_at=${webhookLead.updatedAt}` : "",
      webhookLead.notes ? `notes=${webhookLead.notes}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    const previousEvent = await db
      .select()
      .from(neodoveEvents)
      .where(eq(neodoveEvents.eventKey, eventKey))
      .get();

    if (previousEvent) {
      await db.insert(neodoveEvents).values({
        eventKey,
        leadId: webhookLead.leadId || null,
        contactId: previousEvent.contactId || null,
        eventName: webhookLead.event,
        mobile: webhookLead.mobile || null,
        email: webhookLead.email || null,
        campaignId: webhookLead.campaignId || null,
        campaign: webhookLead.campaign || null,
        stageName: webhookLead.stageName || null,
        statusCode: webhookLead.statusCode || null,
        rawStatus: webhookLead.status || null,
        mappedStatus,
        disposition: webhookLead.disposition || null,
        disposeReason: webhookLead.disposeReason || null,
        pipeline: webhookLead.pipeline || null,
        center,
        assignedToId: webhookLead.assignedToId || null,
        assignedTo: webhookLead.assignedTo || null,
        callConnected: webhookLead.callConnected,
        callDurationSec: webhookLead.callDurationSec,
        followUpAt: webhookLead.followUpAt || null,
        createdAtSource: webhookLead.createdAt || null,
        updatedAtSource: webhookLead.updatedAt || null,
        notes: webhookLead.notes || null,
        rawPayload: rawBody,
        receivedAt: now,
        processedAt: now,
        processStatus: "duplicate",
        isDuplicate: true,
        duplicateOfEventKey: previousEvent.eventKey,
      });

      return NextResponse.json({
        success: true,
        duplicate: true,
        event: webhookLead.event,
        center,
        status: mappedStatus,
      });
    }

    const insertedEvents = await db
      .insert(neodoveEvents)
      .values({
        eventKey,
        leadId: webhookLead.leadId || null,
        eventName: webhookLead.event,
        mobile: webhookLead.mobile || null,
        email: webhookLead.email || null,
        campaignId: webhookLead.campaignId || null,
        campaign: webhookLead.campaign || null,
        stageName: webhookLead.stageName || null,
        statusCode: webhookLead.statusCode || null,
        rawStatus: webhookLead.status || null,
        mappedStatus,
        disposition: webhookLead.disposition || null,
        disposeReason: webhookLead.disposeReason || null,
        pipeline: webhookLead.pipeline || null,
        center,
        assignedToId: webhookLead.assignedToId || null,
        assignedTo: webhookLead.assignedTo || null,
        callConnected: webhookLead.callConnected,
        callDurationSec: webhookLead.callDurationSec,
        followUpAt: webhookLead.followUpAt || null,
        createdAtSource: webhookLead.createdAt || null,
        updatedAtSource: webhookLead.updatedAt || null,
        notes: webhookLead.notes || null,
        rawPayload: rawBody,
        receivedAt: now,
        processStatus: "processing",
        isDuplicate: false,
      })
      .returning();
    const eventRow = insertedEvents[0];
    eventRowId = eventRow?.id || null;

    const tags = [
      "neodove",
      toNeoDoveCampaignTag(webhookLead.campaign),
      eventTag(webhookLead.event.toLowerCase()),
      `center_${center.toLowerCase()}`,
      toTag("neodove_owner", webhookLead.assignedTo),
      toTag("neodove_stage", webhookLead.stageName),
      toTag("neodove_disposition", webhookLead.disposition),
    ];

    const email = webhookLead.email?.trim().toLowerCase();
    const mobile = normalizeIndianMobile(webhookLead.mobile);

    let existing = email
      ? await db.select().from(contacts).where(eq(contacts.email, email)).get()
      : null;

    if (!existing && mobile) {
      existing = await findByPhone(mobile);
    }

    // AI Sentiment Analysis for Notes
    let aiTags: string[] = [];
    let mappedDisposeReason = webhookLead.disposeReason;
    
    if (webhookLead.notes) {
      try {
        const analysis = await analyzeTelecallerNote(webhookLead.notes);
        if (analysis) {
          aiTags = analysis.tags.map(t => `ai_${t}`);
          aiTags.push(`ai_sentiment_${analysis.sentiment.toLowerCase()}`);
          
          // If telecaller didn't provide a reason but AI found one, use the AI's reason
          if (!mappedDisposeReason && analysis.reason !== "Unknown") {
            mappedDisposeReason = `[AI Extracted] ${analysis.reason}`;
          }
        }
      } catch (err) {
        console.error("AI Note analysis failed:", err);
      }
    }

    const finalTags = mergeTags(existing?.tags || "", [...tags, ...aiTags]);

    if (existing) {
      const updatedRows = await db
        .update(contacts)
        .set({
          name: existing.name || webhookLead.name || `NeoDove Lead ${mobile?.slice(-4) || "new"}`,
          phone: existing.phone || mobile || null,
          email: existing.email || email || `neodove_${mobile || Date.now()}@pending.santaan.in`,
          preferredChannel: "phone",
          leadSource: "neodove_webhook",
          status: mappedStatus,
          tags: finalTags,
          message: appendMessage(existing.message, note),
          ownerName: webhookLead.assignedTo || existing.ownerName || null,
          neodoveLeadId: webhookLead.leadId || existing.neodoveLeadId || null,
          neodoveCampaignId: webhookLead.campaignId || existing.neodoveCampaignId || null,
          neodoveStageName: webhookLead.stageName || existing.neodoveStageName || null,
          neodoveStatusCode: webhookLead.statusCode || existing.neodoveStatusCode || null,
          neodoveRawStatus: webhookLead.status || existing.neodoveRawStatus || null,
          neodoveMappedStatus: mappedStatus,
          neodoveDisposition: webhookLead.disposition || existing.neodoveDisposition || null,
          neodoveDisposeReason: mappedDisposeReason || existing.neodoveDisposeReason || null,
          neodovePipeline: webhookLead.pipeline || existing.neodovePipeline || null,
          neodoveOwnerId: webhookLead.assignedToId || existing.neodoveOwnerId || null,
          neodoveOwnerName: webhookLead.assignedTo || existing.neodoveOwnerName || null,
          neodoveCallConnected: webhookLead.callConnected ?? existing.neodoveCallConnected ?? null,
          neodoveCallDurationSec: webhookLead.callDurationSec ?? existing.neodoveCallDurationSec ?? null,
          neodoveCreatedAt: normalizeTimestamp(webhookLead.createdAt) || existing.neodoveCreatedAt || null,
          neodoveUpdatedAt: normalizeTimestamp(webhookLead.updatedAt) || existing.neodoveUpdatedAt || null,
          neodoveLastEvent: webhookLead.event,
          neodoveLastEventAt: eventAt,
          neodoveLastSyncAt: now,
          neodoveSyncStatus: ACTIVE_STATUSES.has(mappedStatus) && !webhookLead.followUpAt ? "needs_followup" : "synced",
          nextFollowUpAt: webhookLead.followUpAt || existing.nextFollowUpAt || null,
          utmSource: utm.utm_source,
          utmMedium: utm.utm_medium,
          utmCampaign: utm.utm_campaign,
          utmTerm: utm.utm_term || center.toLowerCase(),
          utmContent: utm.utm_content,
          landingPath: utm.landing_path,
          lastContact: eventAt,
          lastMessageAt: now,
          conversationCount: (existing.conversationCount || 0) + 1,
          leadScore: Math.min(100, (existing.leadScore || 0) + scoreDelta(mappedStatus, webhookLead.callConnected, webhookLead.callDurationSec)),
          submittedAt: existing.submittedAt || Math.floor(Date.now() / 1000),
        })
        .where(eq(contacts.id, existing.id))
        .returning();

      const updatedContact = updatedRows[0];
      if (updatedContact) {
        try {
          await emitMetaSignalsForContactChange({
            before: existing,
            after: updatedContact,
          });
        } catch (signalError) {
          console.error("Meta signal emission on NeoDove update failed:", signalError);
        }
      }
      await db
        .update(neodoveEvents)
        .set({
          contactId: updatedContact?.id || existing.id,
          processedAt: now,
          processStatus: "processed",
        })
        .where(eq(neodoveEvents.id, eventRow.id));
    } else {
      const createdRows = await db.insert(contacts).values({
        name: webhookLead.name || `NeoDove Lead ${mobile?.slice(-4) || "new"}`,
        email: email || `neodove_${mobile || Date.now()}@pending.santaan.in`,
        phone: mobile || null,
        role: "Lead",
        status: mappedStatus,
        preferredChannel: "phone",
        leadSource: "neodove_webhook",
        tags: finalTags,
        message: note,
        leadScore: Math.min(100, 30 + scoreDelta(mappedStatus, webhookLead.callConnected, webhookLead.callDurationSec)),
        ownerName: webhookLead.assignedTo || null,
        neodoveLeadId: webhookLead.leadId || null,
        neodoveCampaignId: webhookLead.campaignId || null,
        neodoveStageName: webhookLead.stageName || null,
        neodoveStatusCode: webhookLead.statusCode || null,
        neodoveRawStatus: webhookLead.status || null,
        neodoveMappedStatus: mappedStatus,
        neodoveDisposition: webhookLead.disposition || null,
        neodoveDisposeReason: mappedDisposeReason || null,
        neodovePipeline: webhookLead.pipeline || null,
        neodoveOwnerId: webhookLead.assignedToId || null,
        neodoveOwnerName: webhookLead.assignedTo || null,
        neodoveCallConnected: webhookLead.callConnected,
        neodoveCallDurationSec: webhookLead.callDurationSec,
        neodoveCreatedAt: normalizeTimestamp(webhookLead.createdAt),
        neodoveUpdatedAt: normalizeTimestamp(webhookLead.updatedAt),
        neodoveLastEvent: webhookLead.event,
        neodoveLastEventAt: eventAt,
        neodoveLastSyncAt: now,
        neodoveSyncStatus: ACTIVE_STATUSES.has(mappedStatus) && !webhookLead.followUpAt ? "needs_followup" : "synced",
        nextFollowUpAt: webhookLead.followUpAt || null,
        utmSource: utm.utm_source,
        utmMedium: utm.utm_medium,
        utmCampaign: utm.utm_campaign,
        utmTerm: utm.utm_term || center.toLowerCase(),
        utmContent: utm.utm_content,
        landingPath: utm.landing_path,
        lastContact: eventAt,
        lastMessageAt: now,
        conversationCount: 1,
        submittedAt: Math.floor(Date.now() / 1000), // Note: SQLite max integer is large enough, but using seconds prevents overflow if configured as int32 elsewhere
      }).returning();

      if (createdRows[0]) {
        try {
          await emitMetaSignalsForContactChange({
            before: null,
            after: createdRows[0],
          });
        } catch (signalError) {
          console.error("Meta signal emission on NeoDove create failed:", signalError);
        }
      }

      await db
        .update(neodoveEvents)
        .set({
          contactId: createdRows[0]?.id || null,
          processedAt: now,
          processStatus: "processed",
        })
        .where(eq(neodoveEvents.id, eventRow.id));
    }

    return NextResponse.json({
      success: true,
      event: webhookLead.event,
      center,
      status: mappedStatus,
    });
  } catch (error) {
    console.error("NeoDove webhook error:", error);
    try {
      const message = error instanceof Error ? error.message : "Webhook processing failed";
      const now = new Date().toISOString();
      if (eventRowId) {
        await db
          .update(neodoveEvents)
          .set({
            processedAt: now,
            processStatus: "error",
            errorMessage: message,
          })
          .where(eq(neodoveEvents.id, eventRowId));
      } else {
        await db.insert(neodoveEvents).values({
          eventKey: pendingEventKey || `error_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          eventName: "webhook_error",
          rawPayload: rawBody || "raw body unavailable",
          receivedAt: now,
          processedAt: now,
          processStatus: "error",
          errorMessage: message,
        });
      }
    } catch {
      // ignore secondary logging failure
    }
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
