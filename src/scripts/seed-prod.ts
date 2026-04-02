
import { drizzle } from 'drizzle-orm/libsql/web';
import { createClient } from '@libsql/client/web';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error("❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env.local");
    process.exit(1);
}

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

const db = drizzle(client, { schema });

const DEFAULT_PASSWORD = process.env.SANTAAN_SEED_PASSWORD;
const ADMINS = [
    { email: "ceo.crmops@santaan.in", name: "CEO CRM Ops" },
    { email: "raghab.panda@santaan.in", name: "Raghab Panda" },
    { email: "satish.rath@santaan.in", name: "Satish Rath" },
    { email: "satish@skids.health", name: "Satish Rath (Skids)" },
    { email: "demo@santaan.com", name: "Demo Admin" }
];

async function seed() {
    console.log("🌱 Seeding PRODUCTION users to Turso...");
    if (!DEFAULT_PASSWORD) {
        console.error("❌ Missing SANTAAN_SEED_PASSWORD in .env.local");
        process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    for (const admin of ADMINS) {
        try {
            const existingUser = await db.select().from(schema.users).where(eq(schema.users.email, admin.email)).get();

            if (!existingUser) {
                await db.insert(schema.users).values({
                    email: admin.email,
                    name: admin.name,
                    password: hashedPassword,
                    role: "admin"
                });
                console.log(`✅ Created admin: ${admin.email}`);
            } else {
                console.log(`⚠️ User already exists: ${admin.email}`);
                // Force update password to ensure access
                await db.update(schema.users).set({ password: hashedPassword }).where(eq(schema.users.email, admin.email));
                console.log(`🔄 Reset password for: ${admin.email}`);
            }
        } catch (e) {
            console.error(`❌ Failed to process ${admin.email}:`, e);
        }
    }

    console.log("\n🔐 Seeding complete.");
    console.log("👉 Passwords were set from SANTAAN_SEED_PASSWORD (not printed).");
}

seed().catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
});
