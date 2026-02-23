import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { resolveCenter } from '@/lib/lead-attribution';
import { ensureMandatoryUtm } from '@/lib/utm';
import { normalizeIndianMobile, pushLeadToNeoDove } from '@/lib/neodove';

type CtaAction = 'call' | 'whatsapp' | 'book';

const PHONE_REGEX = /[^0-9]/g;
const MAX_MESSAGE_LENGTH = 1800;

const normalizeAction = (value?: string | null): CtaAction => {
    const normalized = String(value || '').toLowerCase();
    if (normalized === 'whatsapp' || normalized === 'book') return normalized;
    return 'call';
};

const extractDigits = (value?: string | null) => (value || '').replace(PHONE_REGEX, '');

const extractWhatsappNumber = (target: string) => {
    if (!target) return undefined;
    try {
        const parsed = new URL(target, 'https://santaan.in');
        if (!parsed.hostname.includes('wa.me')) return undefined;
        const digits = extractDigits(parsed.pathname);
        return digits.length >= 10 ? digits : undefined;
    } catch {
        return undefined;
    }
};

const extractPhoneFromTarget = (target: string) => {
    if (!target) return null;

    if (target.startsWith('tel:')) {
        return normalizeIndianMobile(target.replace('tel:', ''));
    }

    const waNumber = extractWhatsappNumber(target);
    if (waNumber) {
        return normalizeIndianMobile(waNumber);
    }

    try {
        const parsed = new URL(target, 'https://santaan.in');
        const phoneFromQuery = parsed.searchParams.get('phone') || parsed.searchParams.get('to');
        if (phoneFromQuery) {
            return normalizeIndianMobile(phoneFromQuery);
        }
    } catch {
        return normalizeIndianMobile(target);
    }

    return normalizeIndianMobile(target);
};

const mergeTags = (existing: string | null, additions: string[]) => {
    const set = new Set((existing || '').split(',').map((tag) => tag.trim()).filter(Boolean));
    additions.filter(Boolean).forEach((tag) => set.add(tag));
    return Array.from(set).join(',');
};

const appendMessage = (existing: string | null, nextLine: string) => {
    if (!existing) return nextLine.slice(0, MAX_MESSAGE_LENGTH);
    const merged = `${existing}\n${nextLine}`.trim();
    if (merged.length <= MAX_MESSAGE_LENGTH) return merged;
    return merged.slice(merged.length - MAX_MESSAGE_LENGTH);
};

const centerTag = (center: string) => `center_${center.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
const actionScore = (action: CtaAction) => (action === 'book' ? 30 : action === 'whatsapp' ? 20 : 12);
const preferredChannel = (action: CtaAction) => (action === 'whatsapp' ? 'whatsapp' : action === 'call' ? 'phone' : 'website');
const leadSource = (action: CtaAction) => `cta_${action}`;
const neoDoveCampaignByAction: Record<CtaAction, string> = {
    call: 'DIRECT CALLS',
    whatsapp: 'WhatsApp Leads',
    book: 'CHATBOTS',
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const action = normalizeAction(body.action || body.intent);
        const target = String(body.target || body.phone || '').trim();
        const landingPath = String(body.landingPath || body?.utm?.landing_path || '/').slice(0, 300);

        const utm = ensureMandatoryUtm({
            utm_source: body?.utm?.utm_source || body.utmSource,
            utm_medium: body?.utm?.utm_medium || body.utmMedium,
            utm_campaign: body?.utm?.utm_campaign || body.utmCampaign,
            utm_term: body?.utm?.utm_term || body.utmTerm,
            utm_content: body?.utm?.utm_content || body.utmContent || `cta_${action}`,
            center: body?.utm?.center,
            asset: body?.utm?.asset,
            landing_path: landingPath,
        });

        const center = resolveCenter({
            center: body.center || utm.center,
            landingPath,
            target,
        });

        const visitorId = String(body.visitorId || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 64);
        const contactEmail = visitorId
            ? `cta_${visitorId}@intent.santaan.in`
            : `cta_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@intent.santaan.in`;

        const timestamp = new Date().toISOString();
        const note = `[${timestamp}] ${action.toUpperCase()} CTA | center=${center} | target=${target || 'n/a'} | path=${landingPath}`;
        const tags = ['cta', `cta_${action}`, centerTag(center), 'utm_mandatory'];
        const nowEpoch = Date.now();
        const inferredPhone = extractPhoneFromTarget(target);
        const fallbackName = `Website Visitor ${contactEmail.slice(4, 10)}`;

        const existing = await db.select().from(contacts).where(eq(contacts.email, contactEmail)).get();

        if (existing) {
            await db.update(contacts).set({
                status: existing.status || 'New',
                role: existing.role || 'Lead',
                phone: action === 'call' && target ? target : existing.phone,
                whatsappNumber: action === 'whatsapp'
                    ? extractWhatsappNumber(target) || existing.whatsappNumber
                    : existing.whatsappNumber,
                whatsappOptIn: action === 'whatsapp' ? true : existing.whatsappOptIn,
                preferredChannel: preferredChannel(action),
                leadSource: leadSource(action),
                tags: mergeTags(existing.tags, tags),
                leadScore: Math.min(100, (existing.leadScore || 0) + actionScore(action)),
                message: appendMessage(existing.message, note),
                utmSource: utm.utm_source,
                utmMedium: utm.utm_medium,
                utmCampaign: utm.utm_campaign,
                utmTerm: utm.utm_term || center.toLowerCase(),
                utmContent: utm.utm_content || `cta_${action}`,
                landingPath,
                lastContact: timestamp,
                lastMessageAt: timestamp,
                conversationCount: (existing.conversationCount || 0) + 1,
                submittedAt: existing.submittedAt || nowEpoch,
            }).where(eq(contacts.id, existing.id));
        } else {
            await db.insert(contacts).values({
                name: fallbackName,
                email: contactEmail,
                phone: action === 'call' && target ? target : inferredPhone,
                whatsappNumber: action === 'whatsapp' ? extractWhatsappNumber(target) : null,
                whatsappOptIn: action === 'whatsapp',
                role: 'Lead',
                status: 'New',
                preferredChannel: preferredChannel(action),
                leadSource: leadSource(action),
                tags: tags.join(','),
                leadScore: actionScore(action),
                message: note,
                utmSource: utm.utm_source,
                utmMedium: utm.utm_medium,
                utmCampaign: utm.utm_campaign,
                utmTerm: utm.utm_term || center.toLowerCase(),
                utmContent: utm.utm_content || `cta_${action}`,
                landingPath,
                lastContact: timestamp,
                lastMessageAt: timestamp,
                conversationCount: 1,
                submittedAt: nowEpoch,
            });
        }

        const neoDoveMobile = inferredPhone || normalizeIndianMobile(existing?.phone || existing?.whatsappNumber || null);
        if (neoDoveMobile) {
            const neoDoveResult = await pushLeadToNeoDove({
                name: existing?.name || fallbackName,
                mobile: neoDoveMobile,
                email: contactEmail,
                source: `website_cta_${action}`,
                campaign: neoDoveCampaignByAction[action],
                center,
                status: 'OPEN',
                pipeline: 'Reminder',
                landingPath,
                notes: note,
                tags,
                utm: {
                    utm_source: utm.utm_source,
                    utm_medium: utm.utm_medium,
                    utm_campaign: utm.utm_campaign,
                    utm_term: utm.utm_term,
                    utm_content: utm.utm_content,
                },
            });

            if (!neoDoveResult.ok) {
                console.error('NeoDove CTA push failed:', neoDoveResult);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'CTA intent tracked',
            center,
            action,
        });
    } catch (error) {
        console.error('Error tracking CTA intent:', error);
        return NextResponse.json(
            { error: 'Failed to track CTA intent' },
            { status: 500 }
        );
    }
}
