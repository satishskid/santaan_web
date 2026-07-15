import { resolveCenter } from "@/lib/lead-attribution";
import { type MarketingAttribution } from "@/lib/marketing-attribution";
import { ensureMandatoryUtm, type UtmParams } from "@/lib/utm";

const DEFAULT_INTAKE_URL = "https://api.crmai.greybrain.ai/api/intake/lead";

type FormKind = "at_home_testing" | "seminar_registration" | "book_consultation" | "contact" | "callback";

export type AiCrmWebsiteLeadInput = {
  submissionId: string;
  formKind: FormKind;
  name: string;
  phone: string;
  email?: string;
  location?: string;
  campaign: string;
  landingPath: string;
  referrer?: string;
  contentUrn?: string;
  utm?: UtmParams;
  attribution?: MarketingAttribution;
  formData?: Record<string, string | number | boolean | null>;
};

const normalizePhone = (value: string) => {
  const digits = value.replace(/[^0-9]/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return digits ? `+${digits}` : "";
};

const clientIp = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  || request.headers.get("x-real-ip")?.trim()
  || undefined;

export async function pushWebsiteLeadToAiCrm(input: AiCrmWebsiteLeadInput, request: Request) {
  const secret = process.env.AICRM_WEBSITE_INTAKE_SECRET?.trim();
  if (!secret) return { ok: false, status: 503, error: "AICRM website intake is not configured." };

  const phone = normalizePhone(input.phone);
  if (!phone) return { ok: false, status: 400, error: "A valid phone number is required." };

  const utm = ensureMandatoryUtm(input.utm || {});
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.santaan.in";
  const landingPage = new URL(input.landingPath || "/", siteUrl).toString();
  const center = resolveCenter({ center: input.location, landingPath: input.landingPath });

  try {
    const response = await fetch(process.env.AICRM_WEBSITE_INTAKE_URL?.trim() || DEFAULT_INTAKE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        submission_id: input.submissionId,
        event_id: input.submissionId,
        form_kind: input.formKind,
        name: input.name.trim(),
        phone,
        email: input.email?.trim().toLowerCase() || undefined,
        location: center,
        campaign: input.campaign,
        landing_page: landingPage,
        referrer: input.referrer,
        content_urn: input.contentUrn,
        occurred_at: new Date().toISOString(),
        utm: {
          utm_source: utm.utm_source,
          utm_medium: utm.utm_medium,
          utm_campaign: utm.utm_campaign,
          utm_term: utm.utm_term,
          utm_content: utm.utm_content,
        },
        attribution: input.attribution,
        client: {
          ip_address: clientIp(request),
          user_agent: request.headers.get("user-agent") || undefined,
        },
        form_data: input.formData,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    const result = await response.json().catch(() => null) as {
      accepted?: boolean;
      lead_id?: string;
      error?: string;
    } | null;
    if (!response.ok || result?.accepted !== true || !result.lead_id) {
      return { ok: false, status: response.status, error: result?.error || "CRM did not accept the lead." };
    }
    return { ok: true, status: response.status, leadId: result.lead_id };
  } catch (error) {
    console.error("AICRM website intake failed:", error instanceof Error ? error.message : "unknown error");
    return { ok: false, status: 502, error: "CRM intake is temporarily unavailable." };
  }
}
