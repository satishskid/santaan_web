import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { contacts, voiceCallLogs } from "@/db/schema";
import { db } from "@/lib/db";
import { normalizeIndianMobile, pushLeadToNeoDove } from "@/lib/neodove";
import {
  NormalizedEdesyPayload,
  normalizeEdesyPayload,
  voiceEducationLink,
} from "@/lib/voice-ai";
import { sendWhatsAppMessage } from "@/services/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGE_LENGTH = 1800;
const EDESY_TERMINAL_STATUSES = new Set([
  "completed",
  "busy",
  "no-answer",
  "rejected",
  "canceled",
  "failed",
  "unallocated",
  "error",
  "timeout",
  "transfer",
]);

function normalizePhone(value?: string | null) {
  return normalizeIndianMobile(value || null);
}

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

async function findContactByPhone(phone?: string | null) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;

  const exact = await db.select().from(contacts).where(eq(contacts.phone, normalized)).get();
  if (exact) return exact;

  const exactWhatsapp = await db.select().from(contacts).where(eq(contacts.whatsappNumber, normalized)).get();
  if (exactWhatsapp) return exactWhatsapp;

  const all = await db.select().from(contacts).all();
  return (
    all.find((contact) => {
      const candidate = normalizePhone(contact.phone || contact.whatsappNumber || null);
      return candidate === normalized;
    }) || null
  );
}

function buildVoiceNote(lead: NormalizedEdesyPayload, center: string) {
  return [
    `[${new Date().toISOString()}] VOICE AI`,
    `provider=${lead.provider}`,
    `agent=${lead.agentName}`,
    lead.agentId ? `agent_id=${lead.agentId}` : "",
    lead.externalCallId ? `call_id=${lead.externalCallId}` : "",
    lead.toNumber ? `to=${lead.toNumber}` : "",
    lead.fromNumber ? `from=${lead.fromNumber}` : "",
    `entry=${lead.entryPoint}`,
    `campaign=${lead.sourceCampaign}`,
    `center=${center}`,
    lead.callerName ? `name=${lead.callerName}` : "",
    lead.city ? `city=${lead.city}` : "",
    lead.tryingDuration ? `trying=${lead.tryingDuration}` : "",
    lead.knownCondition ? `condition=${lead.knownCondition}` : "",
    lead.priorTreatment ? `prior_treatment=${lead.priorTreatment}` : "",
    lead.callbackWindow ? `callback=${lead.callbackWindow}` : "",
    `intent=${lead.intentScore}/${lead.intentBucket}`,
    `transfer=${lead.transferCompleted ? "completed" : lead.transferRequested ? "requested" : "no"}`,
    lead.summary ? `summary=${lead.summary}` : "",
    lead.transcriptUrl ? `transcript=${lead.transcriptUrl}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
}

function parseBearerToken(value?: string | null) {
  const raw = String(value || "").trim();
  if (!raw.toLowerCase().startsWith("bearer ")) return "";
  return raw.slice(7).trim();
}

function verifyEdesySignature(payload: string, signature: string, secret: string) {
  const expected = `sha256=${crypto.createHmac("sha256", secret).update(payload).digest("hex")}`;
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function isTerminalEdesyStatus(status: string) {
  return EDESY_TERMINAL_STATUSES.has(String(status || "").trim().toLowerCase());
}

function voicePostCallParamValue(token: string, lead: NormalizedEdesyPayload) {
  const normalized = token.trim().toLowerCase();
  if (!normalized) return "";

  if (normalized === "caller_name" || normalized === "name" || normalized === "{{1}}") {
    return lead.callerName || "aapana";
  }
  if (normalized === "education_link" || normalized === "link" || normalized === "{{2}}") {
    return voiceEducationLink(lead.knownCondition);
  }
  if (normalized === "city") return lead.city || "";
  if (normalized === "preferred_centre" || normalized === "centre" || normalized === "center") {
    return lead.preferredCentre || "Santaan";
  }
  if (normalized === "callback_window") return lead.callbackWindow || "";
  if (normalized === "agent_name") return lead.agentName || "Swara";
  if (normalized === "entry_point") return lead.entryPoint || "main";
  if (normalized === "known_condition") return lead.knownCondition || "";
  if (normalized === "trying_duration") return lead.tryingDuration || "";
  if (normalized === "source_campaign" || normalized === "campaign") return lead.sourceCampaign || "";
  return "";
}

function buildVoicePostCallParams(lead: NormalizedEdesyPayload) {
  const configuredOrder = String(process.env.BHASH_VOICE_POST_CALL_PARAM_ORDER || "")
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

  const order = configuredOrder.length ? configuredOrder : ["caller_name", "education_link"];
  return order.map((token) => voicePostCallParamValue(token, lead));
}

function buildVoicePostCallAttachment() {
  const type = String(process.env.BHASH_VOICE_POST_CALL_ATTACHMENT_TYPE || "").trim().toLowerCase();
  const url = String(process.env.BHASH_VOICE_POST_CALL_ATTACHMENT_URL || "").trim();
  const fileName = String(process.env.BHASH_VOICE_POST_CALL_ATTACHMENT_NAME || "").trim();

  if (!type || !url) return undefined;
  if (type !== "document" && type !== "image" && type !== "video") return undefined;

  return {
    type,
    url,
    fileName: type === "document" ? fileName || undefined : undefined,
  } as const;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "edesy-voice-webhook",
    date: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  let logId: number | null = null;
  let eventKey = `edesy:ignored:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

  try {
    const rawBody = await req.text();
    const requiredSecret = process.env.EDESY_WEBHOOK_SECRET?.trim();
    if (requiredSecret) {
      const signature = req.headers.get("x-webhook-signature")?.trim() || "";
      const tokenHeader =
        req.headers.get("x-edesy-token") ||
        req.headers.get("x-webhook-token") ||
        parseBearerToken(req.headers.get("authorization"));
      const tokenQuery = new URL(req.url).searchParams.get("token");
      const hasValidSignature =
        signature && verifyEdesySignature(rawBody || "", signature, requiredSecret);

      if (!hasValidSignature && tokenHeader !== requiredSecret && tokenQuery !== requiredSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    let parsedBody: unknown = null;

    try {
      parsedBody = rawBody ? JSON.parse(rawBody) : null;
    } catch {
      parsedBody = null;
    }

    const lead = normalizeEdesyPayload(parsedBody);
    if (!lead) {
      const ignoredRows = await db
        .insert(voiceCallLogs)
        .values({
          eventKey,
          provider: "edesy",
          rawPayload: rawBody || "raw body unavailable",
          processStatus: "ignored",
          processedAt: new Date().toISOString(),
          errorMessage: "Ignored payload: unable to normalize Edesy webhook body",
        })
        .returning({ id: voiceCallLogs.id });
      logId = ignoredRows[0]?.id || null;

      return NextResponse.json({ success: true, ignored: true });
    }

    eventKey = lead.eventKey;
    if (!isTerminalEdesyStatus(lead.callStatus)) {
      return NextResponse.json({
        success: true,
        skipped: true,
        eventKey,
        reason: "non_terminal_status",
        callStatus: lead.callStatus,
      });
    }

    const duplicate = await db.select().from(voiceCallLogs).where(eq(voiceCallLogs.eventKey, eventKey)).get();
    if (duplicate) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        eventKey,
      });
    }

    const insertedLogRows = await db
      .insert(voiceCallLogs)
      .values({
        eventKey,
        externalCallId: lead.externalCallId,
        provider: lead.provider,
        agentName: lead.agentName,
        fromNumber: lead.fromNumber,
        toNumber: lead.toNumber,
        entryPoint: lead.entryPoint,
        sourceCampaign: lead.sourceCampaign,
        callStatus: lead.callStatus,
        startedAt: lead.startedAt,
        endedAt: lead.endedAt,
        durationSec: lead.durationSec,
        language: lead.language,
        callerName: lead.callerName,
        callerType: lead.callerType,
        city: lead.city,
        preferredCentre: lead.preferredCentre,
        tryingDuration: lead.tryingDuration,
        knownCondition: lead.knownCondition,
        priorTreatment: lead.priorTreatment,
        callbackWindow: lead.callbackWindow,
        whatsappNumber: lead.whatsappNumber,
        transcriptUrl: lead.transcriptUrl,
        summary: lead.summary,
        transferRequested: lead.transferRequested,
        transferCompleted: lead.transferCompleted,
        intentScore: lead.intentScore,
        intentBucket: lead.intentBucket,
        rawPayload: rawBody || JSON.stringify(parsedBody || {}),
        processStatus: "processing",
      })
      .returning({ id: voiceCallLogs.id });

    logId = insertedLogRows[0]?.id || null;

    if (lead.callStatus !== "completed" || lead.answeredByVoiceMail) {
      if (logId !== null) {
        await db
          .update(voiceCallLogs)
          .set({
            neodovePushStatus: "skipped",
            whatsappPushStatus: "skipped",
            processStatus: "processed",
            processedAt: new Date().toISOString(),
          })
          .where(eq(voiceCallLogs.id, logId));
      }

      return NextResponse.json({
        success: true,
        eventKey,
        logged: true,
        skipped: true,
        reason: lead.answeredByVoiceMail ? "voicemail" : "non_completed_terminal_status",
        callStatus: lead.callStatus,
      });
    }

    const center = lead.preferredCentre || "Network";
    const lookupPhone = lead.whatsappNumber || lead.fromNumber;
    const existing = await findContactByPhone(lookupPhone);
    const voiceTags = [
      "voice_ai",
      "edesy",
      `voice_${lead.entryPoint}`,
      `center_${center.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
      `voice_${lead.intentBucket}`,
    ];
    if (lead.transferRequested || lead.transferCompleted) voiceTags.push("voice_transfer");
    if (lead.intentBucket === "hot") voiceTags.push("hot_lead");

    const note = buildVoiceNote(lead, center);
    const now = new Date().toISOString();
    const baseEmailSuffix = lead.externalCallId || `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const fallbackEmail = `voice_${baseEmailSuffix}@pending.santaan.in`;

    let contactId: number | null = null;
    let contactName = lead.callerName || "Voice Lead";
    let contactEmail = fallbackEmail;
    let neoDoveMobile = normalizePhone(lookupPhone);

    if (existing) {
      contactId = existing.id;
      contactName = existing.name || contactName;
      contactEmail = existing.email || contactEmail;
      neoDoveMobile = neoDoveMobile || normalizePhone(existing.phone || existing.whatsappNumber || null);

      const updatedRows = await db
        .update(contacts)
        .set({
          name: existing.name || contactName,
          phone: normalizePhone(existing.phone || lead.fromNumber || null),
          whatsappNumber: normalizePhone(lead.whatsappNumber || existing.whatsappNumber || null),
          whatsappOptIn: lead.whatsappNumber ? true : existing.whatsappOptIn,
          preferredChannel: "phone",
          leadSource: "voice_ai_inbound",
          tags: mergeTags(existing.tags, voiceTags),
          leadScore: Math.max(existing.leadScore || 0, lead.intentScore),
          status:
            existing.status ||
            (lead.intentBucket === "hot" ? "Hot Lead" : lead.transferCompleted ? "Qualified" : "New"),
          message: appendMessage(existing.message, note),
          utmSource: "voice_ai",
          utmMedium: "inbound_call",
          utmCampaign: lead.sourceCampaign,
          utmTerm: lead.entryPoint,
          utmContent: lead.agentName.toLowerCase(),
          landingPath: `/voice-ai/${lead.entryPoint}`,
          lastContact: now,
          lastMessageAt: now,
          conversationCount: (existing.conversationCount || 0) + 1,
          submittedAt: existing.submittedAt || Date.now(),
        })
        .where(eq(contacts.id, existing.id))
        .returning({
          id: contacts.id,
          name: contacts.name,
          email: contacts.email,
          phone: contacts.phone,
          whatsappNumber: contacts.whatsappNumber,
        });

      const updated = updatedRows[0];
      contactId = updated?.id || contactId;
      contactName = updated?.name || contactName;
      contactEmail = updated?.email || contactEmail;
      neoDoveMobile = neoDoveMobile || normalizePhone(updated?.phone || updated?.whatsappNumber || null);
    } else {
      const insertedRows = await db
        .insert(contacts)
        .values({
          name: contactName,
          email: contactEmail,
          phone: normalizePhone(lead.fromNumber),
          whatsappNumber: normalizePhone(lead.whatsappNumber),
          whatsappOptIn: Boolean(lead.whatsappNumber),
          role: "Lead",
          status: lead.intentBucket === "hot" ? "Hot Lead" : lead.transferCompleted ? "Qualified" : "New",
          preferredChannel: "phone",
          leadSource: "voice_ai_inbound",
          tags: voiceTags.join(","),
          leadScore: lead.intentScore,
          message: note,
          utmSource: "voice_ai",
          utmMedium: "inbound_call",
          utmCampaign: lead.sourceCampaign,
          utmTerm: lead.entryPoint,
          utmContent: lead.agentName.toLowerCase(),
          landingPath: `/voice-ai/${lead.entryPoint}`,
          lastContact: now,
          lastMessageAt: now,
          conversationCount: 1,
          submittedAt: Date.now(),
        })
        .returning({
          id: contacts.id,
          name: contacts.name,
          email: contacts.email,
          phone: contacts.phone,
          whatsappNumber: contacts.whatsappNumber,
        });

      const created = insertedRows[0];
      contactId = created?.id || null;
      contactName = created?.name || contactName;
      contactEmail = created?.email || contactEmail;
      neoDoveMobile = neoDoveMobile || normalizePhone(created?.phone || created?.whatsappNumber || null);
    }

    let neoDovePushStatus = "skipped";
    if (neoDoveMobile) {
      const neoDoveResult = await pushLeadToNeoDove({
        name: contactName,
        mobile: neoDoveMobile,
        email: contactEmail,
        source: lead.entryPoint === "tv" ? "voice_ai_tv" : "voice_ai_main",
        campaign: lead.sourceCampaign,
        center,
        status: "OPEN",
        pipeline: "Reminder",
        landingPath: `/voice-ai/${lead.entryPoint}`,
        notes: note,
        tags: voiceTags,
        utm: {
          utm_source: "voice_ai",
          utm_medium: "inbound_call",
          utm_campaign: lead.sourceCampaign,
          utm_term: lead.entryPoint,
          utm_content: lead.agentName.toLowerCase(),
        },
        customFields: {
          AICallSource: lead.entryPoint === "tv" ? "TV Ad" : "Digital Ad",
          TryingDuration: lead.tryingDuration || "",
          KnownCondition: lead.knownCondition || "None",
          PriorTreatment: lead.priorTreatment || "",
          IntentScore: String(lead.intentScore),
          PreferredCentre: center,
          Language: lead.language,
          CallbackWindow: lead.callbackWindow || "",
          AISummary: lead.summary || "",
          TranscriptURL: lead.transcriptUrl || "",
        },
      });

      neoDovePushStatus = neoDoveResult.ok ? "pushed" : neoDoveResult.enabled ? "error" : "skipped";
    }

    let whatsappPushStatus = "skipped";
    const voiceTemplate = String(process.env.BHASH_VOICE_POST_CALL_TEMPLATE || "").trim();
    const voiceWhatsappNumber = normalizePhone(lead.whatsappNumber || lead.fromNumber || null);
    if (voiceTemplate && voiceWhatsappNumber) {
      const response = await sendWhatsAppMessage({
        phone: voiceWhatsappNumber,
        template: voiceTemplate,
        params: buildVoicePostCallParams(lead),
        attachment: buildVoicePostCallAttachment(),
      });
      whatsappPushStatus = response.success ? "sent" : "error";
    }

    if (logId !== null) {
      await db
        .update(voiceCallLogs)
        .set({
          contactId,
          neodovePushStatus: neoDovePushStatus,
          whatsappPushStatus,
          processStatus: "processed",
          processedAt: new Date().toISOString(),
        })
        .where(eq(voiceCallLogs.id, logId));
    }

    return NextResponse.json({
      success: true,
      eventKey,
      contactId,
      entryPoint: lead.entryPoint,
      campaign: lead.sourceCampaign,
      intentScore: lead.intentScore,
      intentBucket: lead.intentBucket,
    });
  } catch (error) {
    console.error("Edesy webhook error:", error);

    if (logId !== null) {
      await db
        .update(voiceCallLogs)
        .set({
          processStatus: "error",
          processedAt: new Date().toISOString(),
          errorMessage: error instanceof Error ? error.message : String(error),
        })
        .where(eq(voiceCallLogs.id, logId));
    }

    return NextResponse.json({ error: "Edesy webhook processing failed", eventKey }, { status: 500 });
  }
}
