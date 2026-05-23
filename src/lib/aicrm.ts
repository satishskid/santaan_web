import { resolveCenter } from "@/lib/lead-attribution";
import { type UtmParams, ensureMandatoryUtm } from "@/lib/utm";

const DEFAULT_AICRM_WEBHOOK_URL = "https://edge-crm-worker.devadmin-27f.workers.dev/api/webhook/lead";
const CLEAN_PHONE = /[^0-9]/g;

export type AiCrmLeadInput = {
  name: string;
  phone: string;
  topic: string;
  source: string;
  campaign: string;
  utm?: UtmParams;
  landingPath?: string;
  location?: string;
  target?: string;
  email?: string;
  notes?: string;
  extras?: Record<string, unknown>;
};

const resolveWebhookUrl = () =>
  process.env.AICRM_LEAD_WEBHOOK_URL?.trim() ||
  process.env.EDGE_CRM_LEAD_WEBHOOK_URL?.trim() ||
  DEFAULT_AICRM_WEBHOOK_URL;

export const normalizeLeadPhone = (value: string) => {
  const digits = value.replace(CLEAN_PHONE, "");
  if (!digits) return "";
  if (digits.length > 10 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
};

export async function pushLeadToAiCrm(input: AiCrmLeadInput) {
  const normalizedPhone = normalizeLeadPhone(input.phone);
  if (!normalizedPhone) {
    return { ok: false, status: 400, error: "A valid WhatsApp number is required." };
  }

  const utm = ensureMandatoryUtm(input.utm || {});
  const landingPath = input.landingPath || utm.landing_path || "/";
  const center = resolveCenter({
    center: input.location || utm.center,
    landingPath,
    target: input.target || input.phone,
  });

  const answers: Record<string, unknown> = {
    source: input.source,
    campaign: input.campaign,
    topic: input.topic,
    preferred_channel: "whatsapp",
    center,
    landing_path: landingPath,
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
    utm_term: utm.utm_term,
    utm_content: utm.utm_content,
    asset: utm.asset,
    ...(input.location ? { location: input.location } : {}),
    ...(input.email ? { email: input.email.trim().toLowerCase() } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
    ...(input.extras || {}),
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = process.env.AICRM_LEAD_WEBHOOK_TOKEN?.trim() || process.env.EDGE_CRM_LEAD_WEBHOOK_TOKEN?.trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(resolveWebhookUrl(), {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: input.name.trim(),
        phone: normalizedPhone,
        answers,
      }),
      signal: AbortSignal.timeout(8000),
    });

    const text = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      body: text,
    };
  } catch (error) {
    console.error("AICRM lead forward error:", error);
    return {
      ok: false,
      status: 500,
      error: "Failed to forward lead to AICRM.",
    };
  }
}
