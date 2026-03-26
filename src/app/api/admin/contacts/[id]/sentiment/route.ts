import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { isAuthorizedOpsUser } from '@/lib/auth-helper';
import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;

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

function parseId(value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

async function analyzeLeadSentiment(notes: string, status: string): Promise<{ sentiment: string; lossReason: string | null }> {
  if (!GROQ_API_KEY) {
    console.warn('Groq API key not found. Skipping AI analysis.');
    return { sentiment: 'neutral', lossReason: null };
  }

  const groq = new Groq({
    apiKey: GROQ_API_KEY,
    dangerouslyAllowBrowser: false
  });

  const prompt = `You are a CRM lead sentiment analyst. Analyze the following lead notes and status to determine:
1. Overall sentiment (positive, negative, neutral)
2. If the lead was lost, identify the specific reason

Lead Notes: "${notes}"
Lead Status: ${status}

Respond in this exact JSON format:
{
  "sentiment": "positive|negative|neutral",
  "lossReason": "Price|Distance|Wrong Number|Not Interested|Other|None"
}

Only use the exact values provided. If not lost, set lossReason to "None".`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 150,
    });

    const response = completion.choices[0]?.message?.content || '{"sentiment":"neutral","lossReason":"None"}';
    
    try {
      const parsed = JSON.parse(response);
      return {
        sentiment: parsed.sentiment || 'neutral',
        lossReason: parsed.lossReason === 'None' ? null : parsed.lossReason
      };
    } catch {
      // Fallback if JSON parsing fails
      const sentiment = response.includes('positive') ? 'positive' : 
                       response.includes('negative') ? 'negative' : 'neutral';
      const lossReason = response.includes('Price') ? 'Price' :
                        response.includes('Distance') ? 'Distance' :
                        response.includes('Wrong Number') ? 'Wrong Number' :
                        response.includes('Not Interested') ? 'Not Interested' :
                        response.includes('Other') ? 'Other' : null;
      
      return { sentiment, lossReason };
    }
  } catch (error) {
    console.error('Groq API error:', error);
    return { sentiment: 'neutral', lossReason: null };
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { authorized, role } = await requireOpsAccess();
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: idParam } = await context.params;
    const id = parseId(idParam);
    if (!id) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const contact = await db.select().from(contacts).where(eq(contacts.id, id)).get();
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Analyze sentiment and loss reason
    const analysis = await analyzeLeadSentiment(contact.notes || '', contact.status || '');

    // Update contact with AI insights
    const updated = await db
      .update(contacts)
      .set({
        sentiment: analysis.sentiment,
        lossReason: analysis.lossReason,
      })
      .where(eq(contacts.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      contact: updated[0],
      analysis: {
        sentiment: analysis.sentiment,
        lossReason: analysis.lossReason,
      }
    });

  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze sentiment' }, { status: 500 });
  }
}