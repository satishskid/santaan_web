
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function runMigrateProd() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        throw new Error("❌ Missing Turso credentials (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN)");
    }

    console.log("🚀 Connecting to Production Turso DB...");
    console.log(`📡 URL: ${url}`);

    const client = createClient({ url, authToken });
    const db = drizzle(client);

    console.log("📦 Running migrations...");

    try {
        await migrate(db, { migrationsFolder: './drizzle' });
        console.log("✅ Production migrations applied successfully!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
        throw error;
    } finally {
        client.close();
    }
}

runMigrateProd().catch((err) => {
    console.error("Fatal error during migration:", err);
    process.exit(1);
});
