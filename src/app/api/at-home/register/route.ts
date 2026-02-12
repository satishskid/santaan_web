import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendWhatsAppMessage } from "@/services/whatsapp";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, phone, email, location, concerns } = body;
        const utm = body.utm || {};

        if (!phone || !name) {
            return NextResponse.json({ error: "Name and Phone are required" }, { status: 400 });
        }

        // Clean phone number
        const cleanPhone = phone.replace(/\D/g, '');

        // Check if contact exists by phone or email
        let existing = null;
        if (email) {
            existing = await db.select().from(contacts).where(eq(contacts.email, email)).get();
        }
        
        if (!existing) {
            // Try by phone if not found by email
            // Note: phone stored might be formatted, so this is a simple check
            type Contact = typeof contacts.$inferSelect;
            const allContacts = await db.select().from(contacts).all();
            existing = allContacts.find((c: Contact) => c.phone && c.phone.replace(/\D/g, '').includes(cleanPhone.slice(-10)));
        }

        if (existing) {
            // Update existing contact
            const currentTags = existing.tags ? existing.tags.split(',') : [];
            if (!currentTags.includes('at_home_test')) currentTags.push('at_home_test');
            
            await db.update(contacts)
                .set({
                    phone: phone, // Update phone to latest
                    whatsappNumber: cleanPhone,
                    tags: currentTags.join(','),
                    lastContact: new Date().toISOString(),
                    // Increment lead score for returning interest
                    leadScore: (existing.leadScore || 0) + 20,
                    message: concerns ? `${existing.message || ''}\n[At Home]: ${concerns}` : existing.message
                })
                .where(eq(contacts.id, existing.id));
        } else {
            // Create new contact
            await db.insert(contacts).values({
                name,
                email: email || `no-email-${cleanPhone}@santaan.in`, // Placeholder if not provided
                phone,
                whatsappNumber: cleanPhone,
                role: "Lead",
                status: "New",
                tags: "at_home_test,hot_lead",
                leadSource: "at_home_page",
                leadScore: 50, // High intent
                preferredChannel: "whatsapp",
                message: concerns,
                utmSource: utm.utm_source || 'direct',
                utmMedium: utm.utm_medium || 'website',
                utmCampaign: utm.utm_campaign || 'at_home_test',
            });
        }

        // Send WhatsApp Notification to Admin
        // We assume a template 'SANTAAN_LEAD_ALERT' exists with 3 params: Name, Service, Phone
        // If not, this might fail or send just the template name.
        // User needs to provide the actual Admin Template Name.
        const adminPhone = process.env.next_public_admin_wa_phone || '9742100448';
        
        try {
            await sendWhatsAppMessage({ 
                phone: adminPhone, 
                template: 'SANTAAN_LEAD_ALERT', 
                params: [name, 'At-Home-Test', phone] 
            });
            console.log(`[WhatsApp] Admin alert sent to ${adminPhone}`);
        } catch (waError) {
            console.error('[WhatsApp] Failed to send admin alert:', waError);
        }

        return NextResponse.json({ success: true, message: "Request registered successfully" });

    } catch (error) {
        console.error("Error registering at-home test:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
