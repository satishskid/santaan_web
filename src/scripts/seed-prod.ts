
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const DEFAULT_PASSWORD = "password123"; // INSECURE: Change immediately after login
const ADMINS = [
    { email: "raghab.panda@santaan.in", name: "Raghab Panda" },
    { email: "satish.rath@santaan.in", name: "Satish Rath" },
    { email: "satish@skids.health", name: "Satish Skids" },
    { email: "demo@santaan.com", name: "Demo Admin" }
];

async function seedProd() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        throw new Error("❌ Missing Turso credentials for seeding");
    }

    console.log("🚀 Connecting to Production Turso DB for Seeding...");
    const client = createClient({ url, authToken });
    const db = drizzle(client, { schema: { users } });

    console.log("🌱 Seeding production users...");

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    for (const admin of ADMINS) {
        try {
            // Check if user exists (using raw query or dql if select fails heavily)
            const existingUser = await db.select().from(users).where(eq(users.email, admin.email)).get();

            if (!existingUser) {
                await db.insert(users).values({
                    email: admin.email,
                    name: admin.name,
                    password: hashedPassword,
                    role: "admin"
                });
                console.log(`✅ Created admin: ${admin.email}`);
            } else {
                console.log(`⚠️ User already exists: ${admin.email}`);
            }
        } catch (e) {
            console.error(`❌ Failed to seed ${admin.email}:`, e);
        }
    }

    console.log("\n🔐 Production Seeding complete.");
    client.close();
}

seedProd().catch((err) => {
    console.error("Fatal error during seeding:", err);
    process.exit(1);
});
