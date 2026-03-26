import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { contacts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Helper to check if user has analytics access
async function requireAnalyticsAccess() {
  const session = await auth();
  const role = String((session?.user as { role?: string } | undefined)?.role || '').toLowerCase();
  const allowed = ['admin', 'ceo', 'crm_ops_admin', 'marketing_manager', 'telecaller_manager'];
  const authorized = allowed.includes(role) && session?.user?.email;
  return { authorized, role, email: session?.user?.email };
}

function buildPrompt(contact: any) {
  return `You are a fertility clinic CRM analyst. Analyze this lead interaction and provide insights.

Lead Information:
- Name: ${contact.name || 'Unknown'}
- Status: ${contact.status || 'Unknown'}
- Lead Score: ${contact.leadScore || 0}
- Notes: ${contact.notes || 'No notes'}
- Last Contact: ${contact.lastContact || 'Unknown'}
- Follow-up: ${contact.nextFollowUpAt || 'None scheduled'}
- Source: ${contact.leadSource || 'Unknown'}
- UTM Campaign: ${contact.utmCampaign || 'Unknown'}

Provide a JSON response with:
{
  "sentiment": "positive|negative|neutral",
  "lossReason": "price|distance|timing|competitor|service_mismatch|other|none",
  "confidence": 0.0-1.0,
  "summary": "Brief summary of lead state",
  "recommendedAction": "Specific next step for team"
}

Focus on fertility treatment context. Be concise and actionable.`;
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, role, email } = await requireAnalyticsAccess();
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { contactId } = body;

    if (!contactId) {
      return NextResponse.json({ error: 'contactId required' }, { status: 400 });
    }

    // Fetch contact data
    const contact = await db.select().from(contacts).where(eq(contacts.id, contactId)).get();
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Initialize Groq
    const groq = new Groq({ apiKey: GROQ_API_KEY });

    // Analyze with Groq
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: buildPrompt(contact) }],
      model: 'llama3-70b-8192',
      temperature: 0.3,
      max_tokens: 300,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
    }

    // Parse AI response
    let analysis;
    try {
      analysis = JSON.parse(aiResponse);
    } catch {
      // Fallback if AI doesn't return valid JSON
      analysis = {
        sentiment: 'neutral',
        lossReason: 'other',
        confidence: 0.1,
        summary: 'Analysis incomplete',
        recommendedAction: 'Review manually'
      };
    }

    // Update contact with AI insights
    await db.update(contacts)
      .set({
        lossReason: analysis.lossReason || 'none',
        sentiment: analysis.sentiment || 'neutral',
      })
      .where(eq(contacts.id, contactId));

    return NextResponse.json({
      success: true,
      analysis,
      contactId,
      analyzedBy: email,
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { authorized } = await requireAnalyticsAccess();
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');

    if (!contactId) {
      return NextResponse.json({ error: 'contactId required' }, { status: 400 });
    }

    const contact = await db.select().from(contacts).where(eq(contacts.id, parseInt(contactId))).get();
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      contact: {
        id: contact.id,
        name: contact.name,
        status: contact.status,
        lossReason: contact.lossReason,
        sentiment: contact.sentiment,
        notes: contact.notes,
        leadScore: contact.leadScore,
      }
    });

  } catch (error) {
    console.error('Get AI analysis error:', error);
    return NextResponse.json({ error: 'Failed to retrieve analysis' }, { status: 500 });
  }
}