import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const cwd = process.cwd();
const jsonMode = process.argv.includes("--json");
const envFileArg = process.argv.find((arg) => arg.startsWith("--dotenv-file="));
const envFile = envFileArg
  ? envFileArg.slice("--dotenv-file=".length)
  : path.resolve(cwd, ".env.local");

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile, override: false });
}

async function main() {
  const { loadCrmHealthSnapshot } = await import("@/lib/crm-health");
  const snapshot = await loadCrmHealthSnapshot();

  if (jsonMode) {
    console.log(JSON.stringify(snapshot, null, 2));
    return;
  }

  console.log("Santaan CRM Health");
  console.log(`Env source: ${fs.existsSync(envFile) ? envFile : "process.env only"}`);
  console.log(`Status: ${snapshot.status.toUpperCase()}`);
  console.log(`Generated: ${snapshot.generatedAt}`);
  console.log(
    `Alerts: ${snapshot.summary.openAlerts} open (${snapshot.summary.criticalAlerts} critical, ${snapshot.summary.warningAlerts} warning)`
  );
  console.log(
    `Pipeline: ${snapshot.summary.pendingOlderThan24h} stale pending, ${snapshot.summary.hotLeadSlaBreaches} hotline SLA breaches, ${snapshot.summary.overdueFollowUps} overdue follow-ups`
  );
  console.log(
    `Attribution: ${snapshot.summary.attributionCoverage7d.toFixed(1)}% over last 7 days`
  );
  console.log(
    `Integrations: ${snapshot.summary.integrationsReady}/${snapshot.summary.integrationsTotal} configured, NeoDove errors ${snapshot.summary.neodoveErrors24h}, Meta errors ${snapshot.summary.metaErrors24h}`
  );
  console.log(
    `Ops: ${snapshot.summary.opsCompletionRate.toFixed(1)}% completion, ${snapshot.summary.blockedOpsTasks} blocked, ${snapshot.summary.missingOpsSubmissions} missing submissions`
  );

  if (snapshot.alerts.length) {
    console.log("\nTop Alerts");
    for (const alert of snapshot.alerts.slice(0, 8)) {
      console.log(`- [${alert.severity.toUpperCase()}] ${alert.title}`);
      console.log(`  ${alert.detail}`);
      console.log(`  Owner: ${alert.owner}`);
      console.log(`  Codex check: ${alert.actionHint}`);
    }
  } else {
    console.log("\nNo active CRM health alerts.");
  }
}

main().catch((error) => {
  console.error("Failed to load CRM health snapshot:", error);
  process.exit(1);
});
