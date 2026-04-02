import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env.local");
  process.exit(1);
}

const ADMIN_PIN = process.env.SANTAAN_ADMIN_PIN || process.env.SANTAAN_SEED_PASSWORD;
const STAFF_PIN = process.env.SANTAAN_STAFF_PIN;

if (!ADMIN_PIN || !STAFF_PIN) {
  console.error("❌ Missing SANTAAN_ADMIN_PIN or SANTAAN_STAFF_PIN in .env.local");
  process.exit(1);
}

const client = createClient({ url, authToken });

const ADMIN_USERS = [
  { email: "ceo.crmops@santaan.in", name: "CEO CRM Ops", role: "admin", pinType: "admin" },
  { email: "raghab.panda@santaan.in", name: "Raghab Panda", role: "admin", pinType: "admin" },
  { email: "satish.rath@santaan.in", name: "Satish Rath", role: "admin", pinType: "admin" },
  { email: "satish.rath@gmail.com", name: "Satish Rath (Gmail)", role: "admin", pinType: "admin" },
  { email: "demo@santaan.com", name: "Demo Admin", role: "admin", pinType: "admin" },
];

const STAFF_USERS = [
  { email: "content.manager@santaan.in", name: "Content Manager", role: "content_manager", pinType: "staff" },
  { email: "santaandigital.ops@santaan.in", name: "Agency Ops", role: "agency_ops", pinType: "staff" },
  { email: "field.bbsr@santaan.in", name: "Field Exec Bhubaneswar", role: "field_exec", pinType: "staff" },
  { email: "field.bam@santaan.in", name: "Field Exec Berhampur", role: "field_exec", pinType: "staff" },
  { email: "field.blr@santaan.in", name: "Field Exec Bangalore", role: "field_exec", pinType: "staff" },
  { email: "ivr.lead@santaan.in", name: "IVR Lead", role: "ivr_manager", pinType: "staff" },
  { email: "tele.bbsr@santaan.in", name: "Telecaller Bhubaneswar", role: "telecaller", pinType: "staff" },
  { email: "tele.bam@santaan.in", name: "Telecaller Berhampur", role: "telecaller", pinType: "staff" },
  { email: "tele.blr@santaan.in", name: "Telecaller Bangalore", role: "telecaller", pinType: "staff" },
  { email: "counselor.bbsr@santaan.in", name: "Counselor Bhubaneswar", role: "counselor", pinType: "staff" },
  { email: "counselor.bam@santaan.in", name: "Counselor Berhampur", role: "counselor", pinType: "staff" },
  { email: "counselor.blr@santaan.in", name: "Counselor Bangalore", role: "counselor", pinType: "staff" },
  { email: "anitakumaripatra143@gmail.com", name: "Anita Kumari", role: "field_exec", pinType: "staff" },
  { email: "bam@santaan.in", name: "Balakrushna", role: "counselor", pinType: "staff" },
  { email: "bramhotri.p.sahoo@gmail.com", name: "Bramhotri", role: "field_exec", pinType: "staff" },
  { email: "bbsr@santaan.in", name: "Dibya", role: "counselor", pinType: "staff" },
  { email: "csmsantaanbbsr@gmail.com", name: "Dipti", role: "counselor", pinType: "staff" },
  { email: "mousamkumarp@gmail.com", name: "Mousam Kumar", role: "field_exec", pinType: "staff" },
  { email: "drpratichi@skids.health", name: "Pratichi", role: "counselor", pinType: "staff" },
  { email: "swainr951@gmail.com", name: "Rashmita", role: "field_exec", pinType: "staff" },
  { email: "mohanty.ritesh@gmail.com", name: "Ritesh", role: "field_exec", pinType: "staff" },
  { email: "team@rabbitm.in", name: "Team RabbitM", role: "agency_ops", pinType: "staff" },
];

async function upsertUser(user) {
  const pin = user.pinType === "admin" ? ADMIN_PIN : STAFF_PIN;
  const hashedPassword = await bcrypt.hash(pin, 12);

  const existing = await client.execute({
    sql: "SELECT id FROM users WHERE email = ?",
    args: [user.email],
  });

  if (!existing.rows.length) {
    await client.execute({
      sql: "INSERT INTO users (id, name, email, password, role, email_verified, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
      args: [crypto.randomUUID(), user.name, user.email, hashedPassword, user.role, 1],
    });
    console.log(`✅ Created user: ${user.email}`);
  } else {
    await client.execute({
      sql: "UPDATE users SET name = ?, password = ?, role = ?, email_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE email = ?",
      args: [user.name, hashedPassword, user.role, user.email],
    });
    console.log(`🔄 Updated user: ${user.email}`);
  }
}

async function seed() {
  console.log("🌱 Seeding CRM team users...");
  for (const user of [...ADMIN_USERS, ...STAFF_USERS]) {
    try {
      await upsertUser(user);
    } catch (error) {
      console.error(`❌ Failed for ${user.email}:`, error);
    }
  }
  console.log("✅ CRM team seeding complete.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
