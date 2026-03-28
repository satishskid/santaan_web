import { drizzle } from 'drizzle-orm/libsql/web';
import { createClient } from '@libsql/client/web';
import * as schema from '@/db/schema';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const defaultRemoteUrl = 'libsql://santaan-hope-satishskid.aws-ap-south-1.turso.io';

const isLocal = !url || url.startsWith('file:');

const createDbClient = () => {
    if (typeof window !== 'undefined') {
        // We shouldn't be here on the client-side usually for direct DB access
        return createClient({ url: url || defaultRemoteUrl, authToken: authToken || '' });
    }

    if (process.env.NODE_ENV === 'development' || isLocal) {
        // Use the local client for file: protocol or if no URL provided
        // We use require here to avoid bundling node-specific libs in edge/browser
        try {
            const { createClient: createLocalClient } = require('@libsql/client');
            return createLocalClient({ 
                url: url || 'file:santaan.db',
                authToken: authToken
            });
        } catch (e) {
            // Fallback for environments where @libsql/client (node) is missing but web is available
            return createClient({ url: url || 'file:santaan.db', authToken: authToken || '' });
        }
    }

    // In production/edge with a remote URL, use the web client
    return createClient({
        url: url || defaultRemoteUrl,
        authToken: authToken || ''
    });
};

const client = createDbClient();
export const db = drizzle(client, { schema });
