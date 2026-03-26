import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export default {
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'sqlite', // 'postgresql' | 'mysql' | 'sqlite'
    dbCredentials: {
        url: process.env.TURSO_DATABASE_URL || 'file:santaan.db',
        token: process.env.TURSO_AUTH_TOKEN,
    },
} satisfies Config;
