export const META_ACCOUNT_OPTIONS = [
  {
    accountId: "1358685458532020",
    label: "Santaan - BNG",
    center: "bangalore",
    marketHint: "Bangalore account for broader IVF intent and clinic-led campaigns.",
    defaultPlacements: ["instagram_feed", "instagram_reels", "facebook_feed"],
  },
  {
    accountId: "1479087293636083",
    label: "SANTAAN - ODISHA",
    center: "odisha",
    marketHint: "Odisha market skews more Facebook + Instagram + reel-led.",
    defaultPlacements: ["facebook_feed", "instagram_feed", "instagram_reels", "facebook_reels"],
  },
] as const;

export const META_OBJECTIVES = [
  "OUTCOME_LEADS",
  "OUTCOME_TRAFFIC",
  "OUTCOME_ENGAGEMENT",
  "OUTCOME_AWARENESS",
] as const;

export type MetaLaunchStatus =
  | "draft"
  | "content_ready"
  | "pending_approval"
  | "approved"
  | "launched"
  | "blocked";

export function buildAdsManagerLink(accountId: string) {
  const sanitized = String(accountId || "").replace(/^act_/, "").trim();
  if (!sanitized) return "https://adsmanager.facebook.com/adsmanager/manage/campaigns";
  return `https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${encodeURIComponent(sanitized)}`;
}

export function defaultPlacementsForAccount(accountId: string) {
  const match = META_ACCOUNT_OPTIONS.find((option) => option.accountId === String(accountId || "").replace(/^act_/, ""));
  return [...(match?.defaultPlacements || ["facebook_feed", "instagram_feed", "instagram_reels"])];
}

export function marketHintForAccount(accountId: string) {
  const match = META_ACCOUNT_OPTIONS.find((option) => option.accountId === String(accountId || "").replace(/^act_/, ""));
  return match?.marketHint || "Use the account view in Ads Manager to finish final setup and QA.";
}

export function centerFromAccount(accountId: string) {
  const match = META_ACCOUNT_OPTIONS.find((option) => option.accountId === String(accountId || "").replace(/^act_/, ""));
  return match?.center || "network";
}

export function formatPlacementsForStorage(values: readonly string[]) {
  return values.map((value) => value.trim()).filter(Boolean).join(",");
}

export function parsePlacements(value?: string | null) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
