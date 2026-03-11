import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAuthorizedAdmin, isAuthorizedOpsUser } from "@/lib/auth-helper";
import { getGoogleBusinessDebugInfo } from "@/lib/google-business-profile";

export const runtime = "nodejs";

const READ_ROLES = new Set(["admin", "ceo", "crm_ops_admin", "agency_ops", "marketing_manager", "performance_marketer"]);

function normalizeRole(value?: string | null) {
  return String(value || "").trim().toLowerCase();
}

async function canReadDebug() {
  const session = await auth();
  const role = normalizeRole((session?.user as { role?: string } | undefined)?.role);

  if (role && READ_ROLES.has(role)) return true;
  const opsAccess = await isAuthorizedOpsUser(session?.user?.email, role || null);
  if (opsAccess && (!role || READ_ROLES.has(role))) return true;
  return isAuthorizedAdmin(session?.user?.email);
}

export async function GET() {
  if (!(await canReadDebug())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const debug = await getGoogleBusinessDebugInfo();
  return NextResponse.json({
    success: debug.configured,
    checkedAt: new Date().toISOString(),
    ...debug,
  });
}
