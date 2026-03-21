type ZohoCliqToken = {
  accessToken: string;
  expiresAt: number;
};

export type ZohoCliqConfig = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  channelUniqueName: string;
  companyId: string;
  oauthBaseUrl: string;
  apiBaseUrl: string;
  channelEndpoint?: string;
};

let cachedToken: ZohoCliqToken | null = null;

function trim(value?: string | null) {
  return String(value || "").trim();
}

export function readZohoCliqConfig(): ZohoCliqConfig | null {
  const clientId = trim(process.env.ZOHO_CLIQ_CLIENT_ID);
  const clientSecret = trim(process.env.ZOHO_CLIQ_CLIENT_SECRET);
  const refreshToken = trim(process.env.ZOHO_CLIQ_REFRESH_TOKEN);
  const channelUniqueName = trim(process.env.ZOHO_CLIQ_CHANNEL_UNIQUE_NAME || process.env.ZOHO_CLIQ_CHANNEL);
  const companyId = trim(process.env.ZOHO_CLIQ_COMPANY_ID);
  const oauthBaseUrl = trim(process.env.ZOHO_CLIQ_OAUTH_BASE || "https://accounts.zoho.com");
  const apiBaseUrl = trim(process.env.ZOHO_CLIQ_API_BASE || "https://cliq.zoho.com");
  const channelEndpoint = trim(process.env.ZOHO_CLIQ_CHANNEL_ENDPOINT);

  if (!clientId || !clientSecret || !refreshToken) return null;
  if (!channelEndpoint && (!companyId || !channelUniqueName)) return null;

  return {
    clientId,
    clientSecret,
    refreshToken,
    channelUniqueName,
    companyId,
    oauthBaseUrl,
    apiBaseUrl,
    channelEndpoint: channelEndpoint || undefined,
  };
}

function resolveChannelEndpoint(config: ZohoCliqConfig) {
  if (config.channelEndpoint) return config.channelEndpoint;
  return `${config.apiBaseUrl}/company/${config.companyId}/api/v2/channelsbyname/${config.channelUniqueName}/message`;
}

async function fetchZohoCliqAccessToken(config: ZohoCliqConfig): Promise<ZohoCliqToken> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken;
  }

  const url = new URL(`${config.oauthBaseUrl}/oauth/v2/token`);
  url.searchParams.set("refresh_token", config.refreshToken);
  url.searchParams.set("grant_type", "refresh_token");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("client_secret", config.clientSecret);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !payload?.access_token) {
    const message = payload?.error_description || payload?.error || "Unable to fetch Zoho access token";
    throw new Error(message);
  }

  const expiresInMs = Number(payload.expires_in || 3600) * 1000;
  cachedToken = {
    accessToken: payload.access_token,
    expiresAt: now + expiresInMs,
  };
  return cachedToken;
}

export async function postZohoCliqMessage(message: string) {
  const config = readZohoCliqConfig();
  if (!config) {
    return { ok: false, error: "Zoho Cliq credentials are missing." } as const;
  }
  const token = await fetchZohoCliqAccessToken(config);
  const endpoint = resolveChannelEndpoint(config);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Zoho-oauthtoken ${token.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: message, sync_message: true }),
  });

  const payload = (await response.json()) as { message_id?: string; error?: string };
  if (!response.ok) {
    return { ok: false, error: payload?.error || "Failed to post message to Zoho Cliq." } as const;
  }

  return { ok: true, messageId: payload?.message_id || null } as const;
}
