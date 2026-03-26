import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { isAuthorizedOpsUser } from '@/lib/auth-helper';
import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function requireOpsAccess() {
  const session = await auth();
  const authorized = await isAuthorizedOpsUser(session?.user?.email, (session?.user as any)?.role);
  return { authorized, role: (session?.user as any)?.role || 'admin' };
}

function parseId(value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

export async function POST(request: NextRequest) {
  try {
    const { authorized } = await requireOpsAccess();
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contactId, conversationText } = await request.json();
    if (!contactId || !conversationText) {
      return NextResponse.json({ error: 'contactId and conversationText required' }, { status: 400 });
    }

    const id = parseId(contactId);
    if (!id) {
      return NextResponse.json({ error: 'Invalid contactId' }, { status: 400 });
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 });
    }

    const groq = new Groq({ apiKey: GROQ_API_KEY });

    const prompt = `You are a helpful assistant analyzing sales call conversations to determine why a lead was lost and the overall sentiment.

Conversation:
"""
${conversationText}
"""

Please respond with a JSON object containing:
1. "sentiment": "positive" | "negative" | "neutral" - overall sentiment of the conversation
2. "lossReason": string - brief reason why this lead was lost (max 100 characters), or null if not lost
3. "confidence": number 0-1 - confidence in your analysis
4. "keyPhrases": string[] - 2-3 key phrases that support your conclusion

Example response format:
{"sentiment":"negative","lossReason":"Price too high","confidence":0.8,"keyPhrases":["too expensive","can't afford","price objection"]}

Respond only with the JSON object, no additional text.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a sales conversation analyst. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 200,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch {
      analysis = { sentiment: 'neutral', lossReason: null, confidence: 0, keyPhrases: [] };
    }

    // Update contact with AI insights
    const updateData: any = {};
    if (analysis.sentiment) updateData.sentiment = analysis.sentiment;
    if (analysis.lossReason) updateData.lossReason = analysis.lossReason;

    if (Object.keys(updateData).length > 0) {
      await db.update(contacts).set(updateData).where(eq(contacts.id, id));
    }

    return NextResponse.json({
      success: true,
      analysis: {
        sentiment: analysis.sentiment || 'neutral',
        lossReason: analysis.lossReason || null,
        confidence: analysis.confidence || 0,
        keyPhrases: analysis.keyPhrases || []
      }
    });

  } catch (error) {
    console.error('Lead sentiment analysis error:', error);
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
      return NextResponse.json({ error: 'contactId required' }, { status: 400 });
    }

    const id = parseId(contactId);
    if (!id) {
      return NextResponse.json({ error: 'Invalid contactId' }, { status: 400 });
    }

    const contact = await db.select({
      id: contacts.id,
      sentiment: contacts.sentiment,
      lossReason: contacts.lossReason,
      notes: contacts.notes,
      status: contacts.status
    }).from(contacts).where(eq(contacts.id, id)).get();

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      contact: {
        id: contact.id,
        sentiment: contact.sentiment,
        lossReason: contact.lossReason,
        notes: contact.notes,
        status: contact.status
      }
    });

  } catch (error) {
    console.error('Get lead analysis error:', error);
    return NextResponse.json({ error: 'Failed to retrieve analysis' }, { status: 500 });
  }
}