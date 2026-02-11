// Script to seed admin users to Turso (production) database
import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    console.error("❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
    process.exit(1);
}

const client = createClient({ url, authToken });
const db = drizzle(client, { schema: { users } });

// Admin accounts with secure passwords
// IMPORTANT: Change these passwords after first login!
const ADMINS = [
    { email: "raghab.panda@santaan.in", name: "Raghab Panda", password: "Santaan@2026!" },
    { email: "satish.rath@santaan.in", name: "Satish Rath", password: "Santaan@2026!" },
    { email: "satish@skids.health", name: "Satish Rath (Skids)", password: "Santaan@2026!" },
    { email: "satish.rath@gmail.com", name: "Satish Rath (Gmail)", password: "Santaan@2026!" },
    { email: "demo@santaan.com", name: "Demo Admin", password: "Demo@2026!" }
];

async function seedAdmins() {
    console.log("🌱 Seeding admin users to production database...\n");

    for (const admin of ADMINS) {
        try {
            const existingUser = await db.select().from(users).where(eq(users.email, admin.email)).get();

            if (!existingUser) {
                const hashedPassword = await bcrypt.hash(admin.password, 12);
                await db.insert(users).values({
                    email: admin.email,
                    name: admin.name,
                    password: hashedPassword,
                    role: "admin"
                });
                console.log(`✅ Created admin: ${admin.email}`);
            } else {
                // Update password if user exists
                const hashedPassword = await bcrypt.hash(admin.password, 12);
                await db.update(users)
                    .set({ password: hashedPassword, role: "admin" })
                    .where(eq(users.email, admin.email));
                console.log(`🔄 Updated admin: ${admin.email}`);
            }
        } catch (error) {
            console.error(`❌ Failed for ${admin.email}:`, error);
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log("🔐 ADMIN CREDENTIALS (Change after first login!)");
    console.log("=".repeat(50));
    ADMINS.forEach(admin => {
        console.log(`\n📧 ${admin.email}`);
        console.log(`🔑 ${admin.password}`);
    });
    console.log("\n" + "=".repeat(50));
    console.log("🌐 Login URL: https://www.santaan.in/login");
    console.log("=".repeat(50));
}

seedAdmins()
    .then(() => {
        console.log("\n✅ Seeding complete!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    });
