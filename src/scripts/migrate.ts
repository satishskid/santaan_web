import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function runMigrate() {
    const url = process.env.TURSO_DATABASE_URL || 'file:santaan.db';
    const authToken = process.env.TURSO_AUTH_TOKEN;

    console.log(`Connecting to local DB (${url})...`);
    const client = createClient({
        url,
        authToken: authToken || undefined,
    });
    const db = drizzle(client);

    console.log("Running migrations...");
    try {
        await migrate(db, { migrationsFolder: './drizzle' });
        console.log("Migrations applied successfully!");
    } finally {
        client.close();
    }
}

runMigrate().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
