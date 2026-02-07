import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function runMigrate() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        throw new Error("Missing Turso credentials");
    }

    console.log("Connecting to Turso...");
    const client = createClient({ url, authToken });
    const db = drizzle(client);

    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: './drizzle' });

    console.log("Migrations applied successfully!");
    client.close();
}

runMigrate().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
