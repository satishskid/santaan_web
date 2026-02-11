import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function addBengaluruClinic() {
    console.log('Adding Bengaluru Brookefield clinic...');
    
    await client.execute({
        sql: `INSERT INTO centers (city, title, address, description, email, phones, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
            'Bengaluru',
            'Brookefield Center',
            'V V Arcade, 518, 1st Main Rd, B Block, AECS Layout, Brookefield, Bengaluru, Karnataka 560037',
            'Our newest center in Brookefield, bringing advanced fertility care to East Bengaluru.',
            'bng@santaan.in',
            JSON.stringify(['+91 8105108416']),
            4
        ]
    });
    console.log('✅ Bengaluru Brookefield clinic added!');
    
    const result = await client.execute('SELECT city, title, address FROM centers ORDER BY sort_order');
    console.log('\n📍 All Centers:');
    result.rows.forEach((r: any, i: number) => console.log(`  ${i+1}. ${r.city} - ${r.title}`));
}

addBengaluruClinic();
