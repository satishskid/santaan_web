import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function migrateSpendTable() {
  const url = process.env.TURSO_DATABASE_URL || "file:santaan.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url,
    authToken: authToken || undefined,
  });

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS campaign_spend (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        spend_date TEXT NOT NULL,
        channel TEXT NOT NULL,
        utm_campaign TEXT NOT NULL,
        center TEXT DEFAULT 'network',
        asset TEXT,
        amount REAL NOT NULL,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.execute(`CREATE INDEX IF NOT EXISTS idx_campaign_spend_date ON campaign_spend(spend_date);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_campaign_spend_campaign ON campaign_spend(utm_campaign);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_campaign_spend_channel ON campaign_spend(channel);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_campaign_spend_center ON campaign_spend(center);`);

    console.log("campaign_spend migration applied successfully.");
  } finally {
    client.close();
  }
}

migrateSpendTable().catch((error) => {
  console.error("Failed to migrate campaign_spend:", error);
  process.exit(1);
});
