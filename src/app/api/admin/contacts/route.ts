import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { auth } from '@/auth';
import { eq } from 'drizzle-orm';

import { isAuthorizedOpsUser } from '@/lib/auth-helper';
import { emitMetaSignalsForContactChange } from '@/lib/meta-conversions';

export const runtime = 'nodejs';

const CREATE_ROLES = new Set([
    'admin',
    'ceo',
    'crm_ops_admin',
    'ivr_manager',
    'telecaller_manager',
    'telecaller',
    'counselor',
]);

function normalizeRole(role?: string | null) {
    return String(role || '').trim().toLowerCase();
}

async function requireOpsAccess() {
    const session = await auth();
    const sessionRole = normalizeRole((session?.user as { role?: string } | undefined)?.role);
    const authorized = await isAuthorizedOpsUser(session?.user?.email, sessionRole);
    const role = sessionRole || 'admin';
    return { authorized, role };
}

export async function GET() {
    try {
        const { authorized } = await requireOpsAccess();
        if (!authorized) {
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
        const { authorized, role } = await requireOpsAccess();
        if (!authorized || !CREATE_ROLES.has(role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const name = String(body?.name || '').trim();
        const phone = String(body?.phone || '').trim();
        const cleanPhone = phone.replace(/\D/g, '');
        const emailInput = String(body?.email || '').trim().toLowerCase();
        const email = emailInput || (cleanPhone ? `no-email-${cleanPhone.slice(-10)}@santaan.in` : '');

        if (!name || (!email && !phone)) {
            return NextResponse.json({ error: 'Name and at least one of Email or Phone are required' }, { status: 400 });
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
                phone: phone || null,
                role: body?.role ? String(body.role) : 'Patient',
                status: body?.status ? String(body.status) : 'New',
            })
            .returning();

        if (created[0]) {
            try {
                await emitMetaSignalsForContactChange({ before: null, after: created[0] });
            } catch (signalError) {
                console.error('Meta signal emission on contact create failed:', signalError);
            }
        }

        return NextResponse.json({ success: true, contact: created[0] }, { status: 201 });
    } catch (error) {
        console.error('Create contact error:', error);
        return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
    }
}
