import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/db/schema';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { intent, phone, utmSource, utmMedium, utmCampaign } = body;

        // Create a contact entry for tracking call intent
        await db.insert(contacts).values({
            name: 'At-Home Test Caller',
            email: `caller_${Date.now()}@pending.santaan.in`,
            phone: phone || '+918971234567',
            message: `Clicked "Call Now" for ${intent || 'at-home fertility testing'}`,
            utmSource: utmSource || 'direct',
            utmMedium: utmMedium || 'website',
            utmCampaign: utmCampaign || 'home_testing',
            utmContent: intent || 'at_home_fertility_test',
            utmTerm: 'call_button',
            submittedAt: Date.now(),
        });

        return NextResponse.json({ 
            success: true,
            message: 'Call intent tracked'
        });
    } catch (error) {
        console.error('Error tracking call intent:', error);
        return NextResponse.json(
            { error: 'Failed to track call intent' },
            { status: 500 }
        );
    }
}
