import { NextResponse } from "next/server";
import { pushLeadToAiCrm } from "@/lib/aicrm";
import { ensureMandatoryUtm } from "@/lib/utm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name || "").trim();
    const phone = String(body?.phone || "").trim();
    const email = body?.email ? String(body.email).trim() : "";
    const question = body?.question ? String(body.question).trim() : "";
    const score = body?.score;
    const signal = body?.signal ? String(body.signal).trim() : "";
    const utm = ensureMandatoryUtm(body?.utm || {});

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and WhatsApp number are required." }, { status: 400 });
    }

    const result = await pushLeadToAiCrm({
      name,
      phone,
      email,
      topic: "seminar_registration",
      source: "website_seminar",
      campaign: "SEMINAR",
      utm,
      landingPath: utm.landing_path || "/know-your-score",
      notes: question || "Seminar registration request",
      extras: {
        question: question || undefined,
        score: typeof score === "number" ? score : undefined,
        signal: signal || undefined,
        form_kind: "seminar_registration",
        ready_to_start: "exploring",
      },
    });

    if (!result.ok) {
      return NextResponse.json({ error: "Failed to reserve your spot." }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      message: "Spot reserved. We will confirm the seminar details on WhatsApp.",
    });
  } catch (error) {
    console.error("Seminar registration error:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
