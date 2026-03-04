import { createSign } from "node:crypto";

const OAUTH_AUDIENCE = "https://oauth2.googleapis.com/token";
const OAUTH_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

export interface Ga4ServiceAccountConfig {
  propertyId: string;
  clientEmail: string;
  privateKey: string;
}

interface Ga4RunReportResponse {
  rows?: Array<{
    dimensionValues?: Array<{ value?: string }>;
    metricValues?: Array<{ value?: string }>;
  }>;
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

export function readGa4Config(): Ga4ServiceAccountConfig | null {
  const propertyId =
    process.env.GA4_PROPERTY_ID?.trim() ||
    process.env.GOOGLE_ANALYTICS_PROPERTY_ID?.trim() ||
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

  if (!propertyId || !clientEmail || !privateKey) return null;
  return { propertyId, clientEmail, privateKey };
}

function createJwtAssertion(config: Ga4ServiceAccountConfig) {
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

async function fetchAccessToken(config: Ga4ServiceAccountConfig) {
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
    throw new Error(payload.error_description || "Failed to fetch GA4 access token");
  }
  return payload.access_token;
}

async function runReport(
  config: Ga4ServiceAccountConfig,
  accessToken: string,
  reportBody: Record<string, unknown>
) {
  const endpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${config.propertyId}:runReport`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reportBody),
    cache: "no-store",
  });

  const payload = (await response.json()) as Ga4RunReportResponse & { error?: { message?: string } };
  if (!response.ok) {
    const reason = payload?.error?.message || `GA4 API request failed with status ${response.status}`;
    throw new Error(reason);
  }
  return payload;
}

function metricValue(
  row: { metricValues?: Array<{ value?: string }> },
  index: number
) {
  const raw = row.metricValues?.[index]?.value;
  const parsed = Number(raw || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function dimensionValue(
  row: { dimensionValues?: Array<{ value?: string }> },
  index: number
) {
  return row.dimensionValues?.[index]?.value || "";
}

export interface Ga4DashboardSnapshot {
  windowDays: number;
  overview: {
    activeUsers: number;
    sessions: number;
    newUsers: number;
    pageViews: number;
    eventCount: number;
  };
  topSources: Array<{
    sourceMedium: string;
    sessions: number;
    activeUsers: number;
    eventCount: number;
  }>;
  topLandingPages: Array<{
    path: string;
    sessions: number;
    activeUsers: number;
  }>;
}

export async function fetchGa4DashboardSnapshot(
  config: Ga4ServiceAccountConfig,
  days: number
): Promise<Ga4DashboardSnapshot> {
  const accessToken = await fetchAccessToken(config);
  const dateRange = { startDate: `${days}daysAgo`, endDate: "today" };

  const [overview, topSources, topLandingPages] = await Promise.all([
    runReport(config, accessToken, {
      dateRanges: [dateRange],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "newUsers" },
        { name: "screenPageViews" },
        { name: "eventCount" },
      ],
      limit: 1,
    }),
    runReport(config, accessToken, {
      dateRanges: [dateRange],
      dimensions: [{ name: "sessionSourceMedium" }],
      metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "eventCount" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 8,
    }),
    runReport(config, accessToken, {
      dateRanges: [dateRange],
      dimensions: [{ name: "landingPagePlusQueryString" }],
      metrics: [{ name: "sessions" }, { name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      dimensionFilter: {
        filter: {
          fieldName: "landingPagePlusQueryString",
          stringFilter: { matchType: "BEGINS_WITH", value: "/" },
        },
      },
      limit: 8,
    }),
  ]);

  const overviewRow = overview.rows?.[0];

  return {
    windowDays: days,
    overview: {
      activeUsers: overviewRow ? metricValue(overviewRow, 0) : 0,
      sessions: overviewRow ? metricValue(overviewRow, 1) : 0,
      newUsers: overviewRow ? metricValue(overviewRow, 2) : 0,
      pageViews: overviewRow ? metricValue(overviewRow, 3) : 0,
      eventCount: overviewRow ? metricValue(overviewRow, 4) : 0,
    },
    topSources: (topSources.rows || []).map((row) => ({
      sourceMedium: dimensionValue(row, 0) || "(not set)",
      sessions: metricValue(row, 0),
      activeUsers: metricValue(row, 1),
      eventCount: metricValue(row, 2),
    })),
    topLandingPages: (topLandingPages.rows || []).map((row) => ({
      path: dimensionValue(row, 0) || "/",
      sessions: metricValue(row, 0),
      activeUsers: metricValue(row, 1),
    })),
  };
}
