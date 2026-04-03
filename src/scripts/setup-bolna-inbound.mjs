import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const CLEAN_PHONE = /[^0-9]/g;

const args = new Set(process.argv.slice(2));
const envFileArg = process.argv.find((arg) => arg.startsWith("--env-file="));
const envFile = envFileArg
  ? envFileArg.slice("--env-file=".length)
  : path.resolve(process.cwd(), ".env.local");

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile, override: false });
}

const APPLY = args.has("--apply");
const FAIL_ON_DRIFT = args.has("--fail-on-drift");
const JSON_OUTPUT = args.has("--json");
const API_BASE = (process.env.BOLNA_API_BASE || "https://api.bolna.ai").trim().replace(/\/+$/, "");
const API_KEY = String(process.env.BOLNA_API_KEY || "").trim();

if (args.has("--help")) {
  console.log(`Usage:
  npm run voice:bolna:verify
  npm run voice:bolna:setup
  node src/scripts/setup-bolna-inbound.mjs --env-file=/path/to/env

Flags:
  --apply          Apply inbound setup via Bolna API
  --fail-on-drift  Exit non-zero when current mapping differs from target mapping
  --json           Print a machine-readable summary
  --env-file=...   Load env vars from a specific dotenv file
  --help           Show this help
`);
  process.exit(0);
}

function normalizePhone(value) {
  const digits = String(value || "").replace(CLEAN_PHONE, "");
  if (!digits) return "";
  if (digits.length > 10 && digits.startsWith("91")) return digits.slice(-10);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits.slice(-10);
}

function deepFindByKey(value, matcher) {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = deepFindByKey(entry, matcher);
      if (found !== undefined) return found;
    }
    return undefined;
  }

  if (!value || typeof value !== "object") {
    return undefined;
  }

  for (const [key, entry] of Object.entries(value)) {
    if (matcher(key, entry)) {
      return entry;
    }

    const found = deepFindByKey(entry, matcher);
    if (found !== undefined) return found;
  }

  return undefined;
}

function requiredEnv(key) {
  const value = String(process.env[key] || "").trim();
  if (!value) {
    throw new Error(`Missing required env: ${key}`);
  }
  return value;
}

async function bolnaRequest(method, endpoint, body) {
  if (!API_KEY) {
    throw new Error("Missing required env: BOLNA_API_KEY");
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${method} ${endpoint} failed with ${response.status}: ${text}`);
  }

  return data;
}

async function loadAgents() {
  const data = await bolnaRequest("GET", "/v2/agent/all");
  return Array.isArray(data) ? data : [];
}

async function loadAgentDetails(agentId) {
  return bolnaRequest("GET", `/v2/agent/${agentId}`);
}

async function loadPhoneNumbers() {
  const data = await bolnaRequest("GET", "/phone-numbers/all");
  return Array.isArray(data) ? data : [];
}

function resolveAgent(agents, options) {
  const explicitId = String(process.env[options.idKey] || "").trim();
  const explicitName = String(process.env[options.nameKey] || "").trim();

  if (explicitId) {
    const byId = agents.find((agent) => String(agent.id || "").trim() === explicitId);
    if (!byId) {
      throw new Error(`Configured ${options.idKey}=${explicitId} was not found in Bolna agent list`);
    }
    return byId;
  }

  if (explicitName) {
    const normalized = explicitName.toLowerCase();
    const byName = agents.find((agent) => String(agent.agent_name || "").trim().toLowerCase() === normalized);
    if (!byName) {
      throw new Error(`Configured ${options.nameKey}=${explicitName} was not found in Bolna agent list`);
    }
    return byName;
  }

  throw new Error(`Set either ${options.idKey} or ${options.nameKey}`);
}

function resolvePhoneNumber(phoneNumbers, desiredNumber, label) {
  const normalizedTarget = normalizePhone(desiredNumber);
  const match = phoneNumbers.find((phone) => normalizePhone(phone.phone_number) === normalizedTarget);

  if (!match) {
    throw new Error(`${label} number ${desiredNumber} was not found in Bolna phone number inventory`);
  }

  return match;
}

function summarizeMapping({ label, targetAgent, phoneNumber, agentsById, expectedWebhookUrl, agentDetails }) {
  const currentAgentId = String(phoneNumber.agent_id || "").trim();
  const currentAgent = currentAgentId ? agentsById.get(currentAgentId) : null;
  const webhookValue =
    deepFindByKey(agentDetails, (key, value) => /webhook(_url)?/i.test(key) && typeof value === "string" && value.trim()) || "";

  const webhookMatches = expectedWebhookUrl ? String(webhookValue).trim() === expectedWebhookUrl.trim() : null;
  const alreadyMapped = currentAgentId === String(targetAgent.id || "").trim();

  return {
    label,
    targetAgentId: String(targetAgent.id || ""),
    targetAgentName: String(targetAgent.agent_name || ""),
    phoneNumberId: String(phoneNumber.id || ""),
    phoneNumber: String(phoneNumber.phone_number || ""),
    telephonyProvider: String(phoneNumber.telephony_provider || ""),
    currentAgentId,
    currentAgentName: currentAgent ? String(currentAgent.agent_name || "") : "",
    alreadyMapped,
    webhookUrl: String(webhookValue || ""),
    webhookMatches,
  };
}

function printHumanSummary(summary) {
  console.log(`\n[${summary.label}] ${summary.phoneNumber}`);
  console.log(`target agent: ${summary.targetAgentName} (${summary.targetAgentId})`);
  console.log(
    `current agent: ${summary.currentAgentName || "unassigned"}${summary.currentAgentId ? ` (${summary.currentAgentId})` : ""}`
  );
  console.log(`phone number id: ${summary.phoneNumberId}`);
  console.log(`telephony provider: ${summary.telephonyProvider || "unknown"}`);
  console.log(`mapping status: ${summary.alreadyMapped ? "OK" : "DRIFT"}`);
  if (summary.webhookUrl) {
    console.log(`agent webhook: ${summary.webhookUrl}`);
    if (summary.webhookMatches !== null) {
      console.log(`webhook status: ${summary.webhookMatches ? "OK" : "CHECK"}`);
    }
  }
}

async function setupInbound(summary) {
  await bolnaRequest("POST", "/inbound/setup", {
    agent_id: summary.targetAgentId,
    phone_number_id: summary.phoneNumberId,
  });
}

async function main() {
  const desiredMainNumber = requiredEnv("BOLNA_MAIN_NUMBER");
  const desiredTvNumber = requiredEnv("BOLNA_TV_NUMBER");
  const expectedWebhookUrl = String(process.env.BOLNA_EXECUTION_WEBHOOK_URL || "").trim();

  const [agents, phoneNumbers] = await Promise.all([loadAgents(), loadPhoneNumbers()]);
  const agentsById = new Map(agents.map((agent) => [String(agent.id || "").trim(), agent]));

  const mainAgent = resolveAgent(agents, {
    idKey: "BOLNA_MAIN_AGENT_ID",
    nameKey: "BOLNA_MAIN_AGENT_NAME",
  });
  const tvAgent = resolveAgent(agents, {
    idKey: "BOLNA_TV_AGENT_ID",
    nameKey: "BOLNA_TV_AGENT_NAME",
  });

  const mainPhone = resolvePhoneNumber(phoneNumbers, desiredMainNumber, "main");
  const tvPhone = resolvePhoneNumber(phoneNumbers, desiredTvNumber, "tv");

  const [mainAgentDetails, tvAgentDetails] = await Promise.all([
    loadAgentDetails(String(mainAgent.id)),
    loadAgentDetails(String(tvAgent.id)),
  ]);

  const summaries = [
    summarizeMapping({
      label: "main",
      targetAgent: mainAgent,
      phoneNumber: mainPhone,
      agentsById,
      expectedWebhookUrl,
      agentDetails: mainAgentDetails,
    }),
    summarizeMapping({
      label: "tv",
      targetAgent: tvAgent,
      phoneNumber: tvPhone,
      agentsById,
      expectedWebhookUrl,
      agentDetails: tvAgentDetails,
    }),
  ];

  if (JSON_OUTPUT) {
    console.log(
      JSON.stringify(
        {
          mode: APPLY ? "apply" : "verify",
          apiBase: API_BASE,
          expectedWebhookUrl,
          summaries,
        },
        null,
        2
      )
    );
  } else {
    console.log(`Bolna inbound ${APPLY ? "setup" : "verification"}`);
    console.log(`API base: ${API_BASE}`);
    if (fs.existsSync(envFile)) {
      console.log(`env source: ${envFile}`);
    }
    if (expectedWebhookUrl) {
      console.log(`expected webhook: ${expectedWebhookUrl}`);
    }
    summaries.forEach(printHumanSummary);
  }

  const drifted = summaries.filter((summary) => !summary.alreadyMapped);

  if (APPLY && drifted.length) {
    for (const summary of drifted) {
      await setupInbound(summary);
    }

    if (!JSON_OUTPUT) {
      console.log("\nBolna inbound setup applied. Re-run verification to confirm final state.");
    }
  } else if (APPLY && !JSON_OUTPUT) {
    console.log("\nNo mapping changes were needed.");
  }

  const webhookMismatch = summaries.some((summary) => summary.webhookMatches === false);

  if ((FAIL_ON_DRIFT && drifted.length) || webhookMismatch) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`Bolna inbound setup failed: ${error.message}`);
  process.exit(1);
});
