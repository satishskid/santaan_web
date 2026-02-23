import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function migrateOpsWorkboardTable() {
  const url = process.env.TURSO_DATABASE_URL || "file:santaan.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url,
    authToken: authToken || undefined,
  });

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS ops_task_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_date TEXT NOT NULL,
        profile_key TEXT NOT NULL,
        center TEXT DEFAULT 'network',
        task_code TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        note TEXT,
        updated_by_email TEXT,
        updated_by_name TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_ops_task_unique_day_task
      ON ops_task_updates(task_date, profile_key, center, task_code);
    `);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_ops_task_date ON ops_task_updates(task_date);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_ops_task_profile ON ops_task_updates(profile_key);`);

    console.log("ops_task_updates migration applied successfully.");
  } finally {
    client.close();
  }
}

migrateOpsWorkboardTable().catch((error) => {
  console.error("Failed to migrate ops_task_updates:", error);
  process.exit(1);
});
