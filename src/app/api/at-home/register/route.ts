import { NextResponse } from "next/server";
import { pushLeadToAiCrm } from "@/lib/aicrm";
import { ensureMandatoryUtm } from "@/lib/utm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name || "").trim();
    const phone = String(body?.phone || "").trim();
    const email = body?.email ? String(body.email).trim() : "";
    const location = body?.location ? String(body.location).trim() : "";
    const concerns = body?.concerns ? String(body.concerns).trim() : "";
    const utm = ensureMandatoryUtm(body?.utm || {});

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and WhatsApp number are required." }, { status: 400 });
    }

    const result = await pushLeadToAiCrm({
      name,
      phone,
      email,
      location,
      topic: "at_home_testing",
      source: "website_at_home",
      campaign: "AT_HOME_TEST",
      utm,
      landingPath: utm.landing_path || "/at-home-fertility-testing",
      notes: concerns || "At-home testing request",
      extras: {
        concern: concerns || undefined,
        form_kind: "at_home_testing",
        ready_to_start: "yes",
      },
    });

    if (!result.ok) {
      return NextResponse.json({ error: "Failed to register your request." }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      message: "Request received. Our team will follow up on WhatsApp shortly.",
    });
  } catch (error) {
    console.error("At-home register error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
