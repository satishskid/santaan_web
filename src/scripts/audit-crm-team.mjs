import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

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

const USERS = [
  { email: "ceo.crmops@santaan.in", expectedRole: "admin", pinType: "admin" },
  { email: "raghab.panda@santaan.in", expectedRole: "admin", pinType: "admin" },
  { email: "satish.rath@santaan.in", expectedRole: "admin", pinType: "admin" },
  { email: "satish.rath@gmail.com", expectedRole: "admin", pinType: "admin" },
  { email: "demo@santaan.com", expectedRole: "admin", pinType: "admin" },
  { email: "content.manager@santaan.in", expectedRole: "content_manager", pinType: "staff" },
  { email: "santaandigital.ops@santaan.in", expectedRole: "agency_ops", pinType: "staff" },
  { email: "field.bbsr@santaan.in", expectedRole: "field_exec", pinType: "staff" },
  { email: "field.bam@santaan.in", expectedRole: "field_exec", pinType: "staff" },
  { email: "field.blr@santaan.in", expectedRole: "field_exec", pinType: "staff" },
  { email: "ivr.lead@santaan.in", expectedRole: "ivr_manager", pinType: "staff" },
  { email: "tele.bbsr@santaan.in", expectedRole: "telecaller", pinType: "staff" },
  { email: "tele.bam@santaan.in", expectedRole: "telecaller", pinType: "staff" },
  { email: "tele.blr@santaan.in", expectedRole: "telecaller", pinType: "staff" },
  { email: "counselor.bbsr@santaan.in", expectedRole: "counselor", pinType: "staff" },
  { email: "counselor.bam@santaan.in", expectedRole: "counselor", pinType: "staff" },
  { email: "counselor.blr@santaan.in", expectedRole: "counselor", pinType: "staff" },
  { email: "anitakumaripatra143@gmail.com", expectedRole: "field_exec", pinType: "staff" },
  { email: "bam@santaan.in", expectedRole: "counselor", pinType: "staff" },
  { email: "bramhotri.p.sahoo@gmail.com", expectedRole: "field_exec", pinType: "staff" },
  { email: "bbsr@santaan.in", expectedRole: "counselor", pinType: "staff" },
  { email: "csmsantaanbbsr@gmail.com", expectedRole: "counselor", pinType: "staff" },
  { email: "mousamkumarp@gmail.com", expectedRole: "field_exec", pinType: "staff" },
  { email: "drpratichi@skids.health", expectedRole: "counselor", pinType: "staff" },
  { email: "swainr951@gmail.com", expectedRole: "field_exec", pinType: "staff" },
  { email: "mohanty.ritesh@gmail.com", expectedRole: "field_exec", pinType: "staff" },
  { email: "team@rabbitm.in", expectedRole: "agency_ops", pinType: "staff" },
];

async function checkUser(user) {
  const result = await client.execute({
    sql: "SELECT email, role, password FROM users WHERE email = ?",
    args: [user.email],
  });

  if (!result.rows.length) {
    return { email: user.email, status: "missing" };
  }

  const row = result.rows[0];
  const role = String(row.role || "").trim().toLowerCase();
  const passwordHash = String(row.password || "");
  const expectedPin = user.pinType === "admin" ? ADMIN_PIN : STAFF_PIN;
  const pinOk = await bcrypt.compare(expectedPin, passwordHash);
  const roleOk = role === user.expectedRole;

  return {
    email: user.email,
    status: pinOk && roleOk ? "ok" : "mismatch",
    pinOk,
    roleOk,
    role,
  };
}

async function audit() {
  console.log("🔎 Auditing CRM team logins...");
  const results = [];
  for (const user of USERS) {
    try {
      results.push(await checkUser(user));
    } catch (error) {
      results.push({ email: user.email, status: "error", error: error?.message || String(error) });
    }
  }

  const ok = results.filter((r) => r.status === "ok").length;
  const missing = results.filter((r) => r.status === "missing").length;
  const mismatch = results.filter((r) => r.status === "mismatch").length;
  const error = results.filter((r) => r.status === "error").length;

  console.log(`✅ OK: ${ok}`);
  console.log(`⚠️ Missing: ${missing}`);
  console.log(`⚠️ Mismatch: ${mismatch}`);
  console.log(`❌ Errors: ${error}`);

  results.forEach((row) => {
    if (row.status === "ok") return;
    if (row.status === "missing") {
      console.log(`- missing: ${row.email}`);
      return;
    }
    if (row.status === "mismatch") {
      console.log(`- mismatch: ${row.email} (pinOk=${row.pinOk}, roleOk=${row.roleOk}, role=${row.role})`);
      return;
    }
    console.log(`- error: ${row.email} (${row.error})`);
  });
}

audit()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Audit failed:", err);
    process.exit(1);
  });
