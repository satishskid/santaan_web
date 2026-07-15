export type MarketingAttribution = {
  fbclid?: string;
  fbp?: string;
  fbc?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  ad_id?: string;
  ad_name?: string;
  campaign_id?: string;
};

const STORAGE_KEY = "santaan_click_attribution";
const QUERY_KEYS = ["fbclid", "gclid", "gbraid", "wbraid", "ad_id", "ad_name", "campaign_id"] as const;

const readCookie = (name: string) => {
  if (typeof document === "undefined") return undefined;
  const prefix = `${name}=`;
  return document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix))
    ?.slice(prefix.length);
};

const clean = (value: string | null | undefined, max = 250) => {
  const normalized = value?.trim().slice(0, max);
  return normalized || undefined;
};

export const captureMarketingAttribution = (url: string) => {
  if (typeof window === "undefined") return;
  try {
    const parsed = new URL(url, window.location.origin);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as MarketingAttribution;
    const next: MarketingAttribution = { ...stored };
    for (const key of QUERY_KEYS) next[key] = clean(parsed.searchParams.get(key)) || next[key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Attribution must never block the public journey.
  }
};

export const readMarketingAttribution = (): MarketingAttribution => {
  if (typeof window === "undefined") return {};
  let stored: MarketingAttribution = {};
  try {
    stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as MarketingAttribution;
  } catch {
    stored = {};
  }
  const current = new URL(window.location.href);
  const result: MarketingAttribution = { ...stored };
  for (const key of QUERY_KEYS) result[key] = clean(current.searchParams.get(key)) || result[key];
  result.fbp = clean(readCookie("_fbp"));
  result.fbc = clean(readCookie("_fbc"));
  return result;
};
