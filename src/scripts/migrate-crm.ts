import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface MigrationError {
    message?: string;
}

async function migrate() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        console.error('❌ Missing Turso credentials');
        process.exit(1);
    }

    const client = createClient({ url, authToken });

    try {
        console.log('🚀 Starting CRM migration...');

        // Add submitted_at column
        await client.execute(`
            ALTER TABLE contacts 
            ADD COLUMN submitted_at TEXT DEFAULT CURRENT_TIMESTAMP
        `);

        console.log('✅ Added submitted_at column');

        console.log('\n🎉 Migration completed successfully!');
        process.exit(0);

    } catch (error) {
        const err = error as MigrationError;
        // Check if error is because columns already exist
        if (err.message?.includes('duplicate column name')) {
            console.log('⚠️  Columns already exist, skipping migration');
            process.exit(0);
        }
        
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();