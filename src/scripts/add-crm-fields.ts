import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function addCRMFields() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        throw new Error("❌ Missing Turso credentials");
    }

    console.log("🚀 Connecting to Production Turso DB...");
    const client = createClient({ url, authToken });
    const db = drizzle(client);

    const columns = [
        { name: 'newsletter_subscribed', sql: 'ALTER TABLE contacts ADD COLUMN newsletter_subscribed INTEGER DEFAULT 0' },
        { name: 'whatsapp_number', sql: 'ALTER TABLE contacts ADD COLUMN whatsapp_number TEXT' },
        { name: 'whatsapp_opt_in', sql: 'ALTER TABLE contacts ADD COLUMN whatsapp_opt_in INTEGER DEFAULT 0' },
        { name: 'telegram_id', sql: 'ALTER TABLE contacts ADD COLUMN telegram_id TEXT' },
        { name: 'telegram_username', sql: 'ALTER TABLE contacts ADD COLUMN telegram_username TEXT' },
        { name: 'telegram_opt_in', sql: 'ALTER TABLE contacts ADD COLUMN telegram_opt_in INTEGER DEFAULT 0' },
        { name: 'preferred_channel', sql: 'ALTER TABLE contacts ADD COLUMN preferred_channel TEXT DEFAULT \'email\'' },
        { name: 'tags', sql: 'ALTER TABLE contacts ADD COLUMN tags TEXT' },
        { name: 'lead_source', sql: 'ALTER TABLE contacts ADD COLUMN lead_source TEXT' },
        { name: 'lead_score', sql: 'ALTER TABLE contacts ADD COLUMN lead_score INTEGER DEFAULT 0' },
        { name: 'message', sql: 'ALTER TABLE contacts ADD COLUMN message TEXT' },
        { name: 'last_message_at', sql: 'ALTER TABLE contacts ADD COLUMN last_message_at TEXT' },
        { name: 'conversation_count', sql: 'ALTER TABLE contacts ADD COLUMN conversation_count INTEGER DEFAULT 0' },
        { name: 'submitted_at', sql: 'ALTER TABLE contacts ADD COLUMN submitted_at INTEGER' },
    ];

    console.log("📦 Adding CRM fields...\n");

    for (const column of columns) {
        try {
            await client.execute(column.sql);
            console.log(`✅ Added column: ${column.name}`);
        } catch (error: any) {
            if (error.message?.includes('duplicate column name')) {
                console.log(`⚠️  Column already exists: ${column.name}`);
            } else {
                console.error(`❌ Failed to add ${column.name}:`, error.message);
                throw error;
            }
        }
    }

    console.log("\n🎉 CRM fields migration completed!");
    client.close();
}

addCRMFields().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
