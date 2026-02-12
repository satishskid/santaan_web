import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function runMigrate() {
    console.log("Connecting to local SQLite (santaan.db)...");
    const sqlite = new Database('santaan.db');
    const db = drizzle(sqlite);

    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: './drizzle' });

    console.log("Migrations applied successfully!");
    sqlite.close();
}

runMigrate().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});