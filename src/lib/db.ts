import { drizzle } from 'drizzle-orm/libsql';
import { createClient as createWebClient } from '@libsql/client/web';
import { createClient as createLocalClient } from '@libsql/client';

import * as schema from '@/db/schema';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const defaultRemoteUrl = 'libsql://santaan-hope-satishskid.aws-ap-south-1.turso.io';

const client = url
    ? createWebClient({ url, authToken })
    : process.env.NODE_ENV === 'development'
        ? createLocalClient({ url: 'file:santaan.db' })
        : createWebClient({ url: defaultRemoteUrl, authToken: authToken || '' });

export const db = drizzle(client, { schema });
