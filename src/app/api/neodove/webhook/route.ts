import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { contacts } from "@/db/schema";
import { ensureMandatoryUtm } from "@/lib/utm";
import { resolveCenter } from "@/lib/lead-attribution";
import {
  mapNeoDoveStatus,
  normalizeIndianMobile,
  parseNeoDoveWebhookLead,
  toNeoDoveCampaignTag,
} from "@/lib/neodove";

const MAX_MESSAGE_LENGTH = 1800;

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
  try {
    const requiredSecret = process.env.NEODOVE_WEBHOOK_SECRET?.trim();
    if (requiredSecret) {
      const tokenHeader = req.headers.get("x-neodove-token") || req.headers.get("x-webhook-token");
      const tokenQuery = new URL(req.url).searchParams.get("token");
      if (tokenHeader !== requiredSecret && tokenQuery !== requiredSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = (await req.json()) as unknown;
    const webhookLead = parseNeoDoveWebhookLead(body);

    if (!webhookLead) {
      return NextResponse.json({ success: true, message: "Ignored non-lead payload" });
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
    const normalizedEvent = webhookLead.event.toLowerCase();
    const statusSignal =
      normalizedEvent.includes("dispose")
        ? "dispose"
        : webhookLead.stageName || webhookLead.status || webhookLead.statusCode || webhookLead.event;
    const mappedStatus = mapNeoDoveStatus(statusSignal);
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

    if (existing) {
      await db
        .update(contacts)
        .set({
          name: existing.name || webhookLead.name || `NeoDove Lead ${mobile?.slice(-4) || "new"}`,
          phone: existing.phone || mobile || null,
          email: existing.email || email || `neodove_${mobile || Date.now()}@pending.santaan.in`,
          preferredChannel: "phone",
          leadSource: "neodove_webhook",
          status: mappedStatus,
          tags: mergeTags(existing.tags, tags),
          message: appendMessage(existing.message, note),
          ownerName: webhookLead.assignedTo || existing.ownerName || null,
          nextFollowUpAt: webhookLead.followUpAt || existing.nextFollowUpAt || null,
          utmSource: utm.utm_source,
          utmMedium: utm.utm_medium,
          utmCampaign: utm.utm_campaign,
          utmTerm: utm.utm_term || center.toLowerCase(),
          utmContent: utm.utm_content,
          landingPath: utm.landing_path,
          lastContact: now,
          lastMessageAt: now,
          conversationCount: (existing.conversationCount || 0) + 1,
          leadScore: Math.min(100, (existing.leadScore || 0) + (mappedStatus === "Converted" ? 30 : 10)),
        })
        .where(eq(contacts.id, existing.id));
    } else {
      await db.insert(contacts).values({
        name: webhookLead.name || `NeoDove Lead ${mobile?.slice(-4) || "new"}`,
        email: email || `neodove_${mobile || Date.now()}@pending.santaan.in`,
        phone: mobile || null,
        role: "Lead",
        status: mappedStatus,
        preferredChannel: "phone",
        leadSource: "neodove_webhook",
        tags: tags.join(","),
        message: note,
        leadScore: mappedStatus === "Converted" ? 80 : 35,
        ownerName: webhookLead.assignedTo || null,
        nextFollowUpAt: webhookLead.followUpAt || null,
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
      event: webhookLead.event,
      center,
      status: mappedStatus,
    });
  } catch (error) {
    console.error("NeoDove webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
