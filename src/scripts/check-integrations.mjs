import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const cwd = process.cwd();
const args = new Set(process.argv.slice(2));
const envFileArg = process.argv.find((arg) => arg.startsWith("--env-file="));
const envFile = envFileArg
  ? envFileArg.slice("--env-file=".length)
  : path.resolve(cwd, ".env.local");

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile, override: false });
}

const STATUS = {
  ok: "OK",
  partial: "PARTIAL",
  missing: "MISSING",
};

const GROUPS = [
  {
    name: "Auth",
    keys: ["NEXTAUTH_URL", "BETTER_AUTH_URL"],
    requiredOneOf: ["NEXTAUTH_SECRET", "AUTH_SECRET"],
    optional: ["BETTER_AUTH_API_KEY", "BETTER_AUTH_SECRET"],
  },
  {
    name: "Database",
    keys: ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN"],
  },
  {
    name: "Google OAuth",
    keys: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  },
  {
    name: "Google AI",
    keys: ["NEXT_PUBLIC_GOOGLE_AI_API_KEY", "GOOGLE_AI_API_KEY"],
  },
  {
    name: "Groq",
    keys: ["NEXT_PUBLIC_GROQ_API_KEY", "GROQ_API_KEY", "GROQ_MODEL"],
  },
  {
    name: "GA4",
    keys: ["GA4_PROPERTY_ID", "GOOGLE_ANALYTICS_PROPERTY_ID", "GOOGLE_ANALYTICS_ID", "GA4_CLIENT_EMAIL", "GA4_PRIVATE_KEY"],
  },
  {
    name: "Google Service Account",
    keys: ["GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY", "GOOGLE_SERVICE_ACCOUNT_JSON", "GA4_SERVICE_ACCOUNT_JSON"],
  },
  {
    name: "Search Console",
    requiredOneOf: ["SEARCH_CONSOLE_SITE_URL", "GOOGLE_SEARCH_CONSOLE_SITE_URL"],
    optionalOneOf: [
      "SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON",
      "GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON",
      "GA4_SERVICE_ACCOUNT_JSON",
      "GOOGLE_SERVICE_ACCOUNT_JSON",
    ],
    note: "Site URL plus any supported service-account JSON source is enough.",
  },
  {
    name: "Meta Ads",
    keys: ["META_ACCESS_TOKEN", "META_GRAPH_API_VERSION", "META_REPORTING_TIMEZONE"],
    requiredOneOf: ["META_AD_ACCOUNT_ID", "META_AD_ACCOUNT_IDS"],
    optional: ["META_APP_SECRET"],
  },
  {
    name: "Meta Conversions",
    keys: ["META_ACCESS_TOKEN"],
    requiredOneOf: ["META_CAPI_PIXEL_ID", "META_PIXEL_ID", "FACEBOOK_PIXEL_ID"],
    optional: ["META_APP_SECRET", "META_TEST_EVENT_CODE"],
  },
  {
    name: "SMTP",
    keys: ["EMAIL_FROM", "EMAIL_SMTP_HOST", "EMAIL_SMTP_PORT", "EMAIL_SMTP_SECURE", "EMAIL_SMTP_USER", "EMAIL_SMTP_PASSWORD"],
  },
  {
    name: "WhatsApp/Bhash",
    keys: ["BHASH_USER", "BHASH_SENDER", "BHASH_PASS", "WHATSAPP_VERIFY_TOKEN"],
    requiredOneOf: ["NEXT_PUBLIC_ADMIN_WA_PHONE", "next_public_admin_wa_phone"],
  },
  {
    name: "NeoDove",
    keys: ["NEODOVE_CUSTOM_INTEGRATION_URL", "NEODOVE_INTEGRATION_ID", "NEODOVE_WEBHOOK_SECRET"],
  },
  {
    name: "Bolna Voice",
    keys: [
      "BOLNA_MAIN_NUMBER",
      "BOLNA_TV_NUMBER",
      "BOLNA_MAIN_AGENT_NAME",
      "BOLNA_TV_AGENT_NAME",
      "BOLNA_EXECUTION_WEBHOOK_URL",
    ],
    optional: ["BOLNA_MAIN_AGENT_ID", "BOLNA_TV_AGENT_ID", "BOLNA_WEBHOOK_SECRET", "BOLNA_API_KEY"],
    note: "Agent IDs and API key are optional for config health, but required for API-based mapping and verification.",
  },
  {
    name: "Edesy Voice",
    keys: [
      "EDESY_MAIN_NUMBER",
      "EDESY_TV_NUMBER",
      "EDESY_MAIN_AGENT_NAME",
      "EDESY_TV_AGENT_NAME",
      "EDESY_EXECUTION_WEBHOOK_URL",
    ],
    optional: [
      "EDESY_MAIN_AGENT_ID",
      "EDESY_TV_AGENT_ID",
      "EDESY_WEBHOOK_SECRET",
      "EDESY_API_KEY",
      "EDESY_AGENT_ID",
      "EDESY_AGENT_NAME",
    ],
    note: "Webhook URL is required for managed execution routing. Agent IDs, API key, and webhook secret are optional for config health but required for API verification and signed webhook validation.",
  },
  {
    name: "Zoho Cliq",
    keys: ["ZOHO_CLIQ_CLIENT_ID", "ZOHO_CLIQ_CLIENT_SECRET", "ZOHO_CLIQ_REFRESH_TOKEN", "ZOHO_CLIQ_CHANNEL_UNIQUE_NAME", "ZOHO_CLIQ_COMPANY_ID", "ZOHO_CLIQ_CRON_SECRET"],
  },
  {
    name: "Cloudflare Content Engine",
    keys: ["CF_CONTENT_ENGINE_URL", "CF_CONTENT_ENGINE_TOKEN", "ENABLE_CF_CONTENT_ENGINE"],
  },
  {
    name: "Blog Sync",
    keys: ["BLOG_SYNC_SECRET"],
  },
  {
    name: "OpenRouter",
    keys: ["OPENROUTER_API_KEY"],
  },
];

function isSet(key) {
  return Boolean(String(process.env[key] || "").trim());
}

function presentList(keys = []) {
  return keys.filter(isSet);
}

function missingList(keys = []) {
  return keys.filter((key) => !isSet(key));
}

function oneOfStatus(keys = []) {
  const present = presentList(keys);
  return {
    present,
    missing: present.length > 0 ? [] : keys,
    ok: present.length > 0,
  };
}

function summarizeGroup(group) {
  const present = presentList(group.keys);
  const missing = missingList(group.keys);
  const optionalPresent = presentList(group.optional);
  const oneOf = group.requiredOneOf ? oneOfStatus(group.requiredOneOf) : null;
  const optionalOneOf = group.optionalOneOf ? oneOfStatus(group.optionalOneOf) : null;

  const requiredOk =
    missing.length === 0 &&
    (!oneOf || oneOf.ok) &&
    (!group.optionalOneOf || optionalOneOf.ok);

  const anyPresent =
    present.length > 0 ||
    optionalPresent.length > 0 ||
    Boolean(oneOf?.present.length) ||
    Boolean(optionalOneOf?.present.length);

  const status = requiredOk ? STATUS.ok : anyPresent ? STATUS.partial : STATUS.missing;

  return {
    status,
    present,
    missing,
    optionalPresent,
    oneOfPresent: oneOf?.present || [],
    oneOfMissing: oneOf?.missing || [],
    optionalOneOfPresent: optionalOneOf?.present || [],
    note: group.note || "",
  };
}

const results = GROUPS.map((group) => ({ group, summary: summarizeGroup(group) }));
const counts = results.reduce(
  (acc, item) => {
    const key = item.summary.status.toLowerCase();
    acc[key] += 1;
    return acc;
  },
  { ok: 0, partial: 0, missing: 0 }
);

console.log("Santaan Integration Health");
console.log(`Env source: ${fs.existsSync(envFile) ? envFile : "process.env only"}`);
console.log(`Summary: ${counts.ok} ok, ${counts.partial} partial, ${counts.missing} missing`);

for (const { group, summary } of results) {
  console.log(`\n[${summary.status}] ${group.name}`);
  if (summary.present.length) console.log(`required: ${summary.present.join(", ")}`);
  if (summary.oneOfPresent.length) console.log(`one-of: ${summary.oneOfPresent.join(", ")}`);
  if (summary.optionalOneOfPresent.length) console.log(`supported fallback: ${summary.optionalOneOfPresent.join(", ")}`);
  if (summary.optionalPresent.length) console.log(`optional: ${summary.optionalPresent.join(", ")}`);
  const missing = [...summary.missing, ...summary.oneOfMissing];
  if (missing.length) console.log(`missing: ${missing.join(", ")}`);
  if (summary.note) console.log(`note: ${summary.note}`);
}

if (args.has("--json")) {
  console.log(
    `\n${JSON.stringify(
      results.map(({ group, summary }) => ({
        name: group.name,
        status: summary.status.toLowerCase(),
        requiredPresent: summary.present,
        oneOfPresent: summary.oneOfPresent,
        optionalPresent: summary.optionalPresent,
        missing: [...summary.missing, ...summary.oneOfMissing],
      })),
      null,
      2
    )}`
  );
}
