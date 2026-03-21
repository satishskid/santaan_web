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

async function migrateMetaLaunchDrafts() {
  const url = process.env.TURSO_DATABASE_URL || "file:santaan.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url,
    authToken: authToken || undefined,
  });

  try {
    const exists = await tableExists(client, "meta_launch_drafts");
    if (exists) {
      console.log("meta_launch_drafts already exists. No changes applied.");
      return;
    }

    await client.execute(`
      CREATE TABLE IF NOT EXISTS meta_launch_drafts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        channel TEXT DEFAULT 'meta',
        account_id TEXT NOT NULL,
        center TEXT DEFAULT 'network',
        objective TEXT DEFAULT 'OUTCOME_LEADS',
        campaign_name TEXT NOT NULL,
        adset_name TEXT,
        ad_name TEXT,
        status TEXT DEFAULT 'draft',
        priority TEXT DEFAULT 'medium',
        audience_summary TEXT,
        geo_targets TEXT,
        placements TEXT,
        budget_type TEXT DEFAULT 'daily',
        budget_inr REAL DEFAULT 0,
        budget_notes TEXT,
        utm_campaign TEXT,
        landing_url TEXT,
        content_angle TEXT,
        hook TEXT,
        primary_text TEXT,
        headline TEXT,
        description TEXT,
        cta TEXT,
        creative_format TEXT,
        creative_brief TEXT,
        content_keywords TEXT,
        content_owner_name TEXT,
        performance_owner_name TEXT,
        requested_by_email TEXT,
        requested_by_name TEXT,
        approval_requested_at TEXT,
        approved_by_email TEXT,
        approved_by_name TEXT,
        approved_at TEXT,
        approval_notes TEXT,
        ads_manager_link TEXT,
        launch_checklist TEXT,
        launch_notes TEXT,
        launched_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.execute(`CREATE INDEX IF NOT EXISTS idx_meta_launch_drafts_status ON meta_launch_drafts(status);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_meta_launch_drafts_account_id ON meta_launch_drafts(account_id);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_meta_launch_drafts_updated_at ON meta_launch_drafts(updated_at);`);

    console.log("Meta launch drafts migration applied successfully.");
  } finally {
    client.close();
  }
}

migrateMetaLaunchDrafts().catch((error) => {
  console.error("Failed to migrate Meta launch drafts schema:", error);
  process.exit(1);
});
