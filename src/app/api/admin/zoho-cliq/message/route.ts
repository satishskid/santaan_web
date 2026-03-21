import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAuthorizedOpsUser } from "@/lib/auth-helper";
import { postZohoCliqMessage, readZohoCliqConfig } from "@/lib/zoho-cliq";

export const runtime = "nodejs";

const SEND_ROLES = new Set([
  "admin",
  "ceo",
  "crm_ops_admin",
  "marketing_manager",
  "performance_marketer",
  "content_manager",
  "agency_ops",
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

export async function POST(req: NextRequest) {
  try {
    const { authorized, role } = await requireAccess();
    if (!authorized || !SEND_ROLES.has(role || "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = readZohoCliqConfig();
    if (!config) {
      return NextResponse.json({ error: "Zoho Cliq credentials are missing." }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as { message?: string };
    const message = String(body?.message || "").trim();
    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const result = await postZohoCliqMessage(message);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, messageId: result.messageId });
  } catch (error) {
    console.error("Zoho Cliq send error:", error);
    const message = error instanceof Error ? error.message : "Failed to send Zoho Cliq message.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
