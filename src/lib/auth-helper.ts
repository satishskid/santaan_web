import { db } from '@/lib/db';
import { admins } from '@/db/schema';
import { eq } from 'drizzle-orm';

const SUPER_ADMINS = ['satish@skids.health', 'satish.rath@gmail.com', 'demo@santaan.com'];

export async function isAuthorizedAdmin(email: string | null | undefined): Promise<boolean> {
    if (!email) return false;

    // Check hardcoded super admins first
    if (SUPER_ADMINS.includes(email)) return true;

    try {
        // Check DB for added admins
        const dbAdmin = await db.select().from(admins).where(eq(admins.email, email)).get();
        return !!dbAdmin;
    } catch (error) {
        console.error('Admin check error:', error);
        return false;
    }
}
