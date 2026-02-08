import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

import * as schema from '@/db/schema';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

let db: any;

// Always use Turso in production/build environments
if (url && authToken) {
    const client = createClient({ url, authToken });
    db = drizzle(client, { schema });
} else if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
    // Only use local SQLite in development runtime (not during build)
    try {
        const Database = require('better-sqlite3');
        const { drizzle: drizzleBetterSqlite3 } = require('drizzle-orm/better-sqlite3');
        const sqlite = new Database('santaan.db');
        db = drizzleBetterSqlite3(sqlite, { schema });
    } catch (error) {
        console.error('SQLite initialization failed, using Turso fallback');
        // Fallback to Turso even in development if SQLite fails
        const client = createClient({ 
            url: url || 'libsql://santaan-hope-satishskid.aws-ap-south-1.turso.io',
            authToken: authToken || '' 
        });
        db = drizzle(client, { schema });
    }
} else {
    // For production builds without env vars, create a dummy client
    const client = createClient({ 
        url: url || 'libsql://santaan-hope-satishskid.aws-ap-south-1.turso.io',
        authToken: authToken || '' 
    });
    db = drizzle(client, { schema });
}

export { db };
