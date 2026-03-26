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
  const role = sessionRole || 'admin';
  return { authorized, role };
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

    const body = await request.json();
    const { contactId } = body;

    if (!contactId) {
      return NextResponse.json({ error: 'contactId is required' }, { status: 400 });
    }

    const id = parseId(contactId);
    if (!id) {
      return NextResponse.json({ error: 'Invalid contactId' }, { status: 400 });
    }

    const contact = await db.select().from(contacts).where(eq(contacts.id, id)).get();
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 });
    }

    const groq = new Groq({ apiKey: GROQ_API_KEY });

    const prompt = `Analyze this lead interaction and determine the sentiment and reason for loss. 

Contact Details:
Name: ${contact.name}
Email: ${contact.email}
Phone: ${contact.phone}
Status: ${contact.status}
Lead Score: ${contact.leadScore}
Notes: ${contact.notes || 'No notes available'}
Last Contact: ${contact.lastContact}

Based on the available information, provide:
1. Overall sentiment (positive, negative, neutral)
2. Primary reason for lead loss if status is 'lost' (price, distance, timing, competition, etc.)
3. Confidence level (high, medium, low)
4. Brief explanation

Respond in JSON format:
{
  "sentiment": "positive|negative|neutral",
  "lossReason": "price|distance|timing|competition|service_quality|other|unknown",
  "confidence": "high|medium|low",
  "explanation": "Brief explanation of the analysis"
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a CRM analyst expert at determining why leads are lost. Analyze the provided contact data and give concise, actionable insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.3,
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    let analysis;
    
    try {
      analysis = JSON.parse(responseText);
    } catch {
      analysis = {
        sentiment: 'unknown',
        lossReason: 'unknown',
        confidence: 'low',
        explanation: 'Could not parse AI response'
      };
    }

    await db.update(contacts)
      .set({
        sentiment: analysis.sentiment,
        lossReason: analysis.lossReason,
      })
      .where(eq(contacts.id, id));

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        contactId: id
      }
    });

  } catch (error) {
    console.error('Lead loss analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze lead loss' }, { status: 500 });
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

    const id = parseId(contactId);
    if (!id) {
      return NextResponse.json({ error: 'Invalid contactId' }, { status: 400 });
    }

    const contact = await db.select({
      id: contacts.id,
      name: contacts.name,
      status: contacts.status,
      sentiment: contacts.sentiment,
      lossReason: contacts.lossReason,
      notes: contacts.notes,
      leadScore: contacts.leadScore
    }).from(contacts).where(eq(contacts.id, id)).get();

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      contact
    });

  } catch (error) {
    console.error('Get lead analysis error:', error);
    return NextResponse.json({ error: 'Failed to get lead analysis' }, { status: 500 });
  }
}