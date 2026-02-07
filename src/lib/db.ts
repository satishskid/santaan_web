import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

import * as schema from '@/db/schema';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

let db: any;

if (url && authToken) {
    const client = createClient({ url, authToken });
    db = drizzle(client, { schema });
} else {
    // Fallback to local SQLite for development - Dynamically imported to avoid build errors in Edge/Serverless
    const Database = require('better-sqlite3');
    const { drizzle: drizzleBetterSqlite3 } = require('drizzle-orm/better-sqlite3');
    const sqlite = new Database('santaan.db');
    db = drizzleBetterSqlite3(sqlite, { schema });
}

export { db };
