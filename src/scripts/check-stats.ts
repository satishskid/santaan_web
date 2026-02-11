import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function checkData() {
    const contacts = await client.execute('SELECT COUNT(*) as count FROM contacts');
    const newsletter = await client.execute('SELECT COUNT(*) as count FROM contacts WHERE newsletter_subscribed = 1');
    const seminar = await client.execute('SELECT COUNT(*) as count FROM contacts WHERE seminar_registered = 1');
    const centers = await client.execute('SELECT COUNT(*) as count FROM centers');
    const announcements = await client.execute('SELECT COUNT(*) as count FROM announcements');
    
    console.log('\n📊 Database Stats:');
    console.log('   Total Contacts:', contacts.rows[0].count);
    console.log('   Newsletter Subscribers:', newsletter.rows[0].count);
    console.log('   Seminar Registrations:', seminar.rows[0].count);
    console.log('   Centers:', centers.rows[0].count);
    console.log('   Announcements:', announcements.rows[0].count);
}
checkData();
