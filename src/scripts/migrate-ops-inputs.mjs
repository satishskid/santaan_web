import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function migrateOpsInputsTables() {
  const url = process.env.TURSO_DATABASE_URL || "file:santaan.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url,
    authToken: authToken || undefined,
  });

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS agency_performance_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_date TEXT NOT NULL,
        platform TEXT NOT NULL,
        center TEXT NOT NULL,
        campaign_id TEXT NOT NULL,
        campaign_name TEXT NOT NULL,
        utm_source TEXT NOT NULL,
        utm_medium TEXT NOT NULL,
        utm_campaign TEXT NOT NULL,
        spend REAL NOT NULL,
        impressions INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        leads INTEGER DEFAULT 0,
        qualified_leads INTEGER DEFAULT 0,
        registrations INTEGER DEFAULT 0,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS field_activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        activity_date TEXT NOT NULL,
        center TEXT NOT NULL,
        activity_type TEXT NOT NULL,
        asset_code TEXT NOT NULL,
        location TEXT NOT NULL,
        owner_name TEXT NOT NULL,
        spend REAL DEFAULT 0,
        estimated_reach INTEGER DEFAULT 0,
        actual_footfall INTEGER DEFAULT 0,
        leads_collected INTEGER DEFAULT 0,
        qualified_leads INTEGER DEFAULT 0,
        registrations INTEGER DEFAULT 0,
        utm_campaign TEXT NOT NULL,
        qr_code_id TEXT,
        call_number TEXT,
        whatsapp_number TEXT,
        proof_url TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS tv_ad_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        airing_date TEXT NOT NULL,
        center TEXT NOT NULL,
        channel_name TEXT NOT NULL,
        program_name TEXT NOT NULL,
        time_slot TEXT NOT NULL,
        spot_duration_sec INTEGER DEFAULT 20,
        spots_count INTEGER DEFAULT 1,
        spend REAL DEFAULT 0,
        creative_code TEXT NOT NULL,
        tv_campaign_code TEXT NOT NULL,
        utm_campaign TEXT NOT NULL,
        qr_code_id TEXT,
        ivr_number TEXT,
        whatsapp_keyword TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.execute(`CREATE INDEX IF NOT EXISTS idx_agency_report_date ON agency_performance_logs(report_date);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_agency_platform ON agency_performance_logs(platform);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_agency_campaign ON agency_performance_logs(utm_campaign);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_field_activity_date ON field_activity_logs(activity_date);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_field_activity_center ON field_activity_logs(center);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_tv_airing_date ON tv_ad_logs(airing_date);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_tv_campaign ON tv_ad_logs(utm_campaign);`);

    console.log("Ops input tables migration applied successfully.");
  } finally {
    client.close();
  }
}

migrateOpsInputsTables().catch((error) => {
  console.error("Failed to migrate ops input tables:", error);
  process.exit(1);
});
