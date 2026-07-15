import { NextResponse } from "next/server";
import { pushWebsiteLeadToAiCrm } from "@/lib/aicrm";
import { ensureMandatoryUtm } from "@/lib/utm";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  const phone = String(body?.phone || "").trim();
  const submissionId = String(body?.submission_id || "").trim();

  if (!name || !phone || !submissionId) {
    return NextResponse.json({ error: "Name, phone and submission ID are required" }, { status: 400 });
  }

  const utm = ensureMandatoryUtm(body?.utm || {});
  const result = await pushWebsiteLeadToAiCrm({
    submissionId,
    formKind: "at_home_testing",
    name,
    phone,
    email: String(body?.email || "").trim() || undefined,
    location: String(body?.location || "").trim() || undefined,
    campaign: "AT_HOME_TEST",
    landingPath: utm.landing_path || "/at-home-fertility-testing",
    referrer: String(body?.referrer || "").trim() || undefined,
    utm,
    attribution: body?.attribution,
    formData: {
      concern: String(body?.concerns || "").trim() || null,
      ready_to_start: "yes",
      do_not_call: Boolean(body?.do_not_call),
    },
  }, request);

  if (!result.ok) {
    return NextResponse.json({ error: "We could not register the request. Please try again." }, { status: 502 });
  }
  return NextResponse.json({
    success: true,
    submission_id: submissionId,
    message: "Request registered successfully",
  });
}
