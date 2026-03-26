import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { isAuthorizedOpsUser } from '@/lib/auth-helper';
import Groq from 'groq-sdk';

export const runtime = 'nodejs';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function requireOpsAccess() {
  const session = await auth();
  const sessionRole = String((session?.user as { role?: string } | undefined)?.role || '').trim().toLowerCase();
  const authorized = await isAuthorizedOpsUser(session?.user?.email, sessionRole);
  return { authorized, role: sessionRole };
}

function normalizeRole(role?: string | null) {
  return String(role || '').trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, role } = await requireOpsAccess();
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contactId } = body;

    if (!contactId) {
      return NextResponse.json({ error: 'contactId is required' }, { status: 400 });
    }

    const contact = await db.select().from(contacts).where(eq(contacts.id, contactId)).get();
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 });
    }

    const groq = new Groq({ apiKey: GROQ_API_KEY });

    const prompt = `Analyze this lead interaction and determine the sentiment and reason for loss if applicable:

Contact Information:
Name: ${contact.name}
Email: ${contact.email}
Phone: ${contact.phone}
Status: ${contact.status}
Lead Score: ${contact.leadScore}
Notes: ${contact.notes || 'No notes available'}
Last Contact: ${contact.lastContact}

Please provide:
1. Overall sentiment (positive, negative, neutral)
2. If status is 'lost', provide the most likely reason for loss from these categories:
   - Price objection
   - Distance/location issue
   - Wrong number/invalid contact
   - Not interested
   - Competitor chosen
   - Timing not right
   - Other (specify)
3. Brief explanation of your analysis

Respond in JSON format:
{
  "sentiment": "positive|negative|neutral",
  "lossReason": "category or null",
  "explanation": "brief explanation"
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a CRM analyst specializing in lead qualification and sentiment analysis. Provide concise, actionable insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 300,
                response_format: { type: 'json_object' }
            });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      return NextResponse.json({ error: 'No response from Groq' }, { status: 500 });
    }

    let analysis;
    try {
      analysis = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('Failed to parse Groq response:', responseContent);
      return NextResponse.json({ error: 'Invalid response format from Groq' }, { status: 500 });
    }

    await db.update(contacts)
      .set({
        sentiment: analysis.sentiment,
        lossReason: analysis.lossReason,
      })
      .where(eq(contacts.id, contactId));

    return NextResponse.json({
      success: true,
      analysis: {
        sentiment: analysis.sentiment,
        lossReason: analysis.lossReason,
        explanation: analysis.explanation,
      }
    });

  } catch (error) {
    console.error('Lead analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze lead' }, { status: 500 });
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
      return NextResponse.json({ error: 'contactId is required' }, { status: 400 });
    }

    const contact = await db.select({
      id: contacts.id,
      sentiment: contacts.sentiment,
      lossReason: contacts.lossReason,
    }).from(contacts).where(eq(contacts.id, parseInt(contactId))).get();

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      analysis: {
        sentiment: contact.sentiment,
        lossReason: contact.lossReason,
      }
    });

  } catch (error) {
    console.error('Get lead analysis error:', error);
    return NextResponse.json({ error: 'Failed to get lead analysis' }, { status: 500 });
  }
}