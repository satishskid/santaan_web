import Database from "better-sqlite3";

const sqlite = new Database("santaan.db");

const now = new Date().toISOString();

const VOICE_OPS_BASELINE = {
  VOICE_AGENT_MAIN_NUMBER: "+918065481598",
  VOICE_AGENT_TV_NUMBER: "+918065481542",
  VOICE_AGENT_BACKUP_NUMBER: "+918065481541",
  VOICE_AGENT_MAIN_BOLNA_AGENT_ID: "5a4ada1f-b861-481a-9b84-e8521e1a24bc",
  VOICE_AGENT_TV_BOLNA_AGENT_ID: "0a5bad62-43dd-4cb0-9aae-24068c1cbea7",
  VOICE_AGENT_MAIN_BOLNA_AGENT_NAME: "Santaan Main Inbound",
  VOICE_AGENT_TV_BOLNA_AGENT_NAME: "Santaan TV Inbound",
  VOICE_AGENT_ROLLOUT_STATUS: "linked_pending_live_calls",
  VOICE_AGENT_MAIN_PROMPT_VERSION: "main-v1",
  VOICE_AGENT_TV_PROMPT_VERSION: "tv-v1",
  VOICE_AGENT_OPEN_RISKS:
    "Exact Bhash post-call template identifier still pending from support. Real-call validation still pending on main and TV lines.",
  VOICE_AGENT_CHANGE_NOTES:
    "Live Bolna API verification on 2026-04-03 confirmed main=+918065481598 -> Santaan Main Inbound and tv=+918065481542 -> Santaan TV Inbound. Backup remains +918065481541.",
  VOICE_AGENT_LAST_UPDATED_BY: "seed_voice_ops_settings_script",
  VOICE_AGENT_LAST_UPDATED_AT: now,
};

const upsert = sqlite.prepare(`
  INSERT INTO settings (key, value, updated_at)
  VALUES (?, ?, ?)
  ON CONFLICT(key) DO UPDATE SET
    value = excluded.value,
    updated_at = excluded.updated_at
`);

try {
  const tx = sqlite.transaction((entries) => {
    for (const [key, value] of entries) {
      upsert.run(key, value, now);
    }
  });

  tx(Object.entries(VOICE_OPS_BASELINE));

  console.log("Voice Ops baseline seeded into santaan.db");
  console.log(JSON.stringify(VOICE_OPS_BASELINE, null, 2));
} finally {
  sqlite.close();
}
