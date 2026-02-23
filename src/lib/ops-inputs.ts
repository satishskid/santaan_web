export const ALLOWED_CENTERS = ["bhubaneswar", "berhampur", "bangalore"] as const;
export const ALLOWED_PLATFORMS = ["meta", "google", "youtube"] as const;
export const ALLOWED_UTM_MEDIUM = ["paid_social", "cpc", "video"] as const;
export const ALLOWED_ACTIVITY_TYPES = ["doctor_visit", "hoarding", "camp", "event"] as const;

export function normalizeToken(value?: string | null, fallback = "") {
  if (!value) return fallback;
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned || fallback;
}

export function parseDate(value?: string | null) {
  if (!value) return null;
  const safe = value.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(safe)) return null;
  return safe;
}

export function parseAmount(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100) / 100;
}

export function parseNonNegativeInteger(value: unknown, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) return null;
  return parsed;
}

export function isAllowedValue<T extends readonly string[]>(value: string, allowed: T): value is T[number] {
  return allowed.includes(value as T[number]);
}
