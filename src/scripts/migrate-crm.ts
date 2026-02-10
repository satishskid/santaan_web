import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../../.env.local') });

// Use the same dynamic client factory as the main app
const getDatabaseClient = () => {
    const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN;

    if (!url) {
        throw new Error('TURSO_DATABASE_URL or DATABASE_URL environment variable is required');
    }

    console.log('Connecting to database:', url.substring(0, 30) + '...');

    // Use web client for serverless environments (Netlify)
    if (url.startsWith('libsql://') || url.startsWith('https://')) {
        return createClient({
            url,
            authToken,
        });
    }

    // Local SQLite file
    return createClient({
        url: `file:${url}`,
    });
};

const client = getDatabaseClient();
const db = drizzle(client);

async function migrate() {
    console.log('🔄 Running migration: Add CRM enhancements...');

    try {
        // Add new columns to contacts table
        await db.run(`
            ALTER TABLE contacts ADD COLUMN newsletter_subscribed INTEGER DEFAULT 0;
        `);
        console.log('✅ Added newsletter_subscribed column');

        await db.run(`
            ALTER TABLE contacts ADD COLUMN whatsapp_number TEXT;
        `);
        console.log('✅ Added whatsapp_number column');

        await db.run(`
            ALTER TABLE contacts ADD COLUMN whatsapp_opt_in INTEGER DEFAULT 0;
        `);
        console.log('✅ Added whatsapp_opt_in column');

        await db.run(`
            ALTER TABLE contacts ADD COLUMN telegram_id TEXT;
        `);
        console.log('✅ Added telegram_id column');

        await db.run(`
            ALTER TABLE contacts ADD COLUMN telegram_username TEXT;
        `);
        console.log('✅ Added telegram_username column');

        await db.run(`
            ALTER TABLE contacts ADD COLUMN telegram_opt_in INTEGER DEFAULT 0;
        `);
        console.log('✅ Added telegram_opt_in column');

        await db.run(`
            ALTER TABLE contacts ADD COLUMN preferred_channel TEXT DEFAULT 'email';
        `);
        console.log('✅ Added preferred_channel column');

        await db.run(`
            ALTER TABLE contacts ADD COLUMN tags TEXT;
        `);
        console.log('✅ Added tags column');

        await db.run(`
            ALTER TABLE contacts ADD COLUMN lead_source TEXT;
        `);
        console.log('✅ Added lead_source column');

        await db.run(`
            ALTER TABLE contacts ADD COLUMN lead_score INTEGER DEFAULT 0;
        `);
        console.log('✅ Added lead_score column');

        await db.run(`
            ALTER TABLE contacts ADD COLUMN message TEXT;
        `);
        console.log('✅ Added message column');

        await db.run(`
            ALTER TABLE contacts ADD COLUMN last_message_at TEXT;
        `);
        console.log('✅ Added last_message_at column');

        await db.run(`
            ALTER TABLE contacts ADD COLUMN conversation_count INTEGER DEFAULT 0;
        `);
        console.log('✅ Added conversation_count column');

        await db.run(`
            ALTER TABLE contacts ADD COLUMN submitted_at INTEGER;
        `);
        console.log('✅ Added submitted_at column');

        console.log('\n🎉 Migration completed successfully!');
        process.exit(0);

    } catch (error: any) {
        // Check if error is because columns already exist
        if (error.message?.includes('duplicate column name')) {
            console.log('⚠️  Columns already exist, skipping migration');
            process.exit(0);
        }
        
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
