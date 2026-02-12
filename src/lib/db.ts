import { drizzle } from 'drizzle-orm/libsql';
import { createClient as createWebClient } from '@libsql/client/web';
import { createClient as createLocalClient } from '@libsql/client';
import Database from 'better-sqlite3';
import { drizzle as drizzleBetterSqlite3 } from 'drizzle-orm/better-sqlite3';

import * as schema from '@/db/schema';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

let db: ReturnType<typeof drizzle>;

// Always use Turso in production/build environments
if (url && authToken) {
    const client = createWebClient({ url, authToken });
    db = drizzle(client, { schema });
} else if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
    // Only use local SQLite in development runtime (not during build)
    try {
        const sqlite = new Database('santaan.db');
        db = drizzleBetterSqlite3(sqlite, { schema });
    } catch (error) {
        console.error('SQLite initialization failed, using Turso fallback');
        // Fallback to Turso even in development if SQLite fails
        const client = createWebClient({ 
            url: url || 'libsql://santaan-hope-satishskid.aws-ap-south-1.turso.io',
            authToken: authToken || '' 
        });
        db = drizzle(client, { schema });
    }
} else {
    // For production builds without env vars, create a dummy client
    const client = createWebClient({ 
        url: url || 'libsql://santaan-hope-satishskid.aws-ap-south-1.turso.io',
        authToken: authToken || '' 
    });
    db = drizzle(client, { schema });
}

export { db };