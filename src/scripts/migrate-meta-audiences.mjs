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

async function migrateMetaAudiences() {
  const url = process.env.TURSO_DATABASE_URL || "file:santaan.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url,
    authToken: authToken || undefined,
  });

  try {
    const audienceExists = await tableExists(client, "meta_audiences");
    const syncExists = await tableExists(client, "meta_audience_syncs");
    if (audienceExists && syncExists) {
      console.log("meta_audiences tables already exist. No changes applied.");
      return;
    }

    await client.execute(`
      CREATE TABLE IF NOT EXISTS meta_audiences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id TEXT NOT NULL,
        audience_key TEXT NOT NULL,
        audience_id TEXT NOT NULL,
        name TEXT NOT NULL,
        last_synced_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS meta_audiences_account_key_unique ON meta_audiences(account_id, audience_key);`);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS meta_audience_syncs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id TEXT NOT NULL,
        audience_key TEXT NOT NULL,
        audience_id TEXT,
        audience_name TEXT,
        contact_count INTEGER DEFAULT 0,
        batch_count INTEGER DEFAULT 0,
        process_status TEXT DEFAULT 'received',
        response_payload TEXT,
        error_message TEXT,
        processed_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.execute(`CREATE INDEX IF NOT EXISTS meta_audience_syncs_account_idx ON meta_audience_syncs(account_id);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS meta_audience_syncs_status_idx ON meta_audience_syncs(process_status);`);

    console.log("Meta audiences migration applied successfully.");
  } finally {
    client.close();
  }
}

migrateMetaAudiences().catch((error) => {
  console.error("Failed to migrate Meta audiences schema:", error);
  process.exit(1);
});
