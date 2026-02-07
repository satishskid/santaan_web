
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { isAuthorizedAdmin } from '@/lib/auth-helper';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await auth();
        const isAuth = await isAuthorizedAdmin(session?.user?.email);
        if (!isAuth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const allSettings = await db.select().from(settings);
        // Convert array to object for easier frontend consumption
        const settingsMap = allSettings.reduce((acc: Record<string, string>, curr: { key: string; value: string }) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(settingsMap);
    } catch (error) {
        console.error('Failed to fetch settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        const isAuth = await isAuthorizedAdmin(session?.user?.email);
        if (!isAuth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { key, value } = body;

        if (!key || value === undefined) {
            return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
        }

        await db.insert(settings)
            .values({ key, value })
            .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date().toISOString() } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update settings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
