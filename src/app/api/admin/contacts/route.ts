import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { auth } from '@/auth';

import { isAuthorizedAdmin } from '@/lib/auth-helper';

export async function GET() {
    try {
        // Protect this route
        const session = await auth();
        if (!await isAuthorizedAdmin(session?.user?.email)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const allContacts = await db.select().from(contacts).orderBy(desc(contacts.createdAt));

        return NextResponse.json({ contacts: allContacts });
    } catch (error) {
        console.error('Fetch contacts error:', error);
        return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }
}
