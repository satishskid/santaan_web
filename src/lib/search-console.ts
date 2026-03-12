import { createSign } from "node:crypto";

const OAUTH_AUDIENCE = "https://oauth2.googleapis.com/token";
const OAUTH_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

export interface SearchConsoleConfig {
  siteUrl: string;
  clientEmail: string;
  privateKey: string;
}

interface SearchConsoleResponseRow {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}

interface SearchConsoleQueryResponse {
  rows?: SearchConsoleResponseRow[];
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

export function readSearchConsoleConfig(): SearchConsoleConfig | null {
  const siteUrl =
    process.env.SEARCH_CONSOLE_SITE_URL?.trim() ||
    process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL?.trim() ||
    "";

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

  if (!siteUrl || !clientEmail || !privateKey) return null;
  return { siteUrl, clientEmail, privateKey };
}

function createJwtAssertion(config: SearchConsoleConfig) {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT",
  };
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

async function querySearchConsole(
  config: SearchConsoleConfig,
  accessToken: string,
  body: Record<string, unknown>
) {
  const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(config.siteUrl)}/searchAnalytics/query`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = (await response.json()) as SearchConsoleQueryResponse & { error?: { message?: string } };
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Search Console request failed with status ${response.status}`);
  }
  return payload;
}

export interface SearchConsoleSnapshot {
  windowDays: number;
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
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
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 1);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - Math.max(1, days - 1));

  const formatDate = (value: Date) => value.toISOString().slice(0, 10);

  const [topQueries, topPages] = await Promise.all([
    querySearchConsole(config, accessToken, {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: ["query"],
      rowLimit: 10,
      startRow: 0,
    }),
    querySearchConsole(config, accessToken, {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: ["page"],
      rowLimit: 10,
      startRow: 0,
    }),
  ]);

  return {
    windowDays: days,
    topQueries: (topQueries.rows || []).map((row) => ({
      query: row.keys?.[0] || "",
      clicks: Number(row.clicks || 0),
      impressions: Number(row.impressions || 0),
      ctr: Number(row.ctr || 0),
      position: Number(row.position || 0),
    })),
    topPages: (topPages.rows || []).map((row) => ({
      page: row.keys?.[0] || "",
      clicks: Number(row.clicks || 0),
      impressions: Number(row.impressions || 0),
      ctr: Number(row.ctr || 0),
      position: Number(row.position || 0),
    })),
  };
}
