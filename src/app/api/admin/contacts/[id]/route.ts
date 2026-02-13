import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { isAuthorizedAdmin } from '@/lib/auth-helper';

function parseId(value: string) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) return null;
    return id;
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!await isAuthorizedAdmin(session?.user?.email)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: idParam } = await context.params;
        const id = parseId(idParam);
        if (!id) {
            return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
        }

        const body = await request.json();

        type ContactInsert = typeof contacts.$inferInsert;
        const update: Partial<ContactInsert> = {};

        const allowedFields: (keyof ContactInsert)[] = [
            'name',
            'email',
            'phone',
            'role',
            'status',
            'lastContact',
            'seminarRegistered',
            'seminarScore',
            'seminarSignal',
            'seminarQuestion',
            'newsletterSubscribed',
            'whatsappNumber',
            'whatsappOptIn',
            'telegramId',
            'telegramUsername',
            'telegramOptIn',
            'preferredChannel',
            'tags',
            'leadSource',
            'leadScore',
            'message',
            'utmSource',
            'utmMedium',
            'utmCampaign',
            'utmTerm',
            'utmContent',
            'landingPath',
            'lastMessageAt',
            'conversationCount',
            'submittedAt',
        ];

        for (const key of allowedFields) {
            if (body?.[key] !== undefined) {
                update[key] = body[key];
            }
        }

        if (Object.keys(update).length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        if (update.email) {
            update.email = String(update.email).trim().toLowerCase();
        }
        if (update.name) {
            update.name = String(update.name).trim();
        }
        if (update.phone) {
            update.phone = String(update.phone);
        }

        const updated = await db.update(contacts).set(update).where(eq(contacts.id, id)).returning();
        if (!updated[0]) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, contact: updated[0] });
    } catch (error) {
        console.error('Update contact error:', error);
        return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!await isAuthorizedAdmin(session?.user?.email)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: idParam } = await context.params;
        const id = parseId(idParam);
        if (!id) {
            return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
        }

        await db.delete(contacts).where(eq(contacts.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete contact error:', error);
        return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
    }
}
