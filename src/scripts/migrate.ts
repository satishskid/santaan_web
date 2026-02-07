import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'; // Changed to better-sqlite3 migrator
import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import { drizzle as drizzleBetterSqlite3 } from 'drizzle-orm/better-sqlite3';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function runMigrate() {
    /*
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        throw new Error("Missing Turso credentials");
    }

    console.log("Connecting to Turso...");
    const client = createClient({ url, authToken });
    const db = drizzle(client);
    */

    console.log("Connecting to local SQLite (santaan.db)...");
    const sqlite = new Database('santaan.db');
    const db = drizzleBetterSqlite3(sqlite);

    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: './drizzle' });

    console.log("Migrations applied successfully!");
    sqlite.close();
}

runMigrate().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
