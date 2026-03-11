import { db } from '@/lib/db';
import { admins, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const SUPER_ADMINS = ['satish@skids.health', 'satish.rath@gmail.com', 'demo@santaan.com'];
const OPS_ROLES = new Set([
    'admin',
    'ceo',
    'crm_ops_admin',
    'marketing_manager',
    'agency_ops',
    'performance_marketer',
    'content_writer',
    'social_media_exec',
    'field_exec',
    'ivr_manager',
    'telecaller_manager',
    'telecaller',
    'counselor',
]);

function hasOpsRole(role?: string | null) {
    if (!role) return false;
    return OPS_ROLES.has(role.trim().toLowerCase());
}

export async function isAuthorizedAdmin(email: string | null | undefined): Promise<boolean> {
    if (!email) return false;
    const normalizedEmail = email.trim().toLowerCase();

    // Check hardcoded super admins first
    if (SUPER_ADMINS.includes(normalizedEmail)) return true;

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

export async function isAuthorizedOpsUser(
    email: string | null | undefined,
    sessionRole?: string | null | undefined
): Promise<boolean> {
    if (!email) return false;
    const normalizedEmail = email.trim().toLowerCase();

    if (SUPER_ADMINS.includes(normalizedEmail)) return true;
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
