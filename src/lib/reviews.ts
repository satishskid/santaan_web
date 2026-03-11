export const REVIEW_SOURCES = ["google", "meta", "manual"] as const;
export const REVIEW_CENTERS = ["bhubaneswar", "berhampur", "bangalore", "angul", "network"] as const;
export const REVIEW_RESPONSE_STATUS = ["pending", "responded", "escalated", "not_needed"] as const;
export const REVIEW_SENTIMENTS = ["positive", "neutral", "negative"] as const;

export type ReviewSource = (typeof REVIEW_SOURCES)[number];
export type ReviewCenter = (typeof REVIEW_CENTERS)[number];
export type ReviewResponseStatus = (typeof REVIEW_RESPONSE_STATUS)[number];
export type ReviewSentiment = (typeof REVIEW_SENTIMENTS)[number];

export type ReviewTheme =
  | "doctor_trust"
  | "staff_care"
  | "cost_transparency"
  | "waiting_time"
  | "communication"
  | "cleanliness"
  | "results_outcome"
  | "process_guidance"
  | "technology_ai"
  | "location_access"
  | "privacy_discretion";

const THEME_RULES: Array<{ theme: ReviewTheme; terms: string[] }> = [
  { theme: "doctor_trust", terms: ["doctor", "dr", "consultant", "specialist", "doctor's guidance", "doctor guidance"] },
  { theme: "staff_care", terms: ["staff", "team", "nurse", "coordinator", "supportive", "care", "helpful"] },
  { theme: "cost_transparency", terms: ["cost", "price", "pricing", "expensive", "afford", "charges", "transparent"] },
  { theme: "waiting_time", terms: ["wait", "waiting", "delay", "late", "queue"] },
  { theme: "communication", terms: ["explain", "communication", "clear", "counsel", "responsive", "follow up", "follow-up"] },
  { theme: "cleanliness", terms: ["clean", "hygiene", "neat", "facility", "environment"] },
  { theme: "results_outcome", terms: ["success", "pregnant", "baby", "result", "conceive", "outcome"] },
  { theme: "process_guidance", terms: ["process", "step", "guided", "journey", "treatment plan"] },
  { theme: "technology_ai", terms: ["ai", "technology", "advanced", "lab", "diagnostic"] },
  { theme: "location_access", terms: ["location", "parking", "easy to reach", "nearby", "accessible"] },
  { theme: "privacy_discretion", terms: ["private", "privacy", "discreet", "confidential"] },
];

export function normalizeReviewToken(value?: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function isAllowedReviewValue<T extends readonly string[]>(value: string, allowed: T): value is T[number] {
  return (allowed as readonly string[]).includes(value);
}

export function parseReviewDate(value?: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

export function parseRating(value?: unknown) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) return null;
  return parsed;
}

export function inferSentiment(rating: number, reviewText: string): ReviewSentiment {
  const text = normalizeReviewToken(reviewText);
  const negativeTerms = ["bad", "poor", "delay", "late", "problem", "issue", "expensive", "rude", "disappoint", "worst"];
  const positiveTerms = ["good", "great", "excellent", "supportive", "helpful", "care", "happy", "best", "thanks"];

  if (rating <= 2) return "negative";
  if (rating >= 4) return "positive";
  if (negativeTerms.some((term) => text.includes(term))) return "negative";
  if (positiveTerms.some((term) => text.includes(term))) return "positive";
  return "neutral";
}

export function extractThemes(reviewText: string): ReviewTheme[] {
  const text = normalizeReviewToken(reviewText);
  const hits = THEME_RULES.filter((rule) => rule.terms.some((term) => text.includes(term))).map((rule) => rule.theme);
  return Array.from(new Set(hits));
}

export function computeReviewSummary<T extends {
  rating: number;
  sentiment?: string | null;
  responseStatus?: string | null;
  reviewDate?: string | null;
  isFeatured?: boolean | number | null;
  themes?: string | null;
}>(rows: T[]) {
  const total = rows.length;
  const averageRating = total > 0 ? rows.reduce((sum, row) => sum + Number(row.rating || 0), 0) / total : 0;
  const lowRatedPending = rows.filter(
    (row) => Number(row.rating || 0) <= 3 && normalizeReviewToken(row.responseStatus) !== "responded" && normalizeReviewToken(row.responseStatus) !== "not_needed"
  ).length;
  const responded = rows.filter((row) => normalizeReviewToken(row.responseStatus) === "responded").length;
  const featured = rows.filter((row) => Boolean(row.isFeatured)).length;
  const last30Cutoff = new Date();
  last30Cutoff.setDate(last30Cutoff.getDate() - 30);
  const new30d = rows.filter((row) => {
    const raw = String(row.reviewDate || "");
    if (!raw) return false;
    const parsed = new Date(raw);
    return !Number.isNaN(parsed.getTime()) && parsed >= last30Cutoff;
  }).length;

  const themeCount = new Map<string, number>();
  for (const row of rows) {
    try {
      const themes = JSON.parse(String(row.themes || "[]"));
      if (Array.isArray(themes)) {
        for (const theme of themes) {
          const key = String(theme || "").trim();
          if (!key) continue;
          themeCount.set(key, (themeCount.get(key) || 0) + 1);
        }
      }
    } catch {
      // ignore bad rows
    }
  }

  const topThemes = Array.from(themeCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([theme, count]) => ({ theme, count }));

  return {
    total,
    averageRating: Math.round(averageRating * 10) / 10,
    lowRatedPending,
    responded,
    featured,
    new30d,
    topThemes,
  };
}

export function themeLabel(theme: string) {
  return theme
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
