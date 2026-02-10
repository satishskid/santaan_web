import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = String(body?.email || "").trim().toLowerCase();
        const name = body?.name;
        const utm = body?.utm || {};

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const existing = await db.select().from(contacts).where(eq(contacts.email, email)).get();
        if (existing) {
            // Update existing contact to newsletter subscriber
            await db.update(contacts)
                .set({
                    newsletterSubscribed: true,
                    tags: existing.tags 
                        ? `${existing.tags},newsletter`.split(',').filter((t, i, a) => a.indexOf(t) === i).join(',')
                        : 'newsletter',
                    lastContact: new Date().toISOString(),
                })
                .where(eq(contacts.email, email));

            return NextResponse.json({ 
                success: true, 
                message: "Successfully subscribed!",
                alreadySubscribed: existing.newsletterSubscribed 
            });
        }

        await db.insert(contacts).values({
            name: name || "Newsletter Subscriber",
            email,
            role: "Newsletter",
            status: "New",
            seminarRegistered: false,
            newsletterSubscribed: true,
            tags: 'newsletter',
            leadSource: 'website',
            leadScore: 10,
            preferredChannel: 'email',
            utmSource: utm.utm_source || 'direct',
            utmMedium: utm.utm_medium || 'website',
            utmCampaign: utm.utm_campaign || 'newsletter',
            utmTerm: utm.utm_term,
            utmContent: utm.utm_content || 'footer_newsletter',
            landingPath: utm.landing_path || '/newsletter',
        });

        return NextResponse.json({ success: true, message: "Subscribed successfully! Check your email." });
    } catch (error) {
        console.error("Newsletter subscribe error:", error);
        return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
    }
}
