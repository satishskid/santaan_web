import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { isAuthorizedOpsUser } from '@/lib/auth-helper';
import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

function normalizeRole(role?: string | null) {
  return String(role || '').trim().toLowerCase();
}

async function requireOpsAccess() {
  const session = await auth();
  const sessionRole = normalizeRole((session?.user as { role?: string } | undefined)?.role);
  const authorized = await isAuthorizedOpsUser(session?.user?.email, sessionRole);
  return { authorized, role: sessionRole };
}

const SYSTEM_PROMPT = `You are an AI assistant that analyzes lead interactions to determine sentiment and reasons for lead loss.

Given a lead's notes and conversation history, provide:
1. Sentiment: "positive", "negative", or "neutral"
2. Loss Reason: A concise explanation of why this lead was lost (if applicable)

Respond in JSON format:
{
  "sentiment": "positive|negative|neutral",
  "lossReason": "reason for loss or null",
  "confidence": 0.0-1.0
}

Examples:
- "Price too high" → {"sentiment": "negative", "lossReason": "Price objection", "confidence": 0.9}
- "Not interested" → {"sentiment": "negative", "lossReason": "Lack of interest", "confidence": 0.8}
- "Call me next week" → {"sentiment": "neutral", "lossReason": null, "confidence": 0.7}`;

export async function POST(request: NextRequest) {
  try {
    const { authorized } = await requireOpsAccess();
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { contactId, notes } = body;

    if (!contactId || !notes) {
      return NextResponse.json({ error: 'contactId and notes are required' }, { status: 400 });
    }

    const groq = new Groq({ apiKey: GROQ_API_KEY });
    
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analyze this lead interaction: "${notes}"` }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.3,
      max_tokens: 150,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      return NextResponse.json({ error: 'No response from Groq' }, { status: 500 });
    }

    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch {
      // Fallback parsing if JSON is malformed
      const sentimentMatch = responseText.match(/"sentiment":\s*"(\w+)"/);
      const lossReasonMatch = responseText.match(/"lossReason":\s*"([^"]*)"/);
      const confidenceMatch = responseText.match(/"confidence":\s*([\d.]+)/);
      
      analysis = {
        sentiment: sentimentMatch?.[1] || 'neutral',
        lossReason: lossReasonMatch?.[1] || null,
        confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5
      };
    }

    // Update contact with AI insights
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
        confidence: analysis.confidence
      }
    });

  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze sentiment' }, { status: 500 });
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
      notes: contacts.notes,
      status: contacts.status,
    })
    .from(contacts)
    .where(eq(contacts.id, parseInt(contactId)))
    .get();

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        sentiment: contact.sentiment,
        lossReason: contact.lossReason,
        notes: contact.notes,
        status: contact.status,
      }
    });

  } catch (error) {
    console.error('Get sentiment data error:', error);
    return NextResponse.json({ error: 'Failed to get sentiment data' }, { status: 500 });
  }
}