import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET - Check chatbot status
export async function GET() {
    try {
        const chatbotSetting = await db.select()
            .from(settings)
            .where(eq(settings.key, 'chatbot_enabled'))
            .limit(1);

        const isEnabled = chatbotSetting[0]?.value === 'true';

        return NextResponse.json({ 
            enabled: isEnabled,
            status: isEnabled ? 'online' : 'offline'
        });
    } catch (error) {
        console.error('Error checking chatbot status:', error);
        return NextResponse.json({ 
            enabled: false,
            status: 'error',
            message: 'Unable to check chatbot status'
        }, { status: 500 });
    }
}

// POST - Toggle chatbot status (admin only)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { enabled } = body;

        if (typeof enabled !== 'boolean') {
            return NextResponse.json({ 
                error: 'Invalid request. "enabled" must be a boolean.' 
            }, { status: 400 });
        }

        // Update or insert the chatbot_enabled setting
        const existingSetting = await db.select()
            .from(settings)
            .where(eq(settings.key, 'chatbot_enabled'))
            .limit(1);

        if (existingSetting.length > 0) {
            await db.update(settings)
                .set({ 
                    value: enabled ? 'true' : 'false',
                    updatedAt: new Date().toISOString()
                })
                .where(eq(settings.key, 'chatbot_enabled'));
        } else {
            await db.insert(settings).values({
                key: 'chatbot_enabled',
                value: enabled ? 'true' : 'false',
                updatedAt: new Date().toISOString()
            });
        }

        return NextResponse.json({ 
            success: true,
            enabled,
            message: `Chatbot ${enabled ? 'enabled' : 'disabled'} successfully`
        });
    } catch (error) {
        console.error('Error updating chatbot status:', error);
        return NextResponse.json({ 
            error: 'Failed to update chatbot status' 
        }, { status: 500 });
    }
}
