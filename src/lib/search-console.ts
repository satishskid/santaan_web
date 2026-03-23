import { createSign } from "node:crypto";
import { getSiteUrl } from "@/lib/site";

const OAUTH_AUDIENCE = "https://oauth2.googleapis.com/token";
const OAUTH_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

export interface SearchConsoleConfig {
  siteUrl: string;
  clientEmail: string;
  privateKey: string;
}

interface SearchConsoleApiRow {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}

interface SearchConsoleApiResponse {
  rows?: SearchConsoleApiRow[];
  responseAggregationType?: string;
  error?: {
    message?: string;
  };
}

function base64UrlEncode(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodeEscapedNewlines(value: string) {
  return value.replace(/\\n/g, "\n");
}

function readJsonServiceAccount() {
  const raw =
    process.env.SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON ||
    process.env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON ||
    process.env.GA4_SERVICE_ACCOUNT_JSON ||
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON ||
    "";
  if (!raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as {
      client_email?: string;
      private_key?: string;
    };
    if (!parsed.client_email || !parsed.private_key) return null;
    return {
      clientEmail: parsed.client_email,
      privateKey: decodeEscapedNewlines(parsed.private_key),
    };
  } catch {
    return null;
  }
}

export function normalizeSiteUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("sc-domain:")) {
    return trimmed;
  }
  try {
    const normalized = new URL(trimmed).toString();
    return normalized.endsWith("/") ? normalized : `${normalized}/`;
  } catch {
    return "";
  }
}

export function readSearchConsoleConfig(): SearchConsoleConfig | null {
  const jsonAccount = readJsonServiceAccount();
  const clientEmail =
    jsonAccount?.clientEmail ||
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() ||
    process.env.GA4_CLIENT_EMAIL?.trim() ||
    "";
  const privateKeyRaw =
    jsonAccount?.privateKey ||
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ||
    process.env.GA4_PRIVATE_KEY ||
    "";
  const privateKey = decodeEscapedNewlines(privateKeyRaw.trim());
  const siteUrl = normalizeSiteUrl(
    process.env.SEARCH_CONSOLE_SITE_URL ||
      process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL ||
      getSiteUrl()
  );

  if (!siteUrl || !clientEmail || !privateKey) return null;
  return { siteUrl, clientEmail, privateKey };
}

function createJwtAssertion(config: SearchConsoleConfig) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: config.clientEmail,
    scope: OAUTH_SCOPE,
    aud: OAUTH_AUDIENCE,
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(config.privateKey);

  return `${signingInput}.${base64UrlEncode(signature)}`;
}

async function fetchAccessToken(config: SearchConsoleConfig) {
  const assertion = createJwtAssertion(config);
  const params = new URLSearchParams();
  params.set("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");
  params.set("assertion", assertion);

  const response = await fetch(OAUTH_AUDIENCE, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
    cache: "no-store",
  });

  const payload = (await response.json()) as { access_token?: string; error_description?: string };
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || "Failed to fetch Search Console access token");
  }
  return payload.access_token;
}

function toFixedNumber(value: number | undefined, digits = 2) {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed)) return 0;
  return Number(parsed.toFixed(digits));
}

async function runQuery(
  config: SearchConsoleConfig,
  accessToken: string,
  body: Record<string, unknown>
) {
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(config.siteUrl)}/searchAnalytics/query`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = (await response.json()) as SearchConsoleApiResponse;
  if (!response.ok || payload?.error?.message) {
    throw new Error(payload?.error?.message || `Search Console request failed with status ${response.status}`);
  }
  return payload;
}

function dateRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setUTCDate(end.getUTCDate() - Math.max(0, days - 1));
  const toDate = (value: Date) => value.toISOString().slice(0, 10);
  return {
    startDate: toDate(start),
    endDate: toDate(end),
  };
}

export interface SearchConsoleSnapshot {
  windowDays: number;
  siteUrl: string;
  overview: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    page?: string | null;
  }>;
  topPages: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

export async function fetchSearchConsoleSnapshot(
  config: SearchConsoleConfig,
  days: number
): Promise<SearchConsoleSnapshot> {
  const accessToken = await fetchAccessToken(config);
  const range = dateRange(days);

  const [overviewResponse, queriesResponse, pagesResponse, queryPagesResponse] = await Promise.all([
    runQuery(config, accessToken, {
      ...range,
      rowLimit: 1,
      searchType: "web",
    }),
    runQuery(config, accessToken, {
      ...range,
      dimensions: ["query"],
      rowLimit: 10,
      searchType: "web",
    }),
    runQuery(config, accessToken, {
      ...range,
      dimensions: ["page"],
      rowLimit: 8,
      searchType: "web",
    }),
    runQuery(config, accessToken, {
      ...range,
      dimensions: ["query", "page"],
      rowLimit: 25,
      searchType: "web",
    }),
  ]);

  const queryPageMap = new Map<string, string>();
  for (const row of queryPagesResponse.rows || []) {
    const query = row.keys?.[0] || "";
    const page = row.keys?.[1] || "";
    if (query && page && !queryPageMap.has(query)) {
      queryPageMap.set(query, page);
    }
  }

  const overviewRow = overviewResponse.rows?.[0];

  return {
    windowDays: days,
    siteUrl: config.siteUrl,
    overview: {
      clicks: Math.round(Number(overviewRow?.clicks || 0)),
      impressions: Math.round(Number(overviewRow?.impressions || 0)),
      ctr: toFixedNumber(Number(overviewRow?.ctr || 0) * 100, 2),
      position: toFixedNumber(Number(overviewRow?.position || 0), 2),
    },
    topQueries: (queriesResponse.rows || []).map((row) => ({
      query: row.keys?.[0] || "(not set)",
      clicks: Math.round(Number(row.clicks || 0)),
      impressions: Math.round(Number(row.impressions || 0)),
      ctr: toFixedNumber(Number(row.ctr || 0) * 100, 2),
      position: toFixedNumber(Number(row.position || 0), 2),
      page: queryPageMap.get(row.keys?.[0] || "") || null,
    })),
    topPages: (pagesResponse.rows || []).map((row) => ({
      page: row.keys?.[0] || "/",
      clicks: Math.round(Number(row.clicks || 0)),
      impressions: Math.round(Number(row.impressions || 0)),
      ctr: toFixedNumber(Number(row.ctr || 0) * 100, 2),
      position: toFixedNumber(Number(row.position || 0), 2),
    })),
  };
}
