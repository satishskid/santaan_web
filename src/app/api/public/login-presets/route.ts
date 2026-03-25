import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { asc, ne, or, isNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  ceo: "CEO",
  crm_ops_admin: "CRM Ops Admin",
  marketing_manager: "Marketing Manager",
  agency_ops: "Agency Ops",
  performance_marketer: "Performance Marketer",
  content_manager: "Content Manager + Paid Ads",
  field_exec: "Field Executive",
  ivr_manager: "IVR / Telecalling Lead",
  telecaller_manager: "Telecaller Manager",
  telecaller: "Telecaller",
  counselor: "Counselor",
  user: "Staff",
};

function formatRoleLabel(role?: string | null) {
  const normalized = String(role || "").trim().toLowerCase();
  return ROLE_LABELS[normalized] || (normalized ? normalized.replace(/_/g, " ") : "Staff");
}

function formatPresetLabel(user: { email: string; name?: string | null; role?: string | null }) {
  const roleLabel = formatRoleLabel(user.role);
  const name = String(user.name || "").trim();
  if (name) {
    return `${roleLabel} — ${name} (${user.email})`;
  }
  return `${roleLabel} — ${user.email}`;
}

export async function GET() {
  try {
    const rows = await db
      .select({
        email: users.email,
        name: users.name,
        role: users.role,
      })
      .from(users)
      .where(or(isNull(users.role), ne(users.role, "disabled")))
      .orderBy(asc(users.role));

    const presets = rows
      .filter((row) => row.email)
      .map((row) => ({
        label: formatPresetLabel(row),
        value: row.email,
      }));

    const response = NextResponse.json({ presets });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch (_error) {
    return NextResponse.json({ presets: [] }, { status: 200 });
  }
}
