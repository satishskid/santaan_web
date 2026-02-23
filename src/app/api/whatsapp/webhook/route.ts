import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateCompanionReply } from "@/lib/companion";
import { sendWhatsAppTextMessage } from "@/services/whatsapp";
import { PRIMARY_CALL_NUMBER } from "@/data/centers";

type NormalizedWebhookMessage = {
  from: string;
  name: string;
  text: string;
  provider: "meta" | "twilio" | "gupshup" | "interakt";
};

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "santaan_verify_token_2026";

const DEFAULT_GREETING = [
  "Namaste from Santaan IVF. I am Santaan Companion.",
  "How can we help you today?",
  "1) At-home fertility test",
  "2) Book doctor consultation",
  "3) IVF information",
  "4) Talk to a human advisor",
  "Reply with 1, 2, 3, 4 or type your question.",
].join("\n");

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) return digits.slice(2);
  return digits;
}

function dedupeTags(existing: string | null, nextTags: string[]) {
  const merged = new Set((existing || "").split(",").map((tag) => tag.trim()).filter(Boolean));
  nextTags.forEach((tag) => merged.add(tag));
  return Array.from(merged).join(",");
}

function messageCenterHint(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("bhubaneswar") || lower.includes("bbsr")) return "Bhubaneswar";
  if (lower.includes("berhampur") || lower.includes("brahmapur")) return "Berhampur";
  if (lower.includes("bangalore") || lower.includes("bengaluru") || lower.includes("aecs")) return "Bangalore";
  return "Network";
}

function getQuickReply(text: string) {
  const lower = text.trim().toLowerCase();

  if (["hi", "hello", "hey", "namaste", "start"].includes(lower)) {
    return DEFAULT_GREETING;
  }

  if (lower === "1" || lower.includes("home test")) {
    return [
      "At-home fertility testing is available.",
      "Book directly: https://santaan.in/at-home-fertility-testing",
      `Need urgent help? Call ${PRIMARY_CALL_NUMBER}`,
    ].join("\n");
  }

  if (lower === "2" || lower.includes("consult")) {
    return [
      "Doctor consultation booking is open.",
      "Book now: https://santaan.in/at-home-fertility-testing",
      "Share your city and preferred time slot.",
    ].join("\n");
  }

  if (lower === "3" || lower.includes("ivf")) {
    return [
      "Explore evidence-based IVF guidance here:",
      "https://santaan.in/fertility-insights",
      "If you share your age and concern, I can guide next steps.",
    ].join("\n");
  }

  if (lower === "4" || lower === "9" || lower.includes("human") || lower.includes("advisor")) {
    return [
      "A Santaan advisor will connect shortly.",
      "Please share: city, age (optional), and best callback time.",
    ].join("\n");
  }

  return null;
}

function getString(input: unknown, key: string) {
  if (!input || typeof input !== "object") return undefined;
  const value = (input as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}

function normalizeWebhookPayload(body: unknown): NormalizedWebhookMessage | null {
  if (!body || typeof body !== "object") return null;
  const payload = body as Record<string, unknown>;

  // Meta Cloud API
  const entry = Array.isArray(payload.entry) ? payload.entry[0] : undefined;
  const changes = entry && typeof entry === "object" && Array.isArray((entry as Record<string, unknown>).changes)
    ? ((entry as Record<string, unknown>).changes as unknown[])[0]
    : undefined;
  const value = changes && typeof changes === "object" ? getString(changes, "value") : undefined;
  if (changes && typeof changes === "object") {
    const changeValue = (changes as Record<string, unknown>).value as Record<string, unknown> | undefined;
    const messages = changeValue?.messages;
    if (Array.isArray(messages) && messages.length > 0) {
      const message = messages[0] as Record<string, unknown>;
      const contactsNode = Array.isArray(changeValue?.contacts) ? changeValue?.contacts[0] : undefined;
      const profile = contactsNode && typeof contactsNode === "object" ? (contactsNode as Record<string, unknown>).profile : undefined;
      const from = getString(message, "from");
      const textNode = message?.text as Record<string, unknown> | undefined;
      const text = getString(textNode, "body");

      if (from && text) {
        return {
          provider: "meta",
          from: normalizePhone(from),
          name: (profile && typeof profile === "object" ? getString(profile, "name") : undefined) || "WhatsApp User",
          text,
        };
      }
    }
  }

  // Twilio format
  const fromTwilio = getString(payload, "From");
  const bodyTwilio = getString(payload, "Body");
  if (fromTwilio && bodyTwilio) {
    return {
      provider: "twilio",
      from: normalizePhone(fromTwilio.replace("whatsapp:", "")),
      name: getString(payload, "ProfileName") || "WhatsApp User",
      text: bodyTwilio,
    };
  }

  // Gupshup format
  const gupPayload = payload.payload as Record<string, unknown> | undefined;
  const gupSender = gupPayload?.sender as Record<string, unknown> | undefined;
  const gupPayloadData = gupPayload?.payload as Record<string, unknown> | undefined;
  if (gupSender && gupPayloadData) {
    const phone = getString(gupSender, "phone");
    const text = getString(gupPayloadData, "text");
    if (phone && text) {
      return {
        provider: "gupshup",
        from: normalizePhone(phone),
        name: getString(gupSender, "name") || "WhatsApp User",
        text,
      };
    }
  }

  // Interakt format
  const interaktData = payload.data as Record<string, unknown> | undefined;
  const customer = interaktData?.customer as Record<string, unknown> | undefined;
  const message = interaktData?.message as Record<string, unknown> | undefined;
  const customerPhone = customer ? getString(customer, "phone_number") : undefined;
  const customerText = message ? getString(message, "text") : undefined;
  if (customerPhone && customerText) {
    return {
      provider: "interakt",
      from: normalizePhone(customerPhone),
      name: getString(customer, "name") || "WhatsApp User",
      text: customerText,
    };
  }

  if (value) {
    // no-op; keeps type checker happy for meta probing
  }

  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge || "", { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;
    const messageData = normalizeWebhookPayload(body);

    if (!messageData) {
      return NextResponse.json({ success: true, message: "No actionable message" });
    }

    const from = normalizePhone(messageData.from);
    const text = messageData.text.trim();
    const center = messageCenterHint(text);
    const now = new Date().toISOString();

    const existing = await db
      .select()
      .from(contacts)
      .where(eq(contacts.whatsappNumber, from))
      .get();

    const baseTags = ["whatsapp", "conversation", `center_${center.toLowerCase()}`];
    const isConsultIntent = /consult|appointment|doctor|book/i.test(text);
    const isAtHomeIntent = /home|test|sample/i.test(text);
    const isTreatmentIntent = /ivf|iui|fertility|pcos|amh|thyroid/i.test(text);

    if (isConsultIntent) baseTags.push("consultation");
    if (isAtHomeIntent) baseTags.push("at_home_test");
    if (isTreatmentIntent) baseTags.push("treatment");

    const leadBoost = (isConsultIntent ? 25 : 10) + (isTreatmentIntent ? 20 : 0) + (isAtHomeIntent ? 15 : 0);

    if (existing) {
      await db
        .update(contacts)
        .set({
          whatsappOptIn: true,
          preferredChannel: "whatsapp",
          leadSource: "whatsapp_inbound",
          tags: dedupeTags(existing.tags, baseTags),
          leadScore: Math.min(100, (existing.leadScore || 0) + leadBoost),
          status: existing.status || "New",
          message: text,
          utmSource: existing.utmSource || "whatsapp",
          utmMedium: existing.utmMedium || "chat",
          utmCampaign: existing.utmCampaign || `wa_${center.toLowerCase()}`,
          landingPath: existing.landingPath || `/whatsapp/${center.toLowerCase()}`,
          lastMessageAt: now,
          lastContact: now,
          conversationCount: (existing.conversationCount || 0) + 1,
        })
        .where(eq(contacts.id, existing.id));
    } else {
      await db.insert(contacts).values({
        name: messageData.name || "WhatsApp User",
        email: `whatsapp_${from}@pending.santaan.in`,
        phone: from,
        whatsappNumber: from,
        whatsappOptIn: true,
        preferredChannel: "whatsapp",
        leadSource: "whatsapp_inbound",
        tags: baseTags.join(","),
        leadScore: Math.min(90, 20 + leadBoost),
        status: "Hot Lead",
        message: text,
        utmSource: "whatsapp",
        utmMedium: "chat",
        utmCampaign: `wa_${center.toLowerCase()}`,
        utmContent: messageData.provider,
        landingPath: `/whatsapp/${center.toLowerCase()}`,
        lastMessageAt: now,
        lastContact: now,
        conversationCount: 1,
      });
    }

    const quickReply = getQuickReply(text);
    const companionReply = quickReply
      ? quickReply
      : await generateCompanionReply({
          message: text,
          history: [],
          channel: "whatsapp",
        });

    const finalReply = `${companionReply}\n\nNeed a human callback? Reply 9.`;
    await sendWhatsAppTextMessage({
      phone: from,
      text: finalReply,
    });

    return NextResponse.json({
      success: true,
      center,
      provider: messageData.provider,
    });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

