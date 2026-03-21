import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAuthorizedOpsUser } from "@/lib/auth-helper";
import { listMetaAudienceStatus, syncMetaAudiences } from "@/lib/meta-audiences";

export const runtime = "nodejs";

const READ_ROLES = new Set([
  "admin",
  "ceo",
  "crm_ops_admin",
  "marketing_manager",
  "agency_ops",
  "performance_marketer",
  "content_manager",
]);

function normalizeRole(role?: string | null) {
  return String(role || "").trim().toLowerCase();
}

async function requireAccess() {
  const session = await auth();
  const role = normalizeRole((session?.user as { role?: string } | undefined)?.role);
  const authorized = await isAuthorizedOpsUser(session?.user?.email, role);
  return { authorized, role };
}

export async function GET() {
  try {
    const { authorized, role } = await requireAccess();
    if (!authorized || !READ_ROLES.has(role || "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = await listMetaAudienceStatus();
    return NextResponse.json({ ok: true, ...status });
  } catch (error) {
    console.error("Meta audiences status error:", error);
    return NextResponse.json({ error: "Failed to load Meta audience status" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, role } = await requireAccess();
    if (!authorized || !READ_ROLES.has(role || "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as { mode?: "all" | "qualified" | "converted" };
    const mode = body?.mode || "all";
    const results = await syncMetaAudiences(mode);
    return NextResponse.json({ ok: true, results });
  } catch (error) {
    console.error("Meta audience sync error:", error);
    const message = error instanceof Error ? error.message : "Meta audience sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
