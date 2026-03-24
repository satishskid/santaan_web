import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const clientId = process.env.ZOHO_CLIQ_CLIENT_ID;
const clientSecret = process.env.ZOHO_CLIQ_CLIENT_SECRET;
const refreshToken = process.env.ZOHO_CLIQ_REFRESH_TOKEN;
const companyId = process.env.ZOHO_CLIQ_COMPANY_ID;
const oauthBase = process.env.ZOHO_CLIQ_OAUTH_BASE || "https://accounts.zoho.com";
const apiBase = process.env.ZOHO_CLIQ_API_BASE || "https://cliq.zoho.com";
const channelUniqueName = process.env.ZOHO_CLIQ_CHANNEL_UNIQUE_NAME || process.argv[2];

if (!clientId || !clientSecret || !refreshToken || !companyId || !channelUniqueName) {
  console.error("❌ Missing Zoho Cliq OAuth env vars or channel name.");
  process.exit(1);
}

async function getAccessToken() {
  const url = new URL(`${oauthBase}/oauth/v2/token`);
  url.searchParams.set("refresh_token", refreshToken);
  url.searchParams.set("grant_type", "refresh_token");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("client_secret", clientSecret);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  const payload = await response.json();
  if (!response.ok || !payload?.access_token) {
    throw new Error(payload?.error_description || payload?.error || "Unable to fetch Zoho access token");
  }
  return payload.access_token;
}

async function run() {
  const accessToken = await getAccessToken();
  const channelUrl = `${apiBase}/company/${companyId}/api/v2/channelsbyname/${channelUniqueName}`;

  const response = await fetch(channelUrl, {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
  });
  const payload = await response.json();

  console.log(`Channel lookup status: ${response.status}`);
  console.log(`Channel keys: ${Object.keys(payload || {}).join(", ") || "none"}`);
  if (payload?.data) {
    const data = payload.data;
    const memberCount = Array.isArray(data?.members) ? data.members.length : null;
    console.log(`Channel name: ${data?.name || data?.unique_name || "unknown"}`);
    console.log(`Members detected: ${memberCount ?? "not provided"}`);
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Zoho Cliq channel test failed:", err.message || err);
    process.exit(1);
  });
