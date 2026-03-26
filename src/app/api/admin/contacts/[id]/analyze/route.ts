import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { isAuthorizedOpsUser } from '@/lib/auth-helper';
import Groq from 'groq-sdk';

export const runtime = 'nodejs';

const ANALYSIS_ROLES = new Set([
    'admin',
    'ceo',
    'crm_ops_admin',
    'telecaller_manager',
    'counselor',
]);

function normalizeRole(role?: string | null) {
    return String(role || '').trim().toLowerCase();
}

async function requireAnalysisAccess() {
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

function getGroqClient() {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error('GROQ_API_KEY not configured');
    return new Groq({ apiKey: key });
}

async function analyzeLeadLossReason(contact: any) {
    const groq = getGroqClient();
    
    const prompt = `You are a fertility clinic lead analyst. Analyze this lead and provide insights.

Lead Information:
- Name: ${contact.name}
- Email: ${contact.email}
- Phone: ${contact.phone}
- Status: ${contact.status}
- Lead Score: ${contact.leadScore}
- Notes: ${contact.notes || 'No notes'}
- Last Contact: ${contact.lastContact}
- Follow-up: ${contact.nextFollowUpAt || 'None scheduled'}
- Source: ${contact.leadSource || 'Unknown'}
- Tags: ${contact.tags || 'None'}

Based on this information, provide:
1. Primary reason this lead was likely lost (if status is 'lost')
2. Sentiment analysis of the lead interaction
3. Recommended next actions to re-engage or prevent similar losses
4. Key insights about lead behavior patterns

Respond in JSON format:
{
  "lossReason": "Price objection|Distance issue|Wrong number|Not ready|Competitor chosen|Other",
  "sentiment": "positive|neutral|negative|frustrated|interested",
  "confidence": 0.8,
  "insights": "Brief insights about lead behavior",
  "recommendedActions": ["Action 1", "Action 2"]
}`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama3-70b-8192',
            temperature: 0.3,
            max_tokens: 500,
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error('No response from Groq');

        // Try to parse JSON response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        // Fallback: extract key information
        return {
            lossReason: 'Other',
            sentiment: 'neutral',
            confidence: 0.5,
            insights: 'Unable to parse detailed analysis',
            recommendedActions: ['Review lead notes manually', 'Contact lead directly']
        };
    } catch (error) {
        console.error('Groq analysis error:', error);
        throw error;
    }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { authorized, role } = await requireAnalysisAccess();
        if (!authorized || !ANALYSIS_ROLES.has(role)) {
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

        // Only analyze if lead is lost or has significant notes
        if (contact.status !== 'lost' && !contact.notes) {
            return NextResponse.json({ 
                error: 'Analysis only available for lost leads or leads with notes' 
            }, { status: 400 });
        }

        const analysis = await analyzeLeadLossReason(contact);

        // Update contact with analysis results
        await db.update(contacts)
            .set({
                lossReason: analysis.lossReason,
                sentiment: analysis.sentiment,
            })
            .where(eq(contacts.id, id));

        return NextResponse.json({
            success: true,
            analysis: {
                ...analysis,
                contactId: id,
                analyzedAt: new Date().toISOString(),
            }
        });

    } catch (error) {
        console.error('Lead analysis error:', error);
        return NextResponse.json({ 
            error: 'Failed to analyze lead',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}