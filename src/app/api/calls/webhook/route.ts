import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { resolveCenter } from "@/lib/lead-attribution";
import { ensureMandatoryUtm } from "@/lib/utm";

type IncomingCallEvent = {
  callId: string;
  from: string;
  to: string;
  status: string;
  durationSec: number;
  startedAt: string;
  provider: string;
  centerHint?: string;
  asset?: string;
  recordingUrl?: string;
  rawPayload: unknown;
};

const CLEAN_PHONE = /[^0-9]/g;

function normalizePhone(value?: string | null) {
  if (!value) return "";
  const digits = value.replace(CLEAN_PHONE, "");
  if (digits.length > 10 && digits.startsWith("91")) return digits.slice(2);
  return digits;
}

function normalizeStatus(value?: string | null) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return "unknown";
  return normalized;
}

function parseNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getString(payload: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function parseCallEvent(body: unknown): IncomingCallEvent | null {
  if (!body || typeof body !== "object") return null;
  const payload = body as Record<string, unknown>;

  const callId =
    getString(payload, "call_id", "callId", "sid", "id") ||
    `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const from = normalizePhone(getString(payload, "from", "caller", "customer_number", "ani"));
  const to = normalizePhone(getString(payload, "to", "dialed_number", "did", "virtual_number", "destination"));
  const status = normalizeStatus(getString(payload, "status", "event", "call_status", "disposition"));
  const durationSec = parseNumber(payload.duration ?? payload.talk_time ?? payload.billsec, 0);
  const startedAt =
    getString(payload, "started_at", "start_time", "timestamp", "created_at") || new Date().toISOString();
  const provider = getString(payload, "provider", "source", "vendor") || "telephony";
  const centerHint = getString(payload, "center", "center_name", "queue", "route");
  const asset = getString(payload, "asset", "asset_id", "campaign", "campaign_id");
  const recordingUrl = getString(payload, "recording_url", "recording");

  if (!from && !to) return null;

  return {
    callId,
    from,
    to,
    status,
    durationSec,
    startedAt,
    provider,
    centerHint,
    asset,
    recordingUrl,
    rawPayload: body,
  };
}

function mergeTags(existing: string | null, tags: string[]) {
  const set = new Set((existing || "").split(",").map((tag) => tag.trim()).filter(Boolean));
  tags.forEach((tag) => set.add(tag));
  return Array.from(set).join(",");
}

async function findContactByPhone(phone: string) {
  if (!phone) return null;

  const exact = await db.select().from(contacts).where(eq(contacts.phone, phone)).get();
  if (exact) return exact;

  const allContacts = await db.select().from(contacts).all();
  const target10 = phone.slice(-10);
  return (
    allContacts.find((contact) => {
      const existing = normalizePhone(contact.phone || contact.whatsappNumber || "");
      return existing && existing.slice(-10) === target10;
    }) || null
  );
}

export async function POST(req: NextRequest) {
  try {
    const requiredSecret = process.env.CALL_WEBHOOK_SECRET;
    if (requiredSecret) {
      const tokenFromHeader = req.headers.get("x-call-webhook-token");
      const tokenFromQuery = new URL(req.url).searchParams.get("token");
      if (tokenFromHeader !== requiredSecret && tokenFromQuery !== requiredSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = (await req.json()) as unknown;
    const event = parseCallEvent(body);
    if (!event) {
      return NextResponse.json({ success: true, message: "Ignored non-call payload" });
    }

    const center = resolveCenter({
      center: event.centerHint,
      landingPath: event.asset || "",
      target: event.to || event.from,
    });

    const utm = ensureMandatoryUtm({
      utm_source: "phone",
      utm_medium: "telephony",
      utm_campaign: event.asset || `ivr_${center.toLowerCase()}`,
      utm_content: event.provider,
      center: center.toLowerCase(),
      asset: event.asset || event.callId,
      landing_path: `/calls/${center.toLowerCase()}`,
    });

    const now = new Date().toISOString();
    const note = [
      `[${now}] CALL EVENT`,
      `call_id=${event.callId}`,
      `status=${event.status}`,
      `from=${event.from || "unknown"}`,
      `to=${event.to || "unknown"}`,
      `center=${center}`,
      `duration=${event.durationSec}s`,
      event.recordingUrl ? `recording=${event.recordingUrl}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    const lookupPhone = event.from || event.to;
    const existing = await findContactByPhone(lookupPhone);
    const leadBoost = event.durationSec >= 45 ? 22 : event.status.includes("miss") ? 8 : 14;

    if (existing) {
      await db
        .update(contacts)
        .set({
          phone: existing.phone || lookupPhone,
          preferredChannel: "phone",
          leadSource: "call_inbound",
          tags: mergeTags(existing.tags, [
            "call",
            event.status.includes("miss") ? "call_missed" : "call_connected",
            `center_${center.toLowerCase()}`,
          ]),
          leadScore: Math.min(100, (existing.leadScore || 0) + leadBoost),
          message: `${existing.message || ""}\n${note}`.trim().slice(-1800),
          status: event.status.includes("miss") ? existing.status || "New" : existing.status || "Contacted",
          utmSource: utm.utm_source,
          utmMedium: utm.utm_medium,
          utmCampaign: utm.utm_campaign,
          utmTerm: utm.utm_term || center.toLowerCase(),
          utmContent: utm.utm_content,
          landingPath: utm.landing_path,
          lastContact: now,
          lastMessageAt: now,
          conversationCount: (existing.conversationCount || 0) + 1,
        })
        .where(eq(contacts.id, existing.id));
    } else {
      await db.insert(contacts).values({
        name: `Phone Lead ${lookupPhone.slice(-4) || "new"}`,
        email: `call_${event.callId}@pending.santaan.in`,
        phone: lookupPhone || null,
        role: "Lead",
        status: event.status.includes("miss") ? "New" : "Contacted",
        preferredChannel: "phone",
        leadSource: "call_inbound",
        tags: [
          "call",
          event.status.includes("miss") ? "call_missed" : "call_connected",
          `center_${center.toLowerCase()}`,
        ].join(","),
        leadScore: Math.min(90, 30 + leadBoost),
        message: note,
        utmSource: utm.utm_source,
        utmMedium: utm.utm_medium,
        utmCampaign: utm.utm_campaign,
        utmTerm: utm.utm_term || center.toLowerCase(),
        utmContent: utm.utm_content,
        landingPath: utm.landing_path,
        lastContact: now,
        lastMessageAt: now,
        conversationCount: 1,
        submittedAt: Date.now(),
      });
    }

    return NextResponse.json({
      success: true,
      callId: event.callId,
      center,
      status: event.status,
    });
  } catch (error) {
    console.error("Call webhook error:", error);
    return NextResponse.json({ error: "Call webhook processing failed" }, { status: 500 });
  }
}
