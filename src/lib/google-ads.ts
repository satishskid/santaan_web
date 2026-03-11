interface GoogleAdsApiMetricRow {
  campaign?: {
    id?: string | number;
    name?: string;
  };
  segments?: {
    date?: string;
  };
  metrics?: {
    impressions?: string | number;
    clicks?: string | number;
    costMicros?: string | number;
    cost_micros?: string | number;
  };
}

interface GoogleAdsStreamBatch {
  results?: GoogleAdsApiMetricRow[];
}

export interface GoogleCampaignInsight {
  customerId: string;
  campaignId: string;
  campaignName: string;
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
}

export interface GoogleCustomerDebugRow {
  customerId: string;
  rows: number;
  campaigns: number;
  spend: number;
}

export interface GoogleCampaignInsightsDebug {
  rows: GoogleCampaignInsight[];
  customersQueried: string[];
  perCustomer: GoogleCustomerDebugRow[];
}

export interface FetchGoogleCampaignInsightsInput {
  date: string; // YYYY-MM-DD
  customerIds?: string[];
}

function normalizeCustomerId(value: string): string {
  return String(value || "").replace(/\D/g, "");
}

function parseCustomerIds(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => normalizeCustomerId(item))
    .filter(Boolean);
}

function resolveCustomerIds(explicit?: string[]): string[] {
  if (explicit?.length) {
    return explicit.map((item) => normalizeCustomerId(item)).filter(Boolean);
  }

  const many = parseCustomerIds(process.env.GOOGLE_ADS_CUSTOMER_IDS || "");
  if (many.length > 0) return many;

  const single = normalizeCustomerId(process.env.GOOGLE_ADS_CUSTOMER_ID || "");
  return single ? [single] : [];
}

function parseNumeric(value: unknown): number {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed)) return 0;
  return parsed;
}

function ensureClientId() {
  return (
    process.env.GOOGLE_ADS_CLIENT_ID?.trim() ||
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    ""
  );
}

function ensureClientSecret() {
  return (
    process.env.GOOGLE_ADS_CLIENT_SECRET?.trim() ||
    process.env.GOOGLE_CLIENT_SECRET?.trim() ||
    ""
  );
}

async function fetchGoogleAccessToken(): Promise<string> {
  const clientId = ensureClientId();
  const clientSecret = ensureClientSecret();
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN?.trim() || "";

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Google Ads OAuth credentials missing: GOOGLE_ADS_CLIENT_ID/SECRET and GOOGLE_ADS_REFRESH_TOKEN are required"
    );
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | { access_token?: string; error?: string; error_description?: string }
    | null;

  if (!response.ok || !payload?.access_token) {
    const message =
      payload?.error_description || payload?.error || `Google OAuth failed with ${response.status}`;
    throw new Error(message);
  }

  return payload.access_token;
}

async function fetchInsightsForCustomer(
  customerId: string,
  date: string,
  accessToken: string,
  developerToken: string,
  apiVersion: string,
  loginCustomerId?: string
): Promise<GoogleCampaignInsight[]> {
  const endpoint = `https://googleads.googleapis.com/${apiVersion}/customers/${customerId}/googleAds:searchStream`;
  const query = [
    "SELECT",
    "campaign.id,",
    "campaign.name,",
    "segments.date,",
    "metrics.impressions,",
    "metrics.clicks,",
    "metrics.cost_micros",
    "FROM campaign",
    `WHERE segments.date = '${date}'`,
    "AND campaign.status != 'REMOVED'",
  ].join(" ");

  const headers: Record<string, string> = {
    authorization: `Bearer ${accessToken}`,
    "developer-token": developerToken,
    "content-type": "application/json",
  };

  if (loginCustomerId) {
    headers["login-customer-id"] = loginCustomerId;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
    cache: "no-store",
  });

  const payloadText = await response.text();
  let payload: GoogleAdsStreamBatch[] | null = null;
  try {
    payload = JSON.parse(payloadText) as GoogleAdsStreamBatch[];
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      `Google Ads API failed for customer ${customerId}: ${response.status} ${payloadText.slice(0, 300)}`
    );
  }

  const batches = Array.isArray(payload) ? payload : [];
  const rows: GoogleCampaignInsight[] = [];

  for (const batch of batches) {
    const results = Array.isArray(batch?.results) ? batch.results : [];
    for (const row of results) {
      const campaignId = String(row?.campaign?.id ?? "").trim();
      const campaignName = String(row?.campaign?.name ?? "").trim();

      if (!campaignId && !campaignName) continue;

      const costMicros = parseNumeric(
        row?.metrics?.costMicros ?? row?.metrics?.cost_micros ?? 0
      );
      const spend = Math.round((costMicros / 1_000_000) * 100) / 100;
      if (spend <= 0) continue;

      rows.push({
        customerId,
        campaignId: campaignId || campaignName,
        campaignName: campaignName || campaignId,
        date: String(row?.segments?.date || date).slice(0, 10),
        impressions: Math.max(0, Math.trunc(parseNumeric(row?.metrics?.impressions))),
        clicks: Math.max(0, Math.trunc(parseNumeric(row?.metrics?.clicks))),
        spend,
      });
    }
  }

  return rows;
}

export function inferCenterFromGoogleCampaignName(campaignName: string): string {
  const normalized = campaignName.toLowerCase();
  if (/(berh|brp|ganjam|gopalpur)/.test(normalized)) return "berhampur";
  if (/(bang|beng|blr|aecs|whitefield)/.test(normalized)) return "bangalore";
  if (/(bhub|bbsr|khordha|anugul|angul)/.test(normalized)) return "bhubaneswar";
  return "network";
}

export async function fetchGoogleCampaignInsights(
  input: FetchGoogleCampaignInsightsInput
): Promise<GoogleCampaignInsight[]> {
  const payload = await fetchGoogleCampaignInsightsDebug(input);
  return payload.rows;
}

export async function fetchGoogleCampaignInsightsDebug(
  input: FetchGoogleCampaignInsightsInput
): Promise<GoogleCampaignInsightsDebug> {
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim() || "";
  if (!developerToken) {
    throw new Error("GOOGLE_ADS_DEVELOPER_TOKEN is not configured");
  }

  const customerIds = resolveCustomerIds(input.customerIds);
  if (!customerIds.length) {
    throw new Error("GOOGLE_ADS_CUSTOMER_IDS (or GOOGLE_ADS_CUSTOMER_ID) is not configured");
  }

  const loginCustomerId = normalizeCustomerId(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || "");
  const apiVersion = (process.env.GOOGLE_ADS_API_VERSION || "v18").trim();
  const accessToken = await fetchGoogleAccessToken();

  const allRows: GoogleCampaignInsight[] = [];
  const perCustomer: GoogleCustomerDebugRow[] = [];
  for (const customerId of customerIds) {
    const rows = await fetchInsightsForCustomer(
      customerId,
      input.date,
      accessToken,
      developerToken,
      apiVersion,
      loginCustomerId || undefined
    );
    allRows.push(...rows);

    const spend = rows.reduce((sum, row) => sum + Number(row.spend || 0), 0);
    const campaigns = new Set(rows.map((row) => row.campaignId || row.campaignName).filter(Boolean)).size;
    perCustomer.push({
      customerId,
      rows: rows.length,
      campaigns,
      spend: Math.round(spend * 100) / 100,
    });
  }

  return {
    rows: allRows,
    customersQueried: customerIds,
    perCustomer,
  };
}
