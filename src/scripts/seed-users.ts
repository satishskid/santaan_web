// import { db } from "../lib/db"; // Avoid using lib/db which might auto-connect to Turso
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sqlite = new Database('santaan.db');
const db = drizzle(sqlite, { schema: { users } });

const DEFAULT_PASSWORD = process.env.SANTAAN_SEED_PASSWORD;
const ADMINS = [
    { email: "ceo.crmops@santaan.in", name: "CEO CRM Ops" },
    { email: "raghab.panda@santaan.in", name: "Raghab Panda" },
    { email: "satish.rath@santaan.in", name: "Satish Rath" },
    { email: "satish@skids.health", name: "Satish Rath (Skids)" },
    { email: "demo@santaan.com", name: "Demo Admin" }
];

async function seed() {
    console.log("🌱 Seeding users...");
    if (!DEFAULT_PASSWORD) {
        console.error("❌ Missing SANTAAN_SEED_PASSWORD in .env.local");
        process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    for (const admin of ADMINS) {
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
    }

    console.log("\n🔐 Seeding complete.");
    console.log("👉 Passwords were set from SANTAAN_SEED_PASSWORD (not printed).");
}

seed().catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
});
