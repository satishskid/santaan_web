import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAuthorizedOpsUser } from "@/lib/auth-helper";
import { loadCrmHealthSnapshot } from "@/lib/crm-health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const READ_ROLES = new Set([
  "admin",
  "ceo",
  "crm_ops_admin",
  "marketing_manager",
  "agency_ops",
  "performance_marketer",
  "ivr_manager",
  "telecaller_manager",
  "content_manager",
]);

function normalizeRole(role?: string | null) {
  return String(role || "").trim().toLowerCase();
}

export async function GET() {
  try {
    const session = await auth();
    const role = normalizeRole((session?.user as { role?: string } | undefined)?.role);
    const authorized = await isAuthorizedOpsUser(session?.user?.email, role);

    if (!authorized || !READ_ROLES.has(role || "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await loadCrmHealthSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("CRM health route error:", error);
    return NextResponse.json({ error: "Failed to load CRM health" }, { status: 500 });
  }
}
