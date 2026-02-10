import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * WhatsApp Business API Webhook
 * 
 * Setup Instructions:
 * 1. Add your WhatsApp credentials to .env.local:
 *    - WHATSAPP_API_KEY=your_api_key
 *    - WHATSAPP_PHONE_NUMBER=+91xxxxxxxxxx
 *    - WHATSAPP_VERIFY_TOKEN=your_custom_token
 * 
 * 2. Configure webhook in your WhatsApp provider dashboard:
 *    - URL: https://your-domain.com/api/whatsapp/webhook
 *    - Verify Token: (same as WHATSAPP_VERIFY_TOKEN)
 *    - Subscribe to: messages, message_status
 * 
 * Supported Providers:
 * - Twilio: https://www.twilio.com/docs/whatsapp/api
 * - Gupshup: https://www.gupshup.io/developer/docs
 * - Interakt: https://docs.interakt.ai/
 * - Meta Cloud API: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

// Webhook verification (GET request from WhatsApp)
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'santaan_verify_token_2026';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WhatsApp webhook verified successfully');
        return new NextResponse(challenge, { status: 200 });
    }

    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// Webhook for incoming messages (POST request from WhatsApp)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));

        // Different providers have different payload structures
        // Detect provider and normalize data
        const messageData = normalizeWebhookPayload(body);

        if (!messageData) {
            return NextResponse.json({ success: true, message: 'No actionable data' });
        }

        // Process the message
        await processWhatsAppMessage(messageData);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('WhatsApp webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

// Normalize different provider payloads
function normalizeWebhookPayload(body: any) {
    // Meta Cloud API format
    if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
        const message = body.entry[0].changes[0].value.messages[0];
        const contact = body.entry[0].changes[0].value.contacts[0];
        return {
            provider: 'meta',
            from: message.from,
            name: contact?.profile?.name || 'WhatsApp User',
            messageType: message.type,
            text: message.text?.body,
            timestamp: message.timestamp,
        };
    }

    // Twilio format
    if (body.From && body.Body) {
        return {
            provider: 'twilio',
            from: body.From.replace('whatsapp:', ''),
            name: body.ProfileName || 'WhatsApp User',
            messageType: 'text',
            text: body.Body,
            timestamp: new Date().toISOString(),
        };
    }

    // Gupshup format
    if (body.payload?.sender?.phone) {
        return {
            provider: 'gupshup',
            from: body.payload.sender.phone,
            name: body.payload.sender.name || 'WhatsApp User',
            messageType: body.payload.type,
            text: body.payload.payload?.text,
            timestamp: new Date().toISOString(),
        };
    }

    // Interakt format
    if (body.data?.customer?.phone_number) {
        return {
            provider: 'interakt',
            from: body.data.customer.phone_number,
            name: body.data.customer.name || 'WhatsApp User',
            messageType: body.data.message_type,
            text: body.data.message?.text,
            timestamp: body.data.created_at,
        };
    }

    return null;
}

// Process incoming WhatsApp message
async function processWhatsAppMessage(data: any) {
    const { from, name, text, provider } = data;

    if (!from || !text) return;

    // Check if contact exists
    const existing = await db
        .select()
        .from(contacts)
        .where(eq(contacts.whatsappNumber, from))
        .limit(1);

    const lowerText = text.toLowerCase();
    let tags = 'whatsapp';
    let leadScore = 20; // WhatsApp engagement is high intent

    // Detect intent from message
    if (lowerText.includes('test') || lowerText.includes('home') || lowerText.includes('sample')) {
        tags += ',at_home_test';
        leadScore += 30;
    }
    if (lowerText.includes('consult') || lowerText.includes('doctor') || lowerText.includes('appointment')) {
        tags += ',consultation';
        leadScore += 40;
    }
    if (lowerText.includes('ivf') || lowerText.includes('iui') || lowerText.includes('treatment')) {
        tags += ',treatment';
        leadScore += 50;
    }

    if (existing.length > 0) {
        // Update existing contact
        await db.update(contacts)
            .set({
                whatsappOptIn: true,
                preferredChannel: 'whatsapp',
                tags: existing[0].tags
                    ? `${existing[0].tags},${tags}`.split(',').filter((t, i, a) => a.indexOf(t) === i).join(',')
                    : tags,
                leadScore: (existing[0].leadScore || 0) + leadScore,
                lastMessageAt: new Date().toISOString(),
                conversationCount: (existing[0].conversationCount || 0) + 1,
                message: text,
            })
            .where(eq(contacts.whatsappNumber, from));
    } else {
        // Create new contact
        await db.insert(contacts).values({
            name,
            email: `whatsapp_${from}@pending.santaan.in`, // Placeholder until we get real email
            phone: from,
            whatsappNumber: from,
            whatsappOptIn: true,
            preferredChannel: 'whatsapp',
            leadSource: 'whatsapp',
            tags,
            leadScore,
            message: text,
            status: 'Hot Lead',
            lastMessageAt: new Date().toISOString(),
            conversationCount: 1,
        });
    }

    // TODO: Send auto-reply or notify admin
    // await sendWhatsAppMessage(from, getAutoReply(text));
}

// Auto-reply logic (customize as needed)
function getAutoReply(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
        return "Hello! 👋 Welcome to Santaan Fertility. How can we help you today?\n\n1️⃣ At-Home Fertility Test\n2️⃣ Book Consultation\n3️⃣ Learn About IVF\n4️⃣ Speak to Executive\n\nReply with a number or describe your query.";
    }

    if (lowerMessage.includes('test') || lowerMessage.includes('1')) {
        return "Great! Our At-Home Fertility Test includes:\n✅ Professional sample collection at your doorstep\n✅ NABL-accredited lab testing\n✅ Teleconsultation with specialist\n\nOur executive will call you shortly to schedule. Or call us: +91 897 123 4567";
    }

    if (lowerMessage.includes('consult') || lowerMessage.includes('2')) {
        return "We'd love to connect you with our fertility specialists! 👨‍⚕️\n\nOur executive will call you within 2 hours to schedule your consultation.\n\nFor immediate assistance: +91 897 123 4567";
    }

    return "Thank you for contacting Santaan Fertility! 🙏\n\nOur team will respond shortly. For urgent queries, call: +91 897 123 4567";
}

// Helper function to send WhatsApp message (implement based on provider)
async function sendWhatsAppMessage(to: string, message: string) {
    // TODO: Implement based on your WhatsApp provider
    // Example for Twilio, Gupshup, Interakt, or Meta Cloud API
    
    const provider = process.env.WHATSAPP_PROVIDER || 'meta'; // meta, twilio, gupshup, interakt
    
    // Placeholder - implement actual API calls
    console.log(`Sending WhatsApp message to ${to}: ${message}`);
    
    // Example implementations will be added once you provide credentials
}
