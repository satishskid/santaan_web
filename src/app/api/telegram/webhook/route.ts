import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Telegram Bot Webhook
 * 
 * Setup Instructions:
 * 1. Create bot with @BotFather on Telegram
 * 2. Get bot token and add to .env.local:
 *    TELEGRAM_BOT_TOKEN=your_bot_token_here
 * 3. Set webhook URL:
 *    https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-domain.com/api/telegram/webhook
 * 4. Create Telegram channel for broadcasts
 * 5. Get channel ID and add to .env.local:
 *    TELEGRAM_CHANNEL_ID=@your_channel_name
 */

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('Telegram webhook received:', JSON.stringify(body, null, 2));

        // Handle different update types
        if (body.message) {
            await handleMessage(body.message);
        } else if (body.callback_query) {
            await handleCallbackQuery(body.callback_query);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Telegram webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

// Handle incoming messages
async function handleMessage(message: any) {
    const chatId = message.chat.id;
    const userId = message.from.id;
    const username = message.from.username || '';
    const firstName = message.from.first_name || '';
    const lastName = message.from.last_name || '';
    const text = message.text || '';

    // Handle /start command
    if (text.startsWith('/start')) {
        await sendTelegramMessage(chatId, getWelcomeMessage());
        await sendInterestButtons(chatId);
        
        // Create contact if doesn't exist
        await createOrUpdateTelegramContact(userId, username, firstName, lastName, 'Started bot');
        return;
    }

    // Handle text messages
    const lowerText = text.toLowerCase();
    let tags = 'telegram';
    let leadScore = 15;

    // Detect intent
    if (lowerText.includes('test') || lowerText.includes('home') || lowerText.includes('sample')) {
        tags += ',at_home_test';
        leadScore += 30;
        await sendTelegramMessage(chatId, getAtHomeTestMessage());
    } else if (lowerText.includes('consult') || lowerText.includes('doctor') || lowerText.includes('appointment')) {
        tags += ',consultation';
        leadScore += 40;
        await sendTelegramMessage(chatId, getConsultationMessage());
    } else if (lowerText.includes('newsletter') || lowerText.includes('blog') || lowerText.includes('subscribe')) {
        tags += ',newsletter';
        leadScore += 10;
        await sendTelegramMessage(chatId, getNewsletterMessage());
    } else {
        await sendTelegramMessage(chatId, getDefaultReply());
    }

    // Update contact
    await createOrUpdateTelegramContact(userId, username, firstName, lastName, text, tags, leadScore);
}

// Handle callback button clicks
async function handleCallbackQuery(callbackQuery: any) {
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id;
    const username = callbackQuery.from.username || '';
    const firstName = callbackQuery.from.first_name || '';
    const lastName = callbackQuery.from.last_name || '';
    const data = callbackQuery.data;

    let response = '';
    let tags = 'telegram';
    let leadScore = 20;

    switch (data) {
        case 'newsletter':
            response = getNewsletterMessage();
            tags += ',newsletter';
            leadScore += 10;
            break;
        case 'at_home_test':
            response = getAtHomeTestMessage();
            tags += ',at_home_test';
            leadScore += 30;
            break;
        case 'consultation':
            response = getConsultationMessage();
            tags += ',consultation';
            leadScore += 40;
            break;
        case 'treatment_info':
            response = getTreatmentInfoMessage();
            tags += ',treatment';
            leadScore += 25;
            break;
        default:
            response = 'Thanks for your interest! Our team will contact you soon.';
    }

    await sendTelegramMessage(chatId, response);
    await createOrUpdateTelegramContact(userId, username, firstName, lastName, `Selected: ${data}`, tags, leadScore);

    // Answer callback query to remove loading state
    await answerCallbackQuery(callbackQuery.id);
}

// Database operations
async function createOrUpdateTelegramContact(
    userId: number,
    username: string,
    firstName: string,
    lastName: string,
    message: string,
    tags = 'telegram',
    leadScore = 15
) {
    const telegramId = userId.toString();
    const name = `${firstName} ${lastName}`.trim() || username || 'Telegram User';

    const existing = await db
        .select()
        .from(contacts)
        .where(eq(contacts.telegramId, telegramId))
        .limit(1);

    if (existing.length > 0) {
        await db.update(contacts)
            .set({
                telegramOptIn: true,
                preferredChannel: 'telegram',
                tags: existing[0].tags
                    ? `${existing[0].tags},${tags}`.split(',').filter((t, i, a) => a.indexOf(t) === i).join(',')
                    : tags,
                leadScore: (existing[0].leadScore || 0) + leadScore,
                lastMessageAt: new Date().toISOString(),
                conversationCount: (existing[0].conversationCount || 0) + 1,
                message,
            })
            .where(eq(contacts.telegramId, telegramId));
    } else {
        await db.insert(contacts).values({
            name,
            email: `telegram_${userId}@pending.santaan.in`,
            phone: 'Pending via Telegram',
            telegramId,
            telegramUsername: username,
            telegramOptIn: true,
            preferredChannel: 'telegram',
            leadSource: 'telegram',
            tags,
            leadScore,
            message,
            status: 'New',
            lastMessageAt: new Date().toISOString(),
            conversationCount: 1,
        });
    }
}

// Message templates
function getWelcomeMessage(): string {
    return `🙏 Welcome to Santaan Fertility!

We're here to support your fertility journey with:

• 🏠 At-Home Fertility Testing
• 👨‍⚕️ Expert Consultations  
• 💉 IVF/IUI Treatments
• 📰 Educational Content

What interests you today?`;
}

function getAtHomeTestMessage(): string {
    return `🏠 At-Home Fertility Test

✅ Professional sample collection at your doorstep
✅ NABL-accredited lab testing
✅ Complete privacy & discretion
✅ Teleconsultation with fertility specialist

📞 Our executive will call you to schedule.
Or call us: +91 897 123 4567

Register here: https://santaan.in`;
}

function getConsultationMessage(): string {
    return `👨‍⚕️ Book Your Consultation

Connect with our fertility specialists:

• Initial consultation
• Treatment planning
• Second opinions
• Follow-up appointments

📞 Call: +91 897 123 4567
🌐 Book online: https://santaan.in

Our executive will contact you shortly!`;
}

function getNewsletterMessage(): string {
    return `📰 Subscribe to Santaan Insights

Get expert fertility tips delivered:

✉️ Email Newsletter: https://santaan.in#newsletter
📱 Telegram Channel: @SantaanFertility
📝 Blog: https://medium.com/@santaanIVF

Stay informed with science-backed content!`;
}

function getTreatmentInfoMessage(): string {
    return `💉 Our Treatments

• IVF (In Vitro Fertilization)
• IUI (Intrauterine Insemination)
• ICSI (Intracytoplasmic Sperm Injection)
• Egg Freezing
• Fertility Preservation
• Male Infertility Treatment

📞 Speak to our expert: +91 897 123 4567
🌐 Learn more: https://santaan.in`;
}

function getDefaultReply(): string {
    return `Thank you for your message! 🙏

Our team will respond shortly.

For immediate assistance:
📞 Call: +91 897 123 4567
🌐 Visit: https://santaan.in`;
}

// Telegram API functions
async function sendTelegramMessage(chatId: number, text: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.error('TELEGRAM_BOT_TOKEN not configured');
        return;
    }

    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: 'Markdown',
            }),
        });

        if (!response.ok) {
            console.error('Telegram API error:', await response.text());
        }
    } catch (error) {
        console.error('Failed to send Telegram message:', error);
    }
}

async function sendInterestButtons(chatId: number) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return;

    const keyboard = {
        inline_keyboard: [
            [
                { text: '📰 Newsletter', callback_data: 'newsletter' },
                { text: '🏠 At-Home Test', callback_data: 'at_home_test' },
            ],
            [
                { text: '👨‍⚕️ Consultation', callback_data: 'consultation' },
                { text: '💉 Treatment Info', callback_data: 'treatment_info' },
            ],
        ],
    };

    try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: 'Select an option:',
                reply_markup: keyboard,
            }),
        });
    } catch (error) {
        console.error('Failed to send buttons:', error);
    }
}

async function answerCallbackQuery(callbackQueryId: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return;

    try {
        await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callback_query_id: callbackQueryId }),
        });
    } catch (error) {
        console.error('Failed to answer callback query:', error);
    }
}
