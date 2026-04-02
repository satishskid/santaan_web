import { db } from '@/lib/db';
import { admins, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hasLeadershipRole, hasOpsRole, isSuperAdminEmail, normalizeAccessEmail, normalizeAccessRole } from '@/lib/access-control';

export async function isAuthorizedAdmin(email: string | null | undefined): Promise<boolean> {
    if (!email) return false;
    const normalizedEmail = normalizeAccessEmail(email);

    // Check hardcoded super admins first
    if (isSuperAdminEmail(normalizedEmail)) return true;

    try {
        // Check users table role
        const dbUser = await db.select().from(users).where(eq(users.email, normalizedEmail)).get();
        if (dbUser?.role === 'admin') return true;

        // Check admin registry table
        const dbAdmin = await db.select().from(admins).where(eq(admins.email, normalizedEmail)).get();
        return Boolean(dbAdmin);
    } catch (error) {
        console.error('Admin check error:', error);
        return false;
    }
}

export async function isAuthorizedLeadership(
    email: string | null | undefined,
    sessionRole?: string | null | undefined
): Promise<boolean> {
    if (!email) return false;
    const normalizedEmail = normalizeAccessEmail(email);

    if (isSuperAdminEmail(normalizedEmail)) return true;
    if (hasLeadershipRole(sessionRole)) return true;

    try {
        const dbUser = await db.select().from(users).where(eq(users.email, normalizedEmail)).get();
        if (hasLeadershipRole(dbUser?.role)) return true;

        const dbAdmin = await db.select().from(admins).where(eq(admins.email, normalizedEmail)).get();
        return Boolean(dbAdmin);
    } catch (error) {
        console.error('Leadership check error:', error);
        return false;
    }
}

export async function isAuthorizedOpsUser(
    email: string | null | undefined,
    sessionRole?: string | null | undefined
): Promise<boolean> {
    if (!email) return false;
    const normalizedEmail = normalizeAccessEmail(email);

    if (isSuperAdminEmail(normalizedEmail)) return true;
    if (hasOpsRole(sessionRole)) return true;

    try {
        const dbUser = await db.select().from(users).where(eq(users.email, normalizedEmail)).get();
        if (hasOpsRole(dbUser?.role)) return true;

        const dbAdmin = await db.select().from(admins).where(eq(admins.email, normalizedEmail)).get();
        return Boolean(dbAdmin);
    } catch (error) {
        console.error('Ops auth check error:', error);
        return false;
    }
}

const VOICE_OPS_EDITOR_ROLES = new Set(['ivr_manager', 'telecaller_manager']);

export async function isAuthorizedVoiceOpsEditor(
    email: string | null | undefined,
    sessionRole?: string | null | undefined
): Promise<boolean> {
    if (!email) return false;
    const normalizedEmail = normalizeAccessEmail(email);
    const normalizedRole = normalizeAccessRole(sessionRole);

    if (isSuperAdminEmail(normalizedEmail)) return true;
    if (hasLeadershipRole(normalizedRole) || VOICE_OPS_EDITOR_ROLES.has(normalizedRole)) return true;

    try {
        const dbUser = await db.select().from(users).where(eq(users.email, normalizedEmail)).get();
        const dbRole = normalizeAccessRole(dbUser?.role);
        if (hasLeadershipRole(dbRole) || VOICE_OPS_EDITOR_ROLES.has(dbRole)) return true;

        const dbAdmin = await db.select().from(admins).where(eq(admins.email, normalizedEmail)).get();
        return Boolean(dbAdmin);
    } catch (error) {
        console.error('Voice ops auth check error:', error);
        return false;
    }
}
