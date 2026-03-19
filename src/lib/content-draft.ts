import { buildMandatoryTrackedUrl, ensureMandatoryUtm } from "@/lib/utm";

type ContentTopicRow = {
  topic: string;
  leads: number;
  conversions: number;
  rate: number;
};

type ContentCenterRow = {
  center: string;
  leads: number;
  conversions: number;
  rate: number;
};

type ContentTimeWindowRow = {
  window: string;
  leads: number;
  conversions: number;
  rate: number;
};

type PaidCandidateRow = {
  campaign: string;
  cpp: number;
  spend: number;
  conversions: number;
};

export type ContentDraftInputs = {
  totalLeads: number;
  unattributedLeads: number;
  topics: ContentTopicRow[];
  centers: ContentCenterRow[];
  timeWindows: ContentTimeWindowRow[];
  keywordSuggestions: string[];
  topLandingPagesByTopic?: Record<string, string>;
  bestPaid?: PaidCandidateRow[];
  pausePaid?: PaidCandidateRow[];
};

export type DraftReadiness = {
  level: "low" | "medium" | "high";
  canCopy: boolean;
  reasons: string[];
};

export type DraftThresholds = {
  minLeads: number;
  maxUnattributedRatio: number;
};

function parseEnvNumber(value: string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getDefaultDraftThresholds(): DraftThresholds {
  const minLeads = parseEnvNumber(process.env.NEXT_PUBLIC_CONTENT_DRAFT_MIN_LEADS) ?? 10;
  const maxUnattributedRatio = parseEnvNumber(process.env.NEXT_PUBLIC_CONTENT_DRAFT_MAX_UNATTRIBUTED_RATIO) ?? 0.5;

  const safeMinLeads = Math.max(1, Math.round(minLeads));
  const safeMaxRatio = Math.max(0, Math.min(1, maxUnattributedRatio));

  return { minLeads: safeMinLeads, maxUnattributedRatio: safeMaxRatio };
}

function monthToken(date: Date) {
  return date.toLocaleString("en-US", { month: "short" }).toLowerCase();
}

function dayToken(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  return `${monthToken(date)}${day}`;
}

function toToken(value: string) {
  const normalized = ensureMandatoryUtm({ utm_campaign: value }).utm_campaign || "always_on";
  return normalized;
}

function normalizeCenter(value: string) {
  const lower = String(value || "").trim().toLowerCase();
  if (!lower || lower === "network") return "network";
  return lower;
}

function normalizeLandingPath(value: string) {
  const raw = String(value || "/").trim();
  const base = raw.split("?")[0] || "/";
  if (!base) return "/";
  return base.startsWith("/") ? base : `/${base}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatTopicLabel(topic: string) {
  switch (topic) {
    case "ivf":
      return "IVF";
    case "iui":
      return "IUI";
    case "pcos_pcod":
      return "PCOS / PCOD";
    case "male_fertility":
      return "Male fertility";
    case "egg_freezing":
      return "Egg freezing";
    case "at_home_test":
      return "At-home test";
    case "success_rates":
      return "Success rates";
    case "doctors":
      return "Doctors";
    case "pricing":
      return "Pricing";
    default:
      return "General awareness";
  }
}

function percentLabel(ratio: number) {
  const pct = Math.round(Math.max(0, Math.min(1, ratio)) * 100);
  return `${pct}%`;
}

export function getDraftReadiness(
  input: Pick<ContentDraftInputs, "totalLeads" | "unattributedLeads">,
  thresholds: DraftThresholds = getDefaultDraftThresholds()
): DraftReadiness {
  const total = Math.max(0, Number(input.totalLeads || 0));
  const unattributed = Math.max(0, Number(input.unattributedLeads || 0));
  const ratio = total > 0 ? unattributed / total : 1;

  const safeMinLeads = Math.max(1, Math.round(Number(thresholds.minLeads || 10)));
  const safeMaxRatio = Math.max(0, Math.min(1, Number(thresholds.maxUnattributedRatio ?? 0.5)));

  const reasons: string[] = [];
  if (total < safeMinLeads) reasons.push(`Not enough CRM leads yet (need at least ${safeMinLeads} to avoid hunch-based posting).`);
  if (total > 0 && ratio > safeMaxRatio)
    reasons.push(`Attribution quality is low (more than ${percentLabel(safeMaxRatio)} leads missing UTMs).`);

  const canCopy = reasons.length === 0;
  const highMinLeads = Math.max(30, safeMinLeads * 3);
  const highMaxRatio = Math.min(0.2, safeMaxRatio / 2);
  const level: DraftReadiness["level"] =
    total >= highMinLeads && ratio <= highMaxRatio ? "high" : total >= safeMinLeads && ratio <= safeMaxRatio ? "medium" : "low";

  if (!canCopy && reasons.length === 0) reasons.push("Draft prompt is not ready.");
  return { level, canCopy, reasons };
}

export function buildContentManagerGeminiPrompt(input: ContentDraftInputs, thresholds: DraftThresholds = getDefaultDraftThresholds()) {
  const today = new Date();
  const readiness = getDraftReadiness({ totalLeads: input.totalLeads, unattributedLeads: input.unattributedLeads }, thresholds);

  const primaryCenter = input.centers[0]?.center || "Network";
  const primaryCenterToken = normalizeCenter(primaryCenter);
  const primaryTopic = input.topics[0]?.topic || "general";
  const primaryWindow = input.timeWindows[0]?.window || "17:00–20:00";
  const landingPath = normalizeLandingPath(input.topLandingPagesByTopic?.[primaryTopic] || "/");

  const utmCampaign = toToken(`${primaryTopic}_${primaryCenter}_${dayToken(today)}`);

  const instagramOrganic = buildMandatoryTrackedUrl({
    url: landingPath,
    utm_source: "instagram",
    utm_medium: "organic_social",
    utm_campaign: utmCampaign,
    utm_content: `reel_${dayToken(today)}_a`,
    utm_term: toToken(primaryTopic),
    center: primaryCenterToken,
    asset: `ig_reel_${dayToken(today)}_a`,
  });

  const metaPaid = buildMandatoryTrackedUrl({
    url: landingPath,
    utm_source: "meta",
    utm_medium: "paid_social",
    utm_campaign: utmCampaign,
    utm_content: `reel_${dayToken(today)}_a`,
    utm_term: toToken(primaryTopic),
    center: primaryCenterToken,
    asset: `meta_reel_${dayToken(today)}_a`,
  });

  const googleSearch = buildMandatoryTrackedUrl({
    url: landingPath,
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: utmCampaign,
    utm_content: `search_${dayToken(today)}_a`,
    utm_term: "{keyword}",
    center: primaryCenterToken,
    asset: `gads_search_${dayToken(today)}_a`,
  });

  const youtube = buildMandatoryTrackedUrl({
    url: landingPath,
    utm_source: "youtube",
    utm_medium: "video",
    utm_campaign: utmCampaign,
    utm_content: `short_${dayToken(today)}_a`,
    utm_term: toToken(primaryTopic),
    center: primaryCenterToken,
    asset: `yt_short_${dayToken(today)}_a`,
  });

  const topicsBlock = input.topics
    .slice(0, 5)
    .map((t) => `- ${formatTopicLabel(t.topic)} (leads ${t.leads}, conv ${t.conversions}, rate ${t.rate.toFixed(1)}%)`)
    .join("\n");

  const windowsBlock = input.timeWindows
    .slice(0, 4)
    .map((w) => `- ${w.window} (conv ${w.conversions}, rate ${w.rate.toFixed(1)}%)`)
    .join("\n");

  const centersBlock = input.centers
    .slice(0, 4)
    .map((c) => `- ${c.center} (conv ${c.conversions}, rate ${c.rate.toFixed(1)}%)`)
    .join("\n");

  const keywordsBlock = input.keywordSuggestions.slice(0, 12).map((k) => `- ${k}`).join("\n");

  const paidScaleBlock = (input.bestPaid || [])
    .slice(0, 6)
    .map((row) => `- ${row.campaign} (CPP ${formatCurrency(row.cpp)}, conv ${row.conversions})`)
    .join("\n");

  const paidPauseBlock = (input.pausePaid || [])
    .slice(0, 6)
    .map((row) => `- ${row.campaign} (spend ${formatCurrency(row.spend)}, conv ${row.conversions})`)
    .join("\n");

  const prompt = [
    "You are the Content Manager for Santaan IVF. Create tomorrow's social content plan + captions using the performance feedback below.",
    "",
    "CONSTRAINTS:",
    "- Keep it factual; do not mention success rates, guarantees, or pricing numbers.",
    "- Use respectful medical tone, simple language, strong CTA to book consultation / call.",
    "- Output in English + Hinglish mix (simple).",
    "",
    "PERFORMANCE FEEDBACK (from CRM):",
    `Data readiness: ${readiness.level.toUpperCase()}`,
    `Primary topic: ${formatTopicLabel(primaryTopic)}`,
    `Primary center: ${primaryCenter}`,
    `Best posting window to prioritize: ${primaryWindow}`,
    "",
    "Top converting topics:",
    topicsBlock || "- (not enough data)",
    "",
    "Best time windows:",
    windowsBlock || "- (not enough data)",
    "",
    "Center focus:",
    centersBlock || "- (not enough data)",
    "",
    "Keyword ideas (use in hooks/captions):",
    keywordsBlock || "- (not enough data)",
    "",
    "Paid ads notes:",
    "Scale candidates:",
    paidScaleBlock || "- (not enough data)",
    "Fix/pause candidates:",
    paidPauseBlock || "- (not enough data)",
    "",
    "DELIVERABLES (make 4 items):",
    "1) 2 Instagram Reel captions (15–25 seconds script + caption + CTA + hashtags).",
    "2) 1 Instagram Carousel outline (6 slides) + caption.",
    "3) 1 YouTube Short script (20–30 seconds) + title + description.",
    "",
    "IMPORTANT: Embed the tracking link in each caption/description (use the correct link depending on channel).",
    "",
    `INSTAGRAM ORGANIC LINK: ${instagramOrganic}`,
    `META PAID LINK: ${metaPaid}`,
    `GOOGLE SEARCH LINK: ${googleSearch}`,
    `YOUTUBE LINK: ${youtube}`,
    "",
    "At the end, add a short section called 'Ops Log' listing:",
    "- asset ids used (ig_reel_..., ig_carousel_..., yt_short_...)",
    "- utm_campaign used",
    "- center",
    "- posting window",
  ].join("\n");

  return {
    readiness,
    utmCampaign,
    links: {
      instagramOrganic,
      metaPaid,
      googleSearch,
      youtube,
    },
    prompt,
  };
}
