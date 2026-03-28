import Groq from "groq-sdk";
import { SYSTEM_INSTRUCTION } from "@/services/chat/prompts";
import { PRIMARY_CALL_NUMBER } from "@/data/centers";
import { db } from "@/lib/db";
import { chatMessages } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

type CompanionTurn = {
  role: "user" | "assistant";
  text: string;
};

type CompanionChannel = "web" | "whatsapp";

export async function getChatHistory(phone: string, limit = 10): Promise<CompanionTurn[]> {
  try {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(and(eq(chatMessages.phone, phone), eq(chatMessages.channel, "whatsapp")))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit)
      .all();

    return messages.reverse().map((msg) => ({
      role: msg.role as "user" | "assistant",
      text: msg.content,
    }));
  } catch (e) {
    console.error("History fetch failed:", e);
    return [];
  }
}

const COST_KEYWORDS = [
  "cost",
  "price",
  "pricing",
  "charge",
  "charges",
  "fee",
  "fees",
  "package",
  "expense",
  "estimate",
  "quotation",
  "quote",
  "kharcha",
  "daam",
  "kitna",
];

const SUCCESS_RATE_KEYWORDS = [
  "success rate",
  "success rates",
  "pregnancy rate",
  "live birth rate",
  "chance of",
  "chances",
  "probability",
  "percentage",
  "guarantee",
  "guaranteed",
];

const EGG_FREEZING_KEYWORDS = [
  "egg freezing",
  "freeze my eggs",
  "freeze eggs",
  "egg freeze",
  "oocyte freezing",
  "fertility preservation",
  "freezew my eggs",
];

const GROQ_MODELS = (
  process.env.GROQ_MODEL?.split(",").map((m) => m.trim()).filter(Boolean) ?? []
).length
  ? process.env.GROQ_MODEL!.split(",").map((m) => m.trim()).filter(Boolean)
  : ["llama-3.1-8b-instant", "llama-3.2-3b-preview"];

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || "";
  if (!apiKey) throw new Error("Groq API key missing");
  return new Groq({ apiKey });
};

const buildGroqMessages = (message: string, history: CompanionTurn[]) => {
  return [
    { role: "system" as const, content: SYSTEM_INSTRUCTION },
    ...history
      .filter((turn) => turn.text.trim())
      .map((turn) => ({
        role: turn.role,
        content: turn.text,
      })),
    { role: "user" as const, content: message },
  ];
};

const sendToGroq = async (message: string, history: CompanionTurn[]) => {
  const groq = getGroqClient();
  for (const model of GROQ_MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        messages: buildGroqMessages(message, history),
        model,
        temperature: 0.5,
        max_tokens: 900,
      });
      const text = completion.choices[0]?.message?.content;
      if (text) return text;
    } catch {
      // try next model
    }
  }
  throw new Error("All Groq models failed");
};

const sendToGemini = async (message: string, history: CompanionTurn[]) => {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || "";
  if (!apiKey) throw new Error("Gemini API key missing");

  const contents = history.map((turn) => ({
    role: turn.role === "user" ? "user" : "model",
    parts: [{ text: turn.text }],
  }));
  contents.push({ role: "user", parts: [{ text: message }] });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        generationConfig: { temperature: 0.5, maxOutputTokens: 700 },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error ${response.status}`);
  }
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini response invalid");
  return text;
};

const localFallback = (message: string, channel: CompanionChannel) => {
  const lower = message.toLowerCase();
  if (isCostOrSuccessRateQuery(lower)) {
    return policyRedirectReply(channel);
  }
  if (hasAnyKeyword(lower, EGG_FREEZING_KEYWORDS)) {
    const eggFreezingReply = [
      "Yes, egg freezing can be a suitable fertility-preservation option for many women.",
      "The plan is usually personalized after ovarian reserve assessment, cycle planning, stimulation, egg retrieval, and vitrification.",
      `The right approach depends on your age, ovarian reserve, diagnosis, and treatment history. Please share your city (Bhubaneswar, Berhampur, or Bangalore), and our Santaan Fertility Executive will guide you. Call ${PRIMARY_CALL_NUMBER}.`,
    ].join(" ");
    return channel === "whatsapp" ? compactForWhatsapp(eggFreezingReply) : eggFreezingReply;
  }
  if (lower.includes("appointment") || lower.includes("book")) {
    return "We can help you book quickly. Please share your city (Bhubaneswar, Berhampur, or Bangalore) and preferred time slot.";
  }
  return channel === "whatsapp"
    ? "Thank you for reaching Santaan. We are reviewing your message and a fertility advisor will assist you shortly."
    : "Thank you for your question. A Santaan advisor can help with personalized next steps if you share your city and concern.";
};

const compactForWhatsapp = (text: string) => {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const limit = 750;
  return cleaned.length <= limit ? cleaned : `${cleaned.slice(0, limit - 1)}…`;
};

const hasAnyKeyword = (lower: string, keywords: string[]) =>
  keywords.some((keyword) => lower.includes(keyword));

const isCostOrSuccessRateQuery = (message: string) => {
  const lower = message.toLowerCase();
  return hasAnyKeyword(lower, COST_KEYWORDS) || hasAnyKeyword(lower, SUCCESS_RATE_KEYWORDS);
};

const responseContainsDisallowedClaims = (text: string) => {
  const lower = text.toLowerCase();
  const hasCostSignal =
    /(₹|rs\.?|inr)\s?\d+/.test(text) ||
    hasAnyKeyword(lower, COST_KEYWORDS);
  const hasSuccessSignal =
    /\d+\s?%/.test(text) ||
    hasAnyKeyword(lower, SUCCESS_RATE_KEYWORDS);
  return hasCostSignal || hasSuccessSignal;
};

const policyRedirectReply = (channel: CompanionChannel) => {
  const guidedReply = [
    "These depend on personalized clinical factors like age, diagnosis, ovarian reserve, sperm parameters, and treatment history.",
    `Please connect with a Santaan Fertility Executive for a personalized plan and transparent counseling. Call ${PRIMARY_CALL_NUMBER}.`,
  ].join(" ");

  return channel === "whatsapp" ? guidedReply : guidedReply;
};

const sendToClaude = async (message: string, history: CompanionTurn[]) => {
  const apiKey = process.env.ANTHROPIC_API_KEY || "";
  if (!apiKey) throw new Error("Anthropic API key missing");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      system: SYSTEM_INSTRUCTION,
      messages: history.map(turn => ({
        role: turn.role === "assistant" ? "assistant" : "user",
        content: turn.text
      })).concat([{ role: "user", content: message }]),
    }),
  });

  if (!response.ok) throw new Error(`Claude API error ${response.status}`);
  const data = await response.json();
  return data.content[0].text;
};

const sendToOpenRouter = async (message: string, history: CompanionTurn[]) => {
  const apiKey = process.env.OPENROUTER_API_KEY || "";
  if (!apiKey) throw new Error("OpenRouter API key missing");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://santaan.in",
      "X-Title": "Santaan AI Agent",
    },
    body: JSON.stringify({
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        ...history.map(turn => ({ role: turn.role, content: turn.text })),
        { role: "user", content: message }
      ],
    }),
  });

  if (!response.ok) throw new Error(`OpenRouter error ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
};

export async function generateCompanionReply(input: {
  message: string;
  history?: CompanionTurn[];
  channel?: CompanionChannel;
}) {
  const message = input.message.trim();
  const history = input.history || [];
  const channel = input.channel || "web";

  if (!message) return localFallback("empty", channel);
  if (isCostOrSuccessRateQuery(message)) return policyRedirectReply(channel);

  // Try Groq first as the primary production AI Agent (requested by user)
  if (process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY) {
    try {
      const reply = await sendToGroq(message, history);
      if (!responseContainsDisallowedClaims(reply)) return channel === "whatsapp" ? compactForWhatsapp(reply) : reply;
    } catch (e) {
      console.error("Groq Agent failed:", e);
    }
  }

  // Fallback to Claude/OpenRouter
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const reply = await sendToOpenRouter(message, history);
      if (!responseContainsDisallowedClaims(reply)) return channel === "whatsapp" ? compactForWhatsapp(reply) : reply;
    } catch (e) {
      console.error("OpenRouter Agent failed:", e);
    }
  }

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const reply = await sendToClaude(message, history);
      if (!responseContainsDisallowedClaims(reply)) return channel === "whatsapp" ? compactForWhatsapp(reply) : reply;
    } catch (e) {
      console.error("Claude Agent failed:", e);
    }
  }

  // Final fallback to Gemini
  try {
    const reply = await sendToGemini(message, history);
    if (responseContainsDisallowedClaims(reply)) return policyRedirectReply(channel);
    return channel === "whatsapp" ? compactForWhatsapp(reply) : reply;
  } catch {
    return localFallback(message, channel);
  }
}
