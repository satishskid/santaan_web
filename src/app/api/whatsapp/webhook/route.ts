import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts, chatMessages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateCompanionReply, getChatHistory } from "@/lib/companion";
import { sendWhatsAppTextMessage } from "@/services/whatsapp";
import { PRIMARY_CALL_NUMBER } from "@/data/centers";
import { analyzeTelecallerNote } from "@/lib/ai/note-analyzer";
import { pushLeadToNeoDove } from "@/lib/neodove";

type NormalizedWebhookMessage = {
  from: string;
  name: string;
  text: string;
  provider: "meta" | "twilio" | "gupshup" | "interakt" | "bhash";
};

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "santaan_verify_token_2026";

const DEFAULT_GREETING = [
  "Namaste from Santaan IVF. I am your Santaan AI Agent.",
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
      "Start with patient-friendly fertility guides here:",
      "https://santaan.in/fertility-guides",
      "If you share your age and concern, I can guide next steps.",
    ].join("\n");
  }

  if (lower.includes("score") || lower.includes("readiness") || lower.includes("assessment")) {
    return [
      "Check your fertility score here:",
      "https://santaan.in/know-your-score",
      "It is a simple first step before deciding what to do next.",
    ].join("\n");
  }

  if (
    lower.includes("pcos") ||
    lower.includes("thyroid") ||
    lower.includes("male") ||
    lower.includes("sperm") ||
    lower.includes("condition")
  ) {
    return [
      "Explore the most common fertility conditions here:",
      "https://santaan.in/fertility-conditions",
      "Open the page that feels closest to your concern.",
    ].join("\n");
  }

  if (lower.includes("tips") || lower.includes("newsletter") || lower.includes("updates")) {
    return [
      "Get fertility tips and gentle updates here:",
      "https://santaan.in/fertility-tips",
      "A good option if you want to learn first and decide later.",
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

  // BhashSMS format (Estimated based on common patterns)
  const bhashPhone = getString(payload, "mobile") || getString(payload, "phone") || getString(payload, "sender");
  const bhashText = getString(payload, "msg") || getString(payload, "message") || getString(payload, "text");
  if (bhashPhone && bhashText) {
    return {
      provider: "bhash",
      from: normalizePhone(bhashPhone),
      name: getString(payload, "name") || "WhatsApp User",
      text: bhashText,
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

    // AI Analysis for Chips
    let aiSentiment: string | null = null;
    let aiReason: string | null = null;
    let aiTags: string[] = [];
    
    try {
      const analysis = await analyzeTelecallerNote(text);
      if (analysis) {
        aiSentiment = analysis.sentiment;
        aiReason = analysis.reason;
        aiTags = analysis.tags.map(t => `wa_chip_${t.toLowerCase().replace(/\s+/g, "_")}`);
        baseTags.push(...aiTags);
      }
    } catch (e) {
      console.error("WhatsApp AI chip extraction failed:", e);
    }

    const leadBoost = (isConsultIntent ? 25 : 10) + (isTreatmentIntent ? 20 : 0) + (isAtHomeIntent ? 15 : 0);
    let contactId: number;
    let finalContact: any;

    if (existing) {
      contactId = existing.id;
      const updated = await db
        .update(contacts)
        .set({
          whatsappOptIn: true,
          preferredChannel: "whatsapp",
          leadSource: "whatsapp_inbound",
          tags: dedupeTags(existing.tags, baseTags),
          leadScore: Math.min(100, (existing.leadScore || 0) + leadBoost),
          status: existing.status || "New",
          sentiment: aiSentiment || existing.sentiment,
          lossReason: aiReason || existing.lossReason,
          message: text,
          utmSource: existing.utmSource || "whatsapp",
          utmMedium: existing.utmMedium || "chat",
          utmCampaign: existing.utmCampaign || `wa_${center.toLowerCase()}`,
          landingPath: existing.landingPath || `/whatsapp/${center.toLowerCase()}`,
          lastMessageAt: now,
          lastContact: now,
          conversationCount: (existing.conversationCount || 0) + 1,
        })
        .where(eq(contacts.id, existing.id))
        .returning();
      finalContact = updated[0];
    } else {
      const inserted = await db.insert(contacts).values({
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
        sentiment: aiSentiment,
        lossReason: aiReason,
        message: text,
        utmSource: "whatsapp",
        utmMedium: "chat",
        utmCampaign: `wa_${center.toLowerCase()}`,
        utmContent: messageData.provider,
        landingPath: `/whatsapp/${center.toLowerCase()}`,
        lastMessageAt: now,
        lastContact: now,
        conversationCount: 1,
      }).returning({ id: contacts.id });
      contactId = inserted[0].id;
      const created = await db.select().from(contacts).where(eq(contacts.id, contactId)).get();
      finalContact = created;
    }

    // Sync to NeoDove with AI Chips
    if (finalContact) {
      try {
        await pushLeadToNeoDove({
          name: finalContact.name,
          mobile: finalContact.whatsappNumber || finalContact.phone || "",
          email: finalContact.email,
          source: "whatsapp_ai_agent",
          campaign: finalContact.utmCampaign || "WHATSAPP AGENT",
          center: center,
          status: "OPEN",
          notes: `[WA AI AGENT] Sentiment: ${aiSentiment || "Neutral"} | Intent: ${aiReason || "General Inquiry"} | Message: ${text}`,
          tags: baseTags,
          utm: {
            utm_source: finalContact.utmSource || "whatsapp",
            utm_medium: finalContact.utmMedium || "chat",
            utm_campaign: finalContact.utmCampaign || "wa_agent",
          }
        });
      } catch (e) {
        console.error("NeoDove sync from WA agent failed:", e);
      }
    }

    // Log user message
    await db.insert(chatMessages).values({
      contactId,
      phone: from,
      role: "user",
      content: text,
      channel: "whatsapp",
    });

    const quickReply = getQuickReply(text);
    
    // Prepare history for the AI Agent (Brain) - Now using full history!
    const history = await getChatHistory(from);

    const companionReply = quickReply
      ? quickReply
      : await generateCompanionReply({
          message: text,
          history: history,
          channel: "whatsapp",
        });

    const finalReply = `${companionReply}\n\nNeed a human callback? Reply 9.`;

    // Log assistant message
    await db.insert(chatMessages).values({
      contactId,
      phone: from,
      role: "assistant",
      content: finalReply,
      channel: "whatsapp",
    });
    
    // Send response back via WhatsApp
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
