import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = String(body?.email || "").trim().toLowerCase();
        const utm = body?.utm || {};

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const existing = await db.select().from(contacts).where(eq(contacts.email, email)).get();
        if (existing) {
            return NextResponse.json({ success: true, message: "You are already subscribed." });
        }

        await db.insert(contacts).values({
            name: "Newsletter Subscriber",
            email,
            role: "Newsletter",
            status: "New",
            seminarRegistered: false,
            utmSource: utm.utm_source,
            utmMedium: utm.utm_medium,
            utmCampaign: utm.utm_campaign,
            utmTerm: utm.utm_term,
            utmContent: utm.utm_content,
            landingPath: utm.landing_path,
        });

        return NextResponse.json({ success: true, message: "Subscribed successfully" });
    } catch (error) {
        console.error("Newsletter subscribe error:", error);
        return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
    }
}
