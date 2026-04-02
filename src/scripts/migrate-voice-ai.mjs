import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function migrateVoiceAi() {
  const url = process.env.TURSO_DATABASE_URL || "file:santaan.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({
    url,
    authToken: authToken || undefined,
  });

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS voice_call_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_key TEXT NOT NULL,
        external_call_id TEXT,
        contact_id INTEGER,
        provider TEXT NOT NULL DEFAULT 'bolna',
        agent_name TEXT DEFAULT 'Swara',
        from_number TEXT,
        to_number TEXT,
        entry_point TEXT,
        source_campaign TEXT,
        call_status TEXT,
        started_at TEXT,
        ended_at TEXT,
        duration_sec INTEGER,
        language TEXT,
        caller_name TEXT,
        caller_type TEXT,
        city TEXT,
        preferred_centre TEXT,
        trying_duration TEXT,
        known_condition TEXT,
        prior_treatment TEXT,
        callback_window TEXT,
        whatsapp_number TEXT,
        transcript_url TEXT,
        summary TEXT,
        transfer_requested INTEGER DEFAULT 0,
        transfer_completed INTEGER DEFAULT 0,
        intent_score INTEGER DEFAULT 0,
        intent_bucket TEXT,
        neodove_push_status TEXT DEFAULT 'pending',
        whatsapp_push_status TEXT DEFAULT 'pending',
        raw_payload TEXT NOT NULL,
        received_at TEXT DEFAULT CURRENT_TIMESTAMP,
        processed_at TEXT,
        process_status TEXT DEFAULT 'received',
        error_message TEXT
      );
    `);

    await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_voice_call_logs_event_key ON voice_call_logs(event_key);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_voice_call_logs_external_call_id ON voice_call_logs(external_call_id);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_voice_call_logs_contact_id ON voice_call_logs(contact_id);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_voice_call_logs_received_at ON voice_call_logs(received_at);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_voice_call_logs_process_status ON voice_call_logs(process_status);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_voice_call_logs_intent_bucket ON voice_call_logs(intent_bucket);`);

    console.log("Voice AI migration applied successfully.");
  } finally {
    client.close();
  }
}

migrateVoiceAi().catch((error) => {
  console.error("Failed to migrate Voice AI schema:", error);
  process.exit(1);
});
