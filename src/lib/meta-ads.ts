import { createHmac } from "node:crypto";

export interface MetaCampaignInsight {
  accountId: string;
  campaignId: string;
  campaignName: string;
  spend: number;
  impressions: number;
  clicks: number;
  dateStart: string;
  dateStop: string;
}

interface MetaInsightsApiRow {
  campaign_id?: string;
  campaign_name?: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  date_start?: string;
  date_stop?: string;
}

interface MetaInsightsApiResponse {
  data?: MetaInsightsApiRow[];
  paging?: {
    next?: string;
  };
  error?: {
    message?: string;
    code?: number;
    error_subcode?: number;
  };
}

export interface FetchMetaCampaignInsightsInput {
  date: string; // YYYY-MM-DD
  accountIds?: string[];
}

function ensureActPrefix(accountId: string): string {
  const trimmed = accountId.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("act_") ? trimmed : `act_${trimmed}`;
}

function parseAccountIds(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => ensureActPrefix(value))
    .filter(Boolean);
}

function resolveAccountIds(explicit?: string[]): string[] {
  if (explicit?.length) {
    return explicit.map((value) => ensureActPrefix(value)).filter(Boolean);
  }

  const many = parseAccountIds(process.env.META_AD_ACCOUNT_IDS || "");
  if (many.length > 0) return many;

  const single = ensureActPrefix(process.env.META_AD_ACCOUNT_ID || "");
  return single ? [single] : [];
}

function parseNumeric(value: string | undefined): number {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed)) return 0;
  return parsed;
}

function createAppSecretProof(accessToken: string): string | null {
  const appSecret = process.env.META_APP_SECRET?.trim();
  if (!appSecret) return null;
  return createHmac("sha256", appSecret).update(accessToken).digest("hex");
}

async function fetchInsightsForAccount(
  accountId: string,
  date: string,
  apiVersion: string,
  accessToken: string
): Promise<MetaCampaignInsight[]> {
  const insights: MetaCampaignInsight[] = [];

  const fields = [
    "campaign_id",
    "campaign_name",
    "spend",
    "impressions",
    "clicks",
    "date_start",
    "date_stop",
  ].join(",");

  const appSecretProof = createAppSecretProof(accessToken);
  const baseUrl = new URL(`https://graph.facebook.com/${apiVersion}/${accountId}/insights`);
  baseUrl.searchParams.set("access_token", accessToken);
  baseUrl.searchParams.set("level", "campaign");
  baseUrl.searchParams.set("time_increment", "1");
  baseUrl.searchParams.set("time_range", JSON.stringify({ since: date, until: date }));
  baseUrl.searchParams.set("fields", fields);
  baseUrl.searchParams.set("limit", "250");
  if (appSecretProof) {
    baseUrl.searchParams.set("appsecret_proof", appSecretProof);
  }

  let nextUrl: string | null = baseUrl.toString();
  let guard = 0;

  while (nextUrl && guard < 20) {
    guard += 1;
    const response = await fetch(nextUrl, {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
    });

    let payload: MetaInsightsApiResponse | null = null;
    try {
      payload = (await response.json()) as MetaInsightsApiResponse;
    } catch {
      payload = null;
    }

    if (!response.ok || payload?.error) {
      const message =
        payload?.error?.message || `Meta API request failed with status ${response.status}`;
      throw new Error(message);
    }

    const rows = payload?.data || [];
    for (const row of rows) {
      const spend = parseNumeric(row.spend);
      if (spend <= 0) continue;
      const campaignId = String(row.campaign_id || "").trim();
      const campaignName = String(row.campaign_name || "").trim();
      if (!campaignId && !campaignName) continue;

      insights.push({
        accountId,
        campaignId: campaignId || campaignName,
        campaignName: campaignName || campaignId,
        spend: Math.round(spend * 100) / 100,
        impressions: Math.max(0, Math.trunc(parseNumeric(row.impressions))),
        clicks: Math.max(0, Math.trunc(parseNumeric(row.clicks))),
        dateStart: String(row.date_start || date).slice(0, 10),
        dateStop: String(row.date_stop || date).slice(0, 10),
      });
    }

    nextUrl = payload?.paging?.next || null;
  }

  return insights;
}

export function inferCenterFromCampaignName(campaignName: string): string {
  const normalized = campaignName.toLowerCase();
  if (/(berh|brp|ganjam|gopalpur)/.test(normalized)) return "berhampur";
  if (/(bang|beng|blr|aecs|whitefield)/.test(normalized)) return "bangalore";
  if (/(bhub|bbsr|khordha|anugul|angul)/.test(normalized)) return "bhubaneswar";
  return "network";
}

export async function fetchMetaCampaignInsights(
  input: FetchMetaCampaignInsightsInput
): Promise<MetaCampaignInsight[]> {
  const accessToken = process.env.META_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    throw new Error("META_ACCESS_TOKEN is not configured");
  }

  const accountIds = resolveAccountIds(input.accountIds);
  if (!accountIds.length) {
    throw new Error("META_AD_ACCOUNT_ID or META_AD_ACCOUNT_IDS is not configured");
  }

  const apiVersion = (process.env.META_GRAPH_API_VERSION || "v21.0").trim();
  const allRows: MetaCampaignInsight[] = [];

  for (const accountId of accountIds) {
    const rows = await fetchInsightsForAccount(accountId, input.date, apiVersion, accessToken);
    allRows.push(...rows);
  }

  return allRows;
}
