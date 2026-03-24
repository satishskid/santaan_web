import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env.local");
  process.exit(1);
}

const client = createClient({ url, authToken });

const statements = [
  "ALTER TABLE users ADD COLUMN email_verified integer NOT NULL DEFAULT 0",
  "ALTER TABLE users ADD COLUMN image text",
  "ALTER TABLE users ADD COLUMN updated_at text",
  "UPDATE users SET updated_at = created_at WHERE updated_at IS NULL",
  `CREATE TABLE IF NOT EXISTS auth_sessions (
    id text PRIMARY KEY NOT NULL,
    expires_at text NOT NULL,
    token text NOT NULL UNIQUE,
    created_at text NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at text NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address text,
    user_agent text,
    user_id text NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS auth_accounts (
    id text PRIMARY KEY NOT NULL,
    account_id text NOT NULL,
    provider_id text NOT NULL,
    user_id text NOT NULL,
    access_token text,
    refresh_token text,
    id_token text,
    access_token_expires_at text,
    refresh_token_expires_at text,
    scope text,
    password text,
    created_at text NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at text NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS auth_verifications (
    id text PRIMARY KEY NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    expires_at text NOT NULL,
    created_at text NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at text NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
];

async function run() {
  console.log("🚀 Running Better Auth schema updates...");
  for (const statement of statements) {
    try {
      await client.execute(statement);
      console.log("✅ Applied:", statement.split("\n")[0]);
    } catch (error) {
      const message = error?.message || String(error);
      if (message.includes("duplicate column name")) {
        console.log("↪️ Column already exists, skipping.");
        continue;
      }
      console.error("❌ Failed statement:", statement);
      throw error;
    }
  }
  console.log("✅ Better Auth schema migration complete.");
  client.close();
}

run().catch((error) => {
  console.error("❌ Better Auth migration failed:", error);
  process.exit(1);
});
