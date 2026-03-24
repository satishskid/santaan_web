import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAuthorizedAdmin } from "@/lib/auth-helper";

const SPEND_ROLES = new Set([
  "admin",
  "ceo",
  "crm_ops_admin",
  "marketing_manager",
  "agency_ops",
  "performance_marketer",
]);

function normalizeRole(value?: string | null) {
  return String(value || "").trim().toLowerCase();
}

export async function requireSpendAccess() {
  const session = await auth();
  const email = session?.user?.email ? String(session.user.email).trim().toLowerCase() : "";
  const sessionRole = normalizeRole((session?.user as { role?: string } | undefined)?.role);

  if (email && (await isAuthorizedAdmin(email))) {
    return { authorized: true, role: sessionRole || "admin" };
  }

  if (sessionRole && SPEND_ROLES.has(sessionRole)) {
    return { authorized: true, role: sessionRole };
  }

  if (email) {
    const dbUser = await db.select().from(users).where(eq(users.email, email)).get();
    const dbRole = normalizeRole(dbUser?.role);
    if (dbRole && SPEND_ROLES.has(dbRole)) {
      return { authorized: true, role: dbRole };
    }
  }

  return { authorized: false, role: sessionRole };
}
