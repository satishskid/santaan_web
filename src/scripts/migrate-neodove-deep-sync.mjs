import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const CONTACT_COLUMNS = [
  ["neodove_lead_id", "text"],
  ["neodove_campaign_id", "text"],
  ["neodove_stage_name", "text"],
  ["neodove_status_code", "text"],
  ["neodove_raw_status", "text"],
  ["neodove_mapped_status", "text"],
  ["neodove_disposition", "text"],
  ["neodove_dispose_reason", "text"],
  ["neodove_pipeline", "text"],
  ["neodove_owner_id", "text"],
  ["neodove_owner_name", "text"],
  ["neodove_call_connected", "integer"],
  ["neodove_call_duration_sec", "integer"],
  ["neodove_created_at", "text"],
  ["neodove_updated_at", "text"],
  ["neodove_last_event", "text"],
  ["neodove_last_event_at", "text"],
  ["neodove_last_sync_at", "text"],
  ["neodove_sync_status", "text DEFAULT 'pending'"],
];

async function existingColumns(client, tableName) {
  const result = await client.execute(`PRAGMA table_info(${tableName});`);
  return new Set((result.rows || []).map((row) => String(row.name)));
}

async function migrateNeoDoveSync() {
  const url = process.env.TURSO_DATABASE_URL || "file:santaan.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url,
    authToken: authToken || undefined,
  });

  try {
    const existing = await existingColumns(client, "contacts");

    for (const [name, definition] of CONTACT_COLUMNS) {
      if (existing.has(name)) continue;
      await client.execute(`ALTER TABLE contacts ADD COLUMN ${name} ${definition};`);
      console.log(`Added contacts.${name}`);
    }

    await client.execute(`
      CREATE TABLE IF NOT EXISTS neodove_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_key TEXT NOT NULL,
        lead_id TEXT,
        contact_id INTEGER,
        event_name TEXT NOT NULL,
        mobile TEXT,
        email TEXT,
        campaign_id TEXT,
        campaign TEXT,
        stage_name TEXT,
        status_code TEXT,
        raw_status TEXT,
        mapped_status TEXT,
        disposition TEXT,
        dispose_reason TEXT,
        pipeline TEXT,
        center TEXT,
        assigned_to_id TEXT,
        assigned_to TEXT,
        call_connected INTEGER,
        call_duration_sec INTEGER,
        follow_up_at TEXT,
        created_at_source TEXT,
        updated_at_source TEXT,
        notes TEXT,
        raw_payload TEXT NOT NULL,
        received_at TEXT DEFAULT CURRENT_TIMESTAMP,
        processed_at TEXT,
        process_status TEXT DEFAULT 'received',
        is_duplicate INTEGER DEFAULT 0,
        duplicate_of_event_key TEXT,
        error_message TEXT
      );
    `);

    await client.execute(`CREATE INDEX IF NOT EXISTS idx_neodove_events_event_key ON neodove_events(event_key);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_neodove_events_lead_id ON neodove_events(lead_id);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_neodove_events_contact_id ON neodove_events(contact_id);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_neodove_events_received_at ON neodove_events(received_at);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_contacts_neodove_lead_id ON contacts(neodove_lead_id);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_contacts_neodove_sync_status ON contacts(neodove_sync_status);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_contacts_neodove_last_sync_at ON contacts(neodove_last_sync_at);`);

    console.log("NeoDove deep sync migration applied successfully.");
  } finally {
    client.close();
  }
}

migrateNeoDoveSync().catch((error) => {
  console.error("Failed to migrate NeoDove deep sync schema:", error);
  process.exit(1);
});
