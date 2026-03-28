import { drizzle } from 'drizzle-orm/libsql/web';
import { createClient } from '@libsql/client/web';

import * as schema from '@/db/schema';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const defaultRemoteUrl = 'libsql://santaan-hope-satishskid.aws-ap-south-1.turso.io';

let client;

const isLocal = !url || url.startsWith('file:');

if (process.env.NODE_ENV === 'development' || isLocal) {
    // Use the local client for file: protocol or if no URL provided
    const { createClient: createLocalClient } = require('@libsql/client');
    client = createLocalClient({ 
        url: url || 'file:santaan.db',
        authToken: authToken
    });
} else {
    // In production/edge with a remote URL, use the web client
    client = createClient({
        url: url || defaultRemoteUrl,
        authToken: authToken || ''
    });
}

export const db = drizzle(client, { schema });
