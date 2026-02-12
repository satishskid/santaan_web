import { createClient } from "@libsql/client";
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrateCentersAndAnnouncements() {
    console.log("🚀 Migrating centers and announcements tables to production...\n");

    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        throw new Error("❌ Missing Turso credentials (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN)");
    }

    console.log(`📡 URL: ${url}`);

    const client = createClient({ url, authToken });

    try {
        // Create centers table
        console.log("📍 Creating centers table...");
        await client.execute(`
            CREATE TABLE IF NOT EXISTS \`centers\` (
                \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                \`city\` text NOT NULL,
                \`title\` text NOT NULL,
                \`address\` text NOT NULL,
                \`description\` text,
                \`email\` text NOT NULL,
                \`phones\` text NOT NULL,
                \`map_url\` text,
                \`is_active\` integer DEFAULT true,
                \`sort_order\` integer DEFAULT 0,
                \`created_at\` text DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` text DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Centers table created");

        // Create announcements table
        console.log("📢 Creating announcements table...");
        await client.execute(`
            CREATE TABLE IF NOT EXISTS \`announcements\` (
                \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                \`title\` text NOT NULL,
                \`content\` text NOT NULL,
                \`type\` text DEFAULT 'info',
                \`is_active\` integer DEFAULT true,
                \`priority\` integer DEFAULT 0,
                \`created_at\` text DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` text DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Announcements table created");

        console.log('\n� Migration completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrateCentersAndAnnouncements();