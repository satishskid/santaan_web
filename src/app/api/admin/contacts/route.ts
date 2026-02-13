import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { auth } from '@/auth';
import { eq } from 'drizzle-orm';

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

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!await isAuthorizedAdmin(session?.user?.email)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const name = String(body?.name || '').trim();
        const email = String(body?.email || '').trim().toLowerCase();

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 });
        }

        const existing = await db.select().from(contacts).where(eq(contacts.email, email)).get();
        if (existing) {
            return NextResponse.json({ error: 'A contact with this email already exists' }, { status: 409 });
        }

        const created = await db
            .insert(contacts)
            .values({
                name,
                email,
                phone: body?.phone ? String(body.phone) : null,
                role: body?.role ? String(body.role) : 'Patient',
                status: body?.status ? String(body.status) : 'New',
            })
            .returning();

        return NextResponse.json({ success: true, contact: created[0] }, { status: 201 });
    } catch (error) {
        console.error('Create contact error:', error);
        return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
    }
}
