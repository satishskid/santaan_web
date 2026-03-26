import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { isAuthorizedOpsUser } from '@/lib/auth-helper';
import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;

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

        const body = await request.json();
        const { contactId, conversationText } = body;

        if (!contactId || !conversationText) {
            return NextResponse.json({ error: 'Missing contactId or conversationText' }, { status: 400 });
        }

        if (!GROQ_API_KEY) {
            return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 });
        }

        const groq = new Groq({ apiKey: GROQ_API_KEY });

        const prompt = `Analyze this customer conversation and provide:
1. Sentiment (positive/negative/neutral)
2. Loss reason if applicable (price/distance/service/quality/competitor/other)
3. Confidence score (0-100)

Conversation:
${conversationText}

Respond in JSON format:
{
  "sentiment": "positive|negative|neutral",
  "lossReason": "price|distance|service|quality|competitor|other|null",
  "confidence": 85,
  "explanation": "Brief explanation of analysis"
}`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are a CRM AI assistant that analyzes customer conversations to determine sentiment and reasons for lead loss. Return ONLY valid JSON and nothing else.' },
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 300,
                response_format: { type: 'json_object' }
            });

        const responseText = completion.choices[0]?.message?.content || '{}';
        let analysis;
        
        try {
            analysis = JSON.parse(responseText);
        } catch {
            analysis = {
                sentiment: 'neutral',
                lossReason: null,
                confidence: 0,
                explanation: 'Could not parse AI response'
            };
        }

        // Update contact with AI analysis
        const updateData: any = {};
        if (analysis.sentiment) updateData.sentiment = analysis.sentiment;
        if (analysis.lossReason) updateData.lossReason = analysis.lossReason;

        if (Object.keys(updateData).length > 0) {
            await db.update(contacts).set(updateData).where(eq(contacts.id, contactId));
        }

        return NextResponse.json({
            success: true,
            analysis: {
                sentiment: analysis.sentiment || 'neutral',
                lossReason: analysis.lossReason || null,
                confidence: analysis.confidence || 0,
                explanation: analysis.explanation || 'Analysis completed'
            }
        });

    } catch (error) {
        console.error('AI sentiment analysis error:', error);
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
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
            return NextResponse.json({ error: 'Missing contactId' }, { status: 400 });
        }

        const contact = await db.select({
            id: contacts.id,
            sentiment: contacts.sentiment,
            lossReason: contacts.lossReason,
            notes: contacts.notes,
            status: contacts.status
        }).from(contacts).where(eq(contacts.id, parseInt(contactId))).get();

        if (!contact) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                sentiment: contact.sentiment,
                lossReason: contact.lossReason
            }
        });

    } catch (error) {
 console.error('Get AI analysis error:', error);
        return NextResponse.json({ error: 'Failed to retrieve analysis' }, { status: 500 });
    }
}