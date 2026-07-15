import { NextResponse } from 'next/server';
import { pushWebsiteLeadToAiCrm } from '@/lib/aicrm';
import { ensureMandatoryUtm } from '@/lib/utm';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body?.name || '').trim();
  const email = String(body?.email || '').trim();
  const phone = String(body?.phone || '').trim();
  const submissionId = String(body?.submission_id || '').trim();

  if (!name || !email || !phone || !submissionId) {
    return NextResponse.json({ error: 'Name, email, phone and submission ID are required' }, { status: 400 });
  }

  const utm = ensureMandatoryUtm(body?.utm || {});
  const result = await pushWebsiteLeadToAiCrm({
    submissionId,
    formKind: 'seminar_registration',
    name,
    phone,
    email,
    campaign: 'SEMINAR',
    landingPath: utm.landing_path || '/know-your-score',
    referrer: String(body?.referrer || '').trim() || undefined,
    utm,
    attribution: body?.attribution,
    formData: {
      question: String(body?.question || '').trim() || null,
      score: typeof body?.score === 'number' ? body.score : null,
      signal: String(body?.signal || '').trim() || null,
      ready_to_start: 'exploring',
      do_not_call: Boolean(body?.do_not_call),
    },
  }, request);

  if (!result.ok) {
    return NextResponse.json({ error: 'We could not reserve the spot. Please try again.' }, { status: 502 });
  }
  return NextResponse.json({
    success: true,
    submission_id: submissionId,
    message: 'Registration successful',
  });
}
