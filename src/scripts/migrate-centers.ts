import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../db/schema";
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrateCentersAndAnnouncements() {
    console.log("🚀 Migrating centers and announcements tables to production...\n");

    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        throw new Error("❌ Missing Turso credentials (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN)");
    }

    console.log(`📡 URL: ${url}`);

    const client = createClient({ url, authToken });

    const db = drizzle(client, { schema });

    try {
        // Create centers table
        console.log("📍 Creating centers table...");
        await client.execute(`
            CREATE TABLE IF NOT EXISTS \`centers\` (
                \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                \`city\` text NOT NULL,
                \`title\` text NOT NULL,
                \`address\` text NOT NULL,
                \`description\` text,
                \`email\` text NOT NULL,
                \`phones\` text NOT NULL,
                \`map_url\` text,
                \`is_active\` integer DEFAULT true,
                \`sort_order\` integer DEFAULT 0,
                \`created_at\` text DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` text DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Centers table created");

        // Create announcements table
        console.log("📢 Creating announcements table...");
        await client.execute(`
            CREATE TABLE IF NOT EXISTS \`announcements\` (
                \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                \`title\` text NOT NULL,
                \`content\` text,
                \`type\` text DEFAULT 'news',
                \`image_url\` text,
                \`link_url\` text,
                \`link_text\` text,
                \`is_active\` integer DEFAULT true,
                \`is_pinned\` integer DEFAULT false,
                \`publish_date\` text DEFAULT CURRENT_TIMESTAMP,
                \`expiry_date\` text,
                \`created_at\` text DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` text DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Announcements table created");

        // Check if centers already exist
        const existingCenters = await client.execute("SELECT COUNT(*) as count FROM centers");
        const centerCount = Number((existingCenters.rows[0] as unknown as { count: number }).count);

        if (centerCount === 0) {
            console.log("\n🏥 Seeding initial centers data...");
            
            // Insert Bhubaneswar
            await client.execute({
                sql: `INSERT INTO centers (city, title, address, description, email, phones, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    'Bhubaneswar',
                    'The Temple City',
                    'District Center, Chandrasekharpur & IRC Village',
                    'Our flagship center of excellence featuring advanced IVF labs and the Santaan Academy.',
                    'bbsr@santaan.in',
                    JSON.stringify(['+91 9337326896', '+91 7328839934', '+91 7008990586']),
                    1
                ]
            });
            console.log("  ✅ Bhubaneswar center added");

            // Insert Berhampur
            await client.execute({
                sql: `INSERT INTO centers (city, title, address, description, email, phones, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    'Berhampur',
                    'The Silk City',
                    'Comprehensive Fertility Care Center',
                    'Bringing world-class fertility solutions to Southern Odisha.',
                    'bbsr@santaan.in',
                    JSON.stringify(['+91 7008990582', '+91 9777989739']),
                    2
                ]
            });
            console.log("  ✅ Berhampur center added");

            // Insert Bengaluru
            await client.execute({
                sql: `INSERT INTO centers (city, title, address, description, email, phones, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    'Bengaluru',
                    'Silicon Valley of India',
                    'New Center of Innovation',
                    'Expanding our footprint with tech-integrated fertility care.',
                    'bng@santaan.in',
                    JSON.stringify(['+91 8105108416']),
                    3
                ]
            });
            console.log("  ✅ Bengaluru center added");
        } else {
            console.log(`\n📍 Centers already exist (${centerCount} found), skipping seed`);
        }

        // Add a sample announcement
        const existingAnnouncements = await client.execute("SELECT COUNT(*) as count FROM announcements");
        const announcementCount = Number((existingAnnouncements.rows[0] as unknown as { count: number }).count);

        if (announcementCount === 0) {
            console.log("\n📢 Adding sample announcement...");
            await client.execute({
                sql: `INSERT INTO announcements (title, content, type, is_pinned) VALUES (?, ?, ?, ?)`,
                args: [
                    '🎉 Grand Opening in Bengaluru!',
                    'We are excited to announce our new state-of-the-art fertility center in Bengaluru. Book your consultation today!',
                    'news',
                    1
                ]
            });
            console.log("  ✅ Sample announcement added");
        }

        console.log("\n✅ Migration completed successfully!");

        // Verify
        const centersResult = await client.execute("SELECT * FROM centers WHERE is_active = 1 ORDER BY sort_order");
        console.log(`\n📍 Active Centers: ${centersResult.rows.length}`);
        centersResult.rows.forEach((row: Record<string, unknown>) => {
            console.log(`   - ${row.city}: ${row.address}`);
        });

        const announcementsResult = await client.execute("SELECT * FROM announcements WHERE is_active = 1");
        console.log(`\n📢 Active Announcements: ${announcementsResult.rows.length}`);
        announcementsResult.rows.forEach((row: Record<string, unknown>) => {
            console.log(`   - [${row.type}] ${row.title}`);
        });

    } catch (error) {
        console.error("❌ Migration failed:", error);
        throw error;
    }
}

migrateCentersAndAnnouncements();
