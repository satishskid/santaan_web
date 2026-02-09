import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/db/schema';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, question, score, signal, utm } = body;

        // Simple validation
        if (!name || !email) {
            return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 });
        }

        const newContact = await db.insert(contacts).values({
            name,
            email,
            phone,
            seminarRegistered: true,
            seminarScore: score,
            seminarSignal: signal,
            seminarQuestion: question,
            status: 'New',
            role: 'Lead',
            utmSource: utm?.utm_source,
            utmMedium: utm?.utm_medium,
            utmCampaign: utm?.utm_campaign,
            utmTerm: utm?.utm_term,
            utmContent: utm?.utm_content,
            landingPath: utm?.landing_path,
        }).returning();

        return NextResponse.json({
            success: true,
            message: 'Registration successful',
            contact: newContact[0]
        });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
    }
}
