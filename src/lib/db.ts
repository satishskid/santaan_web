import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import { drizzle as drizzleBetterSqlite3 } from 'drizzle-orm/better-sqlite3';
import * as schema from '@/db/schema';

// Check if we have Turso credentials
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

let db: any;

if (url && authToken) {
    const client = createClient({ url, authToken });
    db = drizzle(client, { schema });
} else {
    // Fallback to local SQLite for development
    const sqlite = new Database('santaan.db');
    db = drizzleBetterSqlite3(sqlite, { schema });
}

export { db };
