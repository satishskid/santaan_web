import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { settings } from "@/db/schema";
import { isAuthorizedAdmin, isAuthorizedOpsUser } from "@/lib/auth-helper";

const GOOGLE_AUTO_SYNC_STATUS_KEY = "google_auto_sync_status";
const READ_ROLES = new Set([
  "admin",
  "ceo",
  "crm_ops_admin",
  "agency_ops",
  "marketing_manager",
  "performance_marketer",
]);

function normalizeRole(value?: string | null) {
  return String(value || "").trim().toLowerCase();
}

async function canReadStatus() {
  const session = await auth();
  const role = normalizeRole((session?.user as { role?: string } | undefined)?.role);
  if (role && READ_ROLES.has(role)) return true;

  const opsAccess = await isAuthorizedOpsUser(session?.user?.email, role || null);
  if (opsAccess && (!role || READ_ROLES.has(role))) return true;

  return isAuthorizedAdmin(session?.user?.email);
}

export async function GET() {
  if (!(await canReadStatus())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const row = await db
    .select({ value: settings.value, updatedAt: settings.updatedAt })
    .from(settings)
    .where(eq(settings.key, GOOGLE_AUTO_SYNC_STATUS_KEY))
    .get();

  let status = null;
  if (row?.value) {
    try {
      status = JSON.parse(row.value);
    } catch {
      status = null;
    }
  }

  return NextResponse.json({
    success: true,
    schedule: {
      cron: "45 3 * * *",
      timezone: "Asia/Kolkata",
      label: "Daily 09:15 AM IST",
    },
    google: status,
    updatedAt: row?.updatedAt || null,
  });
}

