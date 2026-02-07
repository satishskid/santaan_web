import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const SUPER_ADMINS = ['satish@skids.health', 'satish.rath@gmail.com', 'demo@santaan.com'];

export async function isAuthorizedAdmin(email: string | null | undefined): Promise<boolean> {
    if (!email) return false;

    // Check hardcoded super admins first
    if (SUPER_ADMINS.includes(email)) return true;

    try {
        // Check DB for users with admin role
        const dbUser = await db.select().from(users).where(eq(users.email, email)).get();
        return dbUser?.role === 'admin';
    } catch (error) {
        console.error('Admin check error:', error);
        return false;
    }
}
