import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { admins, users } from '@/db/schema';
import { auth } from '@/auth';
import { isAuthorizedAdmin } from '@/lib/auth-helper';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        const session = await auth();
        if (!await isAuthorizedAdmin(session?.user?.email)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const team = await db.select().from(admins);
        return NextResponse.json({ admins: team });
    } catch (_error) {
        return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!await isAuthorizedAdmin(session?.user?.email)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { email } = await request.json();
        if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

        const trimmedEmail = email.trim().toLowerCase();

        // Check if already exists
        const existing = await db.select().from(admins).where(eq(admins.email, trimmedEmail)).get();
        if (existing) return NextResponse.json({ error: 'Admin already exists' }, { status: 409 });

        // Keep user role and admin registry aligned
        await db.update(users).set({ role: 'admin' }).where(eq(users.email, trimmedEmail));
        const newAdmin = await db.insert(admins).values({ email: trimmedEmail }).returning();
        return NextResponse.json({ success: true, admin: newAdmin[0] });

    } catch (_error) {
        return NextResponse.json({ error: 'Failed to add admin' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth();
        if (!await isAuthorizedAdmin(session?.user?.email)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

        const normalizedEmail = email.trim().toLowerCase();
        await db.delete(admins).where(eq(admins.email, normalizedEmail));
        await db.update(users).set({ role: 'user' }).where(eq(users.email, normalizedEmail));
        return NextResponse.json({ success: true });

    } catch (_error) {
        return NextResponse.json({ error: 'Failed to remove admin' }, { status: 500 });
    }
}
