import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { isAuthorizedOpsUser } from '@/lib/auth-helper';
import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export const runtime = 'nodejs';

async function requireOpsAccess() {
    const session = await auth();
    const sessionRole = String((session?.user as { role?: string } | undefined)?.role || '').trim().toLowerCase();
    const authorized = await isAuthorizedOpsUser(session?.user?.email, sessionRole);
    return { authorized, role: sessionRole };
}

export async function POST(request: NextRequest) {
    try {
        const { authorized } = await requireOpsAccess();
        if (!authorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!GROQ_API_KEY) {
            return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 });
        }

        const { contactId } = await request.json();
        if (!contactId) {
            return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
        }

        const contact = await db.select().from(contacts).where(eq(contacts.id, contactId)).get();
        if (!contact) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
        }

        const conversationContext = [
            contact.message,
            contact.notes,
            contact.neodoveDisposeReason,
            contact.neodoveDisposition,
            contact.neodoveRawStatus,
            contact.status
        ].filter(Boolean).join('\n');

        if (!conversationContext.trim()) {
            return NextResponse.json({ 
                error: 'No conversation data available for analysis',
                sentiment: 'neutral',
                lossReason: 'insufficient_data'
            }, { status: 400 });
        }

        const groq = new Groq({ apiKey: GROQ_API_KEY });
        
        const prompt = `Analyze this lead conversation and determine:
1. Overall sentiment (positive, negative, neutral)
2. If lost, the specific reason (price, distance, timing, competitor, service_quality, trust, other)

Conversation:
${conversationContext}

Respond in JSON format:
{
  "sentiment": "positive|negative|neutral",
  "lossReason": "price|distance|timing|competitor|service_quality|trust|other|null",
  "confidence": 0.0-1.0,
  "explanation": "Brief explanation of the analysis"
}

Only return the JSON object, no additional text.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 200,
        });

        const responseText = completion.choices[0]?.message?.content || '';
        let analysis;
        
        try {
            analysis = JSON.parse(responseText);
        } catch {
            return NextResponse.json({ 
                error: 'Failed to parse AI response',
                rawResponse: responseText 
            }, { status: 500 });
        }

        const updateData = {
            sentiment: analysis.sentiment || 'neutral',
            lossReason: analysis.lossReason || null,
        };

        await db.update(contacts)
            .set(updateData)
            .where(eq(contacts.id, contactId));

        return NextResponse.json({
            success: true,
            contactId,
            analysis: {
                ...analysis,
                updatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Sentiment analysis error:', error);
        return NextResponse.json({ 
            error: 'Failed to analyze sentiment',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { authorized } = await requireOpsAccess();
        if (!authorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const contactId = searchParams.get('contactId');
        
        if (!contactId) {
            return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
        }

        const contact = await db.select().from(contacts).where(eq(contacts.id, parseInt(contactId))).get();
        if (!contact) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            contactId: parseInt(contactId),
            sentiment: contact.sentiment,
            lossReason: contact.lossReason,
            lastAnalyzed: contact.createdAt
        });

    } catch (error) {
        console.error('Get sentiment error:', error);
        return NextResponse.json({ 
            error: 'Failed to retrieve sentiment analysis',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}