import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/web';

import * as schema from '@/db/schema';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const defaultRemoteUrl = 'libsql://santaan-hope-satishskid.aws-ap-south-1.turso.io';

let client;

if (process.env.NODE_ENV === 'development') {
    // In development, use the local client with file: protocol
    // We use require here to avoid bundling better-sqlite3 in production
    const { createClient: createLocalClient } = require('@libsql/client');
    client = url
        ? createClient({ url, authToken })
        : createLocalClient({ url: 'file:santaan.db' });
} else {
    // In production/edge, use the web client
    client = createClient({
        url: url || defaultRemoteUrl,
        authToken: authToken || ''
    });
}

export const db = drizzle(client, { schema });
