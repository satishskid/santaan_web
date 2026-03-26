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
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  spend?: string;
  reach?: string;
  impressions?: string;
  clicks?: string;
  cpc?: string;
  ctr?: string;
  cpm?: string;
  actions?: Array<{ action_type?: string; value?: string }>;
  cost_per_action_type?: Array<{ action_type?: string; value?: string }>;
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

export interface MetaAdsConfig {
  accessToken: string;
  accountIds: string[];
  apiVersion: string;
  appSecretConfigured: boolean;
}

export interface MetaEntityInsight {
  accountId: string;
  campaignId: string;
  campaignName: string;
  adsetId?: string;
  adsetName?: string;
  adId?: string;
  adName?: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  leads: number;
  cpl: number;
  dateStart: string;
  dateStop: string;
}

export interface MetaDashboardSnapshot {
  windowDays: number;
  overview: {
    spend: number;
    impressions: number;
    reach: number;
    clicks: number;
    ctr: number;
    cpc: number;
    cpm: number;
    leads: number;
    cpl: number;
  };
  campaigns: MetaEntityInsight[];
  adsets: MetaEntityInsight[];
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

function toRounded(value: number, digits = 2) {
  if (!Number.isFinite(value)) return 0;
  return Number(value.toFixed(digits));
}

function createAppSecretProof(accessToken: string): string | null {
  const appSecret = process.env.META_APP_SECRET?.trim();
  if (!appSecret) return null;
  return createHmac("sha256", appSecret).update(accessToken).digest("hex");
}

function readAccessToken() {
  return process.env.META_ACCESS_TOKEN?.trim() || "";
}

export function readMetaAdsConfig(): MetaAdsConfig | null {
  const accessToken = readAccessToken();
  const accountIds = resolveAccountIds();
  if (!accessToken || !accountIds.length) return null;
  return {
    accessToken,
    accountIds,
    apiVersion: (process.env.META_GRAPH_API_VERSION || "v21.0").trim(),
    appSecretConfigured: Boolean(process.env.META_APP_SECRET?.trim()),
  };
}

export async function validateMetaToken(): Promise<{ ok: true } | { ok: false; error: string }> {
  const config = readMetaAdsConfig();
  if (!config) return { ok: false, error: "Meta configuration missing" };

  try {
    const url = new URL(`https://graph.facebook.com/${config.apiVersion}/me`);
    url.searchParams.set("access_token", config.accessToken);
    const proof = createAppSecretProof(config.accessToken);
    if (proof) {
      url.searchParams.set("appsecret_proof", proof);
    }

    const res = await fetch(url.toString());
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { ok: false, error: data?.error?.message || "Invalid Meta access token" };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to validate Meta token" };
  }
}

function leadActionsCount(actions?: Array<{ action_type?: string; value?: string }>) {
  if (!actions?.length) return 0;
  return actions.reduce((sum, action) => {
    const actionType = String(action.action_type || "").toLowerCase();
    const isLeadLike =
      actionType.includes("lead") ||
      actionType.includes("submit_application") ||
      actionType.includes("complete_registration") ||
      actionType.includes("contact");
    if (!isLeadLike) return sum;
    return sum + parseNumeric(action.value);
  }, 0);
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

interface FetchMetaInsightsInput {
  accountId: string;
  since: string;
  until: string;
  level: "campaign" | "adset";
  apiVersion: string;
  accessToken: string;
}

async function fetchInsightsRangeForAccount(input: FetchMetaInsightsInput): Promise<MetaEntityInsight[]> {
  const insights: MetaEntityInsight[] = [];
  const appSecretProof = createAppSecretProof(input.accessToken);
  const fields = [
    "campaign_id",
    "campaign_name",
    "adset_id",
    "adset_name",
    "ad_id",
    "ad_name",
    "spend",
    "reach",
    "impressions",
    "clicks",
    "cpc",
    "ctr",
    "cpm",
    "actions",
    "cost_per_action_type",
    "date_start",
    "date_stop",
  ].join(",");

  const baseUrl = new URL(`https://graph.facebook.com/${input.apiVersion}/${input.accountId}/insights`);
  baseUrl.searchParams.set("access_token", input.accessToken);
  baseUrl.searchParams.set("level", input.level);
  baseUrl.searchParams.set("time_increment", "all_days");
  baseUrl.searchParams.set("time_range", JSON.stringify({ since: input.since, until: input.until }));
  baseUrl.searchParams.set("fields", fields);
  baseUrl.searchParams.set("limit", "100");
  if (appSecretProof) baseUrl.searchParams.set("appsecret_proof", appSecretProof);

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

    for (const row of payload?.data || []) {
      const spend = parseNumeric(row.spend);
      const impressions = Math.max(0, Math.round(parseNumeric(row.impressions)));
      const clicks = Math.max(0, Math.round(parseNumeric(row.clicks)));
      const reach = Math.max(0, Math.round(parseNumeric(row.reach)));
      const ctr = parseNumeric(row.ctr) || (impressions > 0 ? (clicks / impressions) * 100 : 0);
      const cpc = parseNumeric(row.cpc) || (clicks > 0 ? spend / clicks : 0);
      const cpm = parseNumeric(row.cpm) || (impressions > 0 ? (spend / impressions) * 1000 : 0);
      const leads = leadActionsCount(row.actions);
      const cpl = leads > 0 ? spend / leads : 0;

      if (spend <= 0 && impressions <= 0 && clicks <= 0 && leads <= 0) continue;

      insights.push({
        accountId: input.accountId,
        campaignId: String(row.campaign_id || "").trim() || String(row.campaign_name || "campaign_unknown").trim(),
        campaignName: String(row.campaign_name || row.campaign_id || "campaign_unknown").trim(),
        adsetId: String(row.adset_id || "").trim() || undefined,
        adsetName: String(row.adset_name || row.adset_id || "").trim() || undefined,
        adId: String(row.ad_id || "").trim() || undefined,
        adName: String(row.ad_name || row.ad_id || "").trim() || undefined,
        spend: toRounded(spend),
        impressions,
        reach,
        clicks,
        ctr: toRounded(ctr),
        cpc: toRounded(cpc),
        cpm: toRounded(cpm),
        leads: Math.round(leads),
        cpl: toRounded(cpl),
        dateStart: String(row.date_start || input.since).slice(0, 10),
        dateStop: String(row.date_stop || input.until).slice(0, 10),
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
  const config = readMetaAdsConfig();
  if (!config?.accessToken) {
    throw new Error("META_ACCESS_TOKEN is not configured");
  }

  const accountIds = resolveAccountIds(input.accountIds);
  if (!accountIds.length) {
    throw new Error("META_AD_ACCOUNT_ID or META_AD_ACCOUNT_IDS is not configured");
  }

  const allRows: MetaCampaignInsight[] = [];

  for (const accountId of accountIds) {
    const rows = await fetchInsightsForAccount(accountId, input.date, config.apiVersion, config.accessToken);
    allRows.push(...rows);
  }

  return allRows;
}

export async function fetchMetaDashboardSnapshot(input: {
  since: string;
  until: string;
  windowDays: number;
  accountIds?: string[];
}): Promise<MetaDashboardSnapshot> {
  const config = readMetaAdsConfig();
  if (!config) {
    throw new Error("META_ACCESS_TOKEN or META_AD_ACCOUNT_ID(S) is not configured");
  }

  const accountIds = resolveAccountIds(input.accountIds?.length ? input.accountIds : config.accountIds);
  const [campaignRows, adsetRows] = await Promise.all([
    Promise.all(
      accountIds.map((accountId) =>
        fetchInsightsRangeForAccount({
          accountId,
          since: input.since,
          until: input.until,
          level: "campaign",
          apiVersion: config.apiVersion,
          accessToken: config.accessToken,
        })
      )
    ),
    Promise.all(
      accountIds.map((accountId) =>
        fetchInsightsRangeForAccount({
          accountId,
          since: input.since,
          until: input.until,
          level: "adset",
          apiVersion: config.apiVersion,
          accessToken: config.accessToken,
        })
      )
    ),
  ]);

  const campaigns = campaignRows.flat().sort((a, b) => b.spend - a.spend).slice(0, 12);
  const adsets = adsetRows.flat().sort((a, b) => b.spend - a.spend).slice(0, 12);
  const overview = campaigns.reduce(
    (acc, row) => {
      acc.spend += row.spend;
      acc.impressions += row.impressions;
      acc.reach += row.reach;
      acc.clicks += row.clicks;
      acc.leads += row.leads;
      return acc;
    },
    { spend: 0, impressions: 0, reach: 0, clicks: 0, leads: 0 }
  );

  return {
    windowDays: input.windowDays,
    overview: {
      spend: toRounded(overview.spend),
      impressions: Math.round(overview.impressions),
      reach: Math.round(overview.reach),
      clicks: Math.round(overview.clicks),
      ctr: toRounded(overview.impressions > 0 ? (overview.clicks / overview.impressions) * 100 : 0),
      cpc: toRounded(overview.clicks > 0 ? overview.spend / overview.clicks : 0),
      cpm: toRounded(overview.impressions > 0 ? (overview.spend / overview.impressions) * 1000 : 0),
      leads: Math.round(overview.leads),
      cpl: toRounded(overview.leads > 0 ? overview.spend / overview.leads : 0),
    },
    campaigns,
    adsets,
  };
}
