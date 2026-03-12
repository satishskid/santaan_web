import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL || "file:santaan.db";
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

const client = createClient({ url, authToken });

async function run() {
  await client.batch(
    [
      `
        CREATE TABLE IF NOT EXISTS neodove_campaign_mappings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          neodove_campaign_id TEXT NOT NULL,
          neodove_campaign_name TEXT NOT NULL,
          source_bucket TEXT NOT NULL,
          center TEXT DEFAULT 'network',
          utm_campaign TEXT NOT NULL,
          owner TEXT,
          is_active INTEGER DEFAULT 1,
          notes TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `,
      `
        CREATE UNIQUE INDEX IF NOT EXISTS neodove_campaign_mappings_campaign_id_unique
        ON neodove_campaign_mappings (neodove_campaign_id);
      `,
      `
        CREATE TABLE IF NOT EXISTS neodove_event_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_name TEXT NOT NULL,
          event_timestamp TEXT NOT NULL,
          lead_id TEXT,
          mobile TEXT,
          email TEXT,
          name TEXT,
          campaign_id TEXT,
          campaign_name TEXT,
          stage_name TEXT,
          status_code TEXT,
          disposition TEXT,
          dispose_reason TEXT,
          pipeline TEXT,
          center TEXT,
          assigned_to_id TEXT,
          assigned_to TEXT,
          call_connected INTEGER,
          call_duration_sec INTEGER,
          follow_up_at TEXT,
          matched_mapping_id INTEGER,
          derived_source_bucket TEXT,
          derived_center TEXT,
          derived_utm_campaign TEXT,
          processing_status TEXT DEFAULT 'shadow_logged',
          processing_note TEXT,
          raw_payload TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `,
      `
        CREATE INDEX IF NOT EXISTS neodove_event_logs_event_timestamp_idx
        ON neodove_event_logs (event_timestamp);
      `,
      `
        CREATE INDEX IF NOT EXISTS neodove_event_logs_campaign_id_idx
        ON neodove_event_logs (campaign_id);
      `,
      `
        CREATE INDEX IF NOT EXISTS neodove_event_logs_processing_status_idx
        ON neodove_event_logs (processing_status);
      `,
    ],
    "write"
  );

  console.log("NeoDove shadow migration applied successfully.");
}

run()
  .catch((error) => {
    console.error("Failed to apply NeoDove shadow migration:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.close();
  });
