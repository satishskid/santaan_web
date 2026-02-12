import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export default {
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'sqlite', // 'postgresql' | 'mysql' | 'sqlite'
    dbCredentials: {
        url: process.env.TURSO_DATABASE_URL || 'file:santaan.db',
        // @ts-expect-error - authToken is required for Turso but valid types are missing it
        authToken: process.env.TURSO_AUTH_TOKEN,
    },
} satisfies Config;
