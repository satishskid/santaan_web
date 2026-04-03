#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import process from "node:process";

function loadEnvFile(filePath) {
  if (!filePath || !existsSync(filePath)) return;
  const content = readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function parseArgs(argv) {
  const args = {
    phone: "",
    agentId: "",
    contextJson: "",
    envFile: "",
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--phone") args.phone = argv[++i] || "";
    else if (arg === "--agent-id") args.agentId = argv[++i] || "";
    else if (arg === "--context-json") args.contextJson = argv[++i] || "";
    else if (arg === "--env-file") args.envFile = argv[++i] || "";
    else if (arg === "--dry-run") args.dryRun = true;
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.envFile) loadEnvFile(args.envFile);

  const apiKey = process.env.EDESY_API_KEY?.trim();
  const apiBase = (process.env.EDESY_API_BASE || "https://api.edesy.in").trim().replace(/\/$/, "");
  const phone = args.phone || process.env.EDESY_TEST_PHONE || "";
  const agentId = args.agentId || process.env.EDESY_AGENT_ID || "";

  if (!phone) {
    throw new Error("Missing phone. Pass --phone or set EDESY_TEST_PHONE");
  }
  if (!agentId) {
    throw new Error("Missing agent id. Pass --agent-id or set EDESY_AGENT_ID");
  }

  let context = undefined;
  if (args.contextJson) {
    context = JSON.parse(args.contextJson);
  }

  const payload = {
    phone_number: phone,
    agent_id: agentId,
    ...(context ? { context } : {}),
  };

  if (args.dryRun) {
    console.log(JSON.stringify({ apiBase, payload }, null, 2));
    return;
  }

  if (!apiKey) {
    throw new Error("Missing EDESY_API_KEY");
  }

  const response = await fetch(`${apiBase}/v1/calls/outbound`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  console.log(JSON.stringify({ ok: response.ok, status: response.status, body }, null, 2));

  if (!response.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
