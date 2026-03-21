import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function tableExists(client, tableName) {
  const result = await client.execute(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}' LIMIT 1;`
  );
  return Boolean(result.rows?.length);
}

async function migrateMetaConversionEvents() {
  const url = process.env.TURSO_DATABASE_URL || "file:santaan.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url,
    authToken: authToken || undefined,
  });

  try {
    const exists = await tableExists(client, "meta_conversion_events");
    if (exists) {
      console.log("meta_conversion_events already exists. No changes applied.");
      return;
    }

    await client.execute(`
      CREATE TABLE IF NOT EXISTS meta_conversion_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_key TEXT NOT NULL,
        contact_id INTEGER,
        event_name TEXT NOT NULL,
        signal_type TEXT NOT NULL,
        crm_status TEXT,
        center TEXT,
        source_channel TEXT,
        action_source TEXT,
        pixel_id TEXT,
        lead_source TEXT,
        utm_campaign TEXT,
        event_time TEXT NOT NULL,
        email_hash TEXT,
        phone_hash TEXT,
        external_id_hash TEXT,
        payload TEXT NOT NULL,
        response_payload TEXT,
        process_status TEXT DEFAULT 'received',
        retry_count INTEGER DEFAULT 0,
        processed_at TEXT,
        received_at TEXT DEFAULT CURRENT_TIMESTAMP,
        error_message TEXT
      );
    `);

    await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS meta_conversion_events_event_key_unique ON meta_conversion_events(event_key);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS meta_conversion_events_contact_id_idx ON meta_conversion_events(contact_id);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS meta_conversion_events_process_status_idx ON meta_conversion_events(process_status);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS meta_conversion_events_received_at_idx ON meta_conversion_events(received_at);`);

    console.log("Meta conversion events migration applied successfully.");
  } finally {
    client.close();
  }
}

migrateMetaConversionEvents().catch((error) => {
  console.error("Failed to migrate Meta conversion events schema:", error);
  process.exit(1);
});
