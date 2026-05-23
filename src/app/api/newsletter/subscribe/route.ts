import { NextResponse } from "next/server";
import { pushLeadToAiCrm } from "@/lib/aicrm";
import { ensureMandatoryUtm } from "@/lib/utm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name || "").trim();
    const phone = String(body?.phone || "").trim();
    const utm = ensureMandatoryUtm(body?.utm || {});

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and WhatsApp number are required." }, { status: 400 });
    }

    const result = await pushLeadToAiCrm({
      name,
      phone,
      topic: "whatsapp_tips",
      source: "website_whatsapp_tips",
      campaign: "WHATSAPP_TIPS",
      utm,
      landingPath: utm.landing_path || "/fertility-tips",
      notes: "Requested fertility tips on WhatsApp",
      extras: {
        form_kind: "whatsapp_tips",
        nurture_stage: "warm",
        content_preference: "fertility_tips",
        ready_to_start: "exploring",
      },
    });

    if (!result.ok) {
      return NextResponse.json({ error: "Failed to save your WhatsApp request." }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      message: "You’re in. We will share fertility tips on WhatsApp.",
    });
  } catch (error) {
    console.error("WhatsApp tips subscribe error:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
