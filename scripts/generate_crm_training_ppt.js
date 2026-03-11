const pptxgen = require('pptxgenjs');
const path = require('path');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Codex';
pptx.company = 'Santaan';
pptx.subject = 'Santaan CRM Training Manual';
pptx.title = 'Santaan CRM Training Manual - Accurate Product Training';
pptx.lang = 'en-IN';
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  lang: 'en-IN',
};
pptx.defineSlideMaster({
  title: 'SANTAAN_MASTER',
  background: { color: 'F5F3EE' },
  objects: [
    { rect: { x: 0, y: 0, w: 13.333, h: 0.55, fill: { color: '21443F' }, line: { color: '21443F' } } },
    { text: { text: 'Santaan CRM Training Manual', options: { x: 0.45, y: 0.14, w: 4.8, h: 0.2, fontFace: 'Aptos', fontSize: 24/2, bold: true, color: 'FFFFFF' } } },
    { text: { text: 'Accurate product version | March 10, 2026', options: { x: 9.0, y: 0.16, w: 3.8, h: 0.18, align: 'right', fontFace: 'Aptos', fontSize: 16/2, color: 'D7E7E3' } } },
    { line: { x: 0.45, y: 7.12, w: 12.4, h: 0, line: { color: 'D5DDD9', pt: 1 } } },
    { text: { text: 'Source of truth: /admin/login, /admin/dashboard, Spend, Ops Inputs, Daily Command, CEO Command', options: { x: 0.45, y: 7.18, w: 9.4, h: 0.18, fontFace: 'Aptos', fontSize: 12/2, color: '5E6E69' } } },
    { text: { text: 'If it is not in CRM, it is not done.', options: { x: 10.1, y: 7.16, w: 2.75, h: 0.2, fontFace: 'Aptos', fontSize: 12/2, bold: true, align: 'right', color: '21443F' } } },
  ],
  slideNumber: { x: 12.55, y: 7.18, w: 0.4, h: 0.2, color: '5E6E69', fontFace: 'Aptos', fontSize: 12/2 },
});

const ROOT = '/Users/spr/santaan hope/santaan-web';
const img = (name) => path.join(ROOT, 'public', 'training', name);
const OUT = path.join(ROOT, 'out', 'Santaan_CRM_Training_Manual_Accurate_2026-03-10.pptx');

function addTitle(slide, title, subtitle) {
  slide.addText(title, { x: 0.6, y: 0.78, w: 7.8, h: 0.45, fontFace: 'Aptos Display', fontSize: 28/2, bold: true, color: '17332F' });
  if (subtitle) {
    slide.addText(subtitle, { x: 0.62, y: 1.25, w: 10.8, h: 0.42, fontFace: 'Aptos', fontSize: 16/2, color: '556760', breakLine: false });
  }
}

function addBullets(slide, items, opts = {}) {
  const x = opts.x ?? 0.78;
  const y = opts.y ?? 1.9;
  const w = opts.w ?? 5.4;
  const h = opts.h ?? 4.8;
  const fontSize = opts.fontSize ?? 18/2;
  const runs = [];
  for (const item of items) {
    if (typeof item === 'string') {
      runs.push({ text: item, options: { bullet: { indent: 14 }, hanging: 3 } });
    } else {
      runs.push({ text: item.text, options: { bullet: { indent: 14 }, hanging: 3, bold: item.bold || false } });
    }
  }
  slide.addText(runs, {
    x, y, w, h,
    fontFace: 'Aptos', fontSize, color: '243632',
    paraSpaceAfterPt: 10, breakLine: true, valign: 'top', margin: 0.03,
  });
}

function addCallout(slide, title, body, x, y, w, h, color='E8F0EC') {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color }, line: { color: 'C5D5CF', pt: 1 } });
  slide.addText(title, { x: x + 0.18, y: y + 0.14, w: w - 0.36, h: 0.18, fontFace: 'Aptos', fontSize: 16/2, bold: true, color: '17332F' });
  slide.addText(body, { x: x + 0.18, y: y + 0.36, w: w - 0.36, h: h - 0.46, fontFace: 'Aptos', fontSize: 14/2, color: '42544E', margin: 0.02, valign: 'top' });
}

function addImageContain(slide, imagePath, x, y, w, h) {
  slide.addImage({ path: imagePath, x, y, w, h, sizing: { type: 'contain', x, y, w, h } });
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.04, line: { color: 'CBD7D2', pt: 1 }, fill: { color: 'FFFFFF', transparency: 100 } });
}

// Slide 1
{
  const s = pptx.addSlide('SANTAAN_MASTER');
  s.background = { color: 'EEF3F0' };
  s.addShape(pptx.ShapeType.roundRect, { x: 0.55, y: 0.85, w: 7.1, h: 5.7, rectRadius: 0.08, fill: { color: 'F7FBF9' }, line: { color: 'D3DDD9', pt: 1 } });
  s.addText('Santaan CRM Training Manual', { x: 0.9, y: 1.25, w: 6.0, h: 0.7, fontFace: 'Aptos Display', fontSize: 32/2, bold: true, color: '17332F' });
  s.addText('Accurate operating deck for agencies, field team, IVR/telecalling, counselors, and leadership.', { x: 0.92, y: 2.0, w: 5.8, h: 0.45, fontFace: 'Aptos', fontSize: 18/2, color: '556760' });
  s.addText('Use this deck only with the live CRM at https://santaan-web.vercel.app/login', { x: 0.92, y: 2.58, w: 5.9, h: 0.35, fontFace: 'Aptos', fontSize: 16/2, bold: true, color: '21443F' });
  addCallout(s, 'Core rule', 'If work is not updated in CRM, it is treated as not done. This deck is tied to the current product, not a future roadmap.', 0.92, 3.15, 5.95, 1.1, 'E6F2EE');
  addCallout(s, 'What this deck covers', 'Login flow, real tabs, role-wise work, Spend screen, Ops Inputs, reconciliation rules, and CEO review logic.', 0.92, 4.45, 5.95, 1.28, 'FFF7E9');
  addImageContain(s, img('crm-role-guide.png'), 7.95, 0.95, 4.75, 5.95);
}

// Slide 2
{
  const s = pptx.addSlide('SANTAAN_MASTER');
  addTitle(s, 'What the CRM is for', 'The product is built to reduce fragmented reporting across agencies, centers, telecalling, field activity, and counseling.');
  addBullets(s, [
    'Create one source of truth for lead movement, campaign spend, and center-wise activity.',
    'Make the CEO dashboard actionable: what is running, what is converting, where leads are leaking, and who must fix it.',
    'Replace screenshot-based reporting with structured CRM updates.',
    'Keep role-specific work simple so teams can sustain daily usage.'
  ], { x: 0.8, y: 1.95, w: 6.0, h: 3.8 });
  addCallout(s, 'Do not teach roadmap features', 'Only train users on screens that exist today: Daily Command, Workboard, Contacts/Hot Leads, Spend, Ops Inputs, Analytics, CEO Command, Settings, Centers, Announcements.', 7.15, 2.1, 5.1, 1.55, 'FDEFEF');
  addCallout(s, 'Decision standard', 'For marketing ROI, use pre-GST delivery spend from Meta/Google. Post-GST invoice values belong in finance reconciliation, not campaign ROI.', 7.15, 3.95, 5.1, 1.45, 'E8F0EC');
}

// Slide 3
{
  const s = pptx.addSlide('SANTAAN_MASTER');
  addTitle(s, 'Login and first 5 minutes', 'This slide reflects the real login page and the actual first action expected from all users.');
  addImageContain(s, img('login-screen.png'), 0.72, 1.75, 6.4, 4.9);
  addBullets(s, [
    'Open: https://santaan-web.vercel.app/login',
    'Enter assigned role email and password. Current login is credentials-based only.',
    'After sign-in, users land in /admin/dashboard.',
    'First instruction on the live page: open Daily Command first.',
    'Training links visible on login page: Training Manual and Training Deck.'
  ], { x: 7.4, y: 2.0, w: 4.9, h: 3.7 });
  addCallout(s, 'Important accuracy note', 'Do not mention 2FA, forgot-password, or support email/extension unless those features are actually added to the live login flow.', 7.35, 5.85, 5.1, 0.88, 'FDEFEF');
}

// Slide 4
{
  const s = pptx.addSlide('SANTAAN_MASTER');
  addTitle(s, 'The real dashboard tabs', 'These labels are taken from the live CRM. Train users using these exact names.');
  addCallout(s, 'All users start here', 'Daily Command\nWorkboard', 0.78, 1.9, 2.6, 1.1, 'E6F2EE');
  addCallout(s, 'Lead handling', 'All Contacts\nAt-Home Test\nHot Leads', 3.6, 1.9, 2.6, 1.35, 'F7FBF9');
  addCallout(s, 'Leadership and visibility', 'Analytics\nCEO Command', 6.42, 1.9, 2.6, 1.1, 'FFF7E9');
  addCallout(s, 'Administration', 'Team\nSettings\nCenters\nAnnouncements', 9.24, 1.9, 2.95, 1.55, 'F7FBF9');
  addCallout(s, 'Agency / Marketing execution', 'Spend\nOps Inputs', 0.78, 3.55, 3.2, 1.05, 'E8F0EC');
  addBullets(s, [
    'Agency users primarily work in Spend and Ops Inputs, then use Analytics for validation.',
    'Field executives primarily work in Ops Inputs and Workboard.',
    'Telecallers and counselors primarily work in All Contacts, Hot Leads, Daily Command, and Workboard.',
    'CEO/Admin primarily use Daily Command, CEO Command, Spend, Analytics, Team, and Settings.'
  ], { x: 4.25, y: 3.55, w: 7.7, h: 2.3 });
  addCallout(s, 'Do not use these incorrect labels in training', 'Campaign Spend, Reconciliation Dashboard, Reports tab, Sync Meta tab, Sync Google tab. These names are not present in the live CRM.', 0.8, 6.1, 11.4, 0.72, 'FDEFEF');
}

// Slide 5
{
  const s = pptx.addSlide('SANTAAN_MASTER');
  addTitle(s, 'Role map and SLA', 'Role guidance is already embedded in the CRM. Users should see a mission, SLA, and quick tabs after login.');
  addImageContain(s, img('crm-role-guide.png'), 0.7, 1.75, 4.15, 5.15);
  addBullets(s, [
    'CEO / CRM Ops Admin: weekly review completed with named owners and deadlines.',
    'Agency Ops / Performance: daily spend and campaign updates completed by 11:00 AM.',
    'Field Executive: all activities logged within 24 hours with tracking handle.',
    'IVR / Telecalling: hot leads in 10 minutes, all new leads within 2 hours.',
    'Counselor: qualified leads actioned same day with outcome and reason codes.'
  ], { x: 5.15, y: 2.0, w: 7.1, h: 3.9 });
  addCallout(s, 'Why the role guide matters', 'It reduces user confusion. The system should tell users what to update instead of expecting them to remember process from memory.', 5.18, 6.0, 7.0, 0.82, 'FFF7E9');
}

// Slide 6
{
  const s = pptx.addSlide('SANTAAN_MASTER');
  addTitle(s, 'Agency workflow: where to work every day', 'Agency users are not expected to roam the CRM. Their operating loop is narrow and deliberate.');
  addBullets(s, [
    'Step 1: Open Daily Command to see any red items or pending action.',
    'Step 2: Open Spend and sync Meta / Google for the reporting date.',
    'Step 3: Open Ops Inputs and add one campaign row per active campaign per day.',
    'Step 4: Validate totals in Analytics if needed.',
    'Step 5: Log anomalies or optimization notes; do not leave mismatches undocumented.'
  ], { x: 0.82, y: 1.9, w: 5.7, h: 3.7 });
  addCallout(s, 'Daily cutoff', 'Agency reporting discipline for the live product: Ops Inputs complete by 11:00 AM IST. Spend sync / validation complete by 11:15 AM IST.', 0.82, 5.85, 5.8, 0.82, 'E6F2EE');
  addCallout(s, 'Do not train old timings', 'If a slide says 10:00 AM, 6:00 PM, or 7:00 PM reconciliation as the formal agency reporting SLA, that deck is outdated.', 6.9, 5.85, 5.3, 0.82, 'FDEFEF');
  addImageContain(s, img('ops-inputs-agency.png'), 6.9, 1.78, 5.35, 3.85);
}

// Slide 7
{
  const s = pptx.addSlide('SANTAAN_MASTER');
  addTitle(s, 'Spend screen: the actual Meta/Google workflow', 'There are no separate Sync Meta or Sync Google tabs. Everything happens on one Spend screen.');
  addImageContain(s, img('spend-form-help.png'), 0.7, 1.78, 7.05, 5.1);
  addBullets(s, [
    'Set Spend Date for the reporting day.',
    'Keep Channel, UTM Campaign, Center, Asset, Amount, and Notes available for manual fallback.',
    'Use Sync Meta to pull platform spend for the selected date.',
    'Use Sync Google to pull Google Ads spend for the selected date.',
    'Use Google Debug when Google data needs customer-level audit.',
    'Read Google Auto Sync Health at the top before escalating a failure.'
  ], { x: 8.0, y: 1.95, w: 4.3, h: 3.9 });
  addCallout(s, 'Expected success message', 'Meta sync completed for YYYY-MM-DD. Rows: X, campaigns: Y, accounts: Z, spend: ₹...\nGoogle sync completed for YYYY-MM-DD. Rows: X, campaigns: Y, customers: Z, spend: ₹...', 7.95, 5.95, 4.35, 0.9, 'E8F0EC');
}

// Slide 8
{
  const s = pptx.addSlide('SANTAAN_MASTER');
  addTitle(s, 'Reconciliation rules', 'Most reporting confusion comes from comparing the wrong scope or using the wrong spend definition.');
  addBullets(s, [
    'Compare the exact same date in CRM and the ad platform.',
    'Compare the exact same account scope: one ad account vs one ad account, or combined vs combined.',
    'For ROI, use platform delivery spend (pre-GST).',
    'Invoice totals with GST are finance numbers, not campaign performance numbers.',
    'Campaign-level variance below ₹1.00 is acceptable rounding tolerance.',
    'Daily account-level variance below ₹5.00 is acceptable tolerance during stabilization.'
  ], { x: 0.82, y: 1.95, w: 6.2, h: 4.2 });
  addCallout(s, 'Escalate only when material', 'Escalate only if mismatch is above tolerance, or if campaign/date/account selection cannot explain the difference. Every escalation must include date, platform, accounts selected, CRM total, platform total, and screenshot evidence.', 7.25, 2.1, 5.05, 1.85, 'FDEFEF');
  addCallout(s, 'Meta example already validated', 'When CRM showed ₹2,889.10 and the two Meta ad accounts were combined correctly, the CRM matched the platform. The earlier dispute came from comparing combined CRM spend against single-account Meta views.', 7.25, 4.25, 5.05, 1.65, 'E6F2EE');
}

// Slide 9
{
  const s = pptx.addSlide('SANTAAN_MASTER');
  addTitle(s, 'Ops Inputs: Agency form', 'Spend alone does not make the dashboard useful. Agency rows add campaign context, quality, and output.');
  addImageContain(s, img('ops-inputs-agency.png'), 0.72, 1.82, 6.7, 4.95);
  addBullets(s, [
    'Mandatory fields in the live form: Report Date, Platform, Center, Campaign ID, Campaign Name, UTM Source, UTM Medium, UTM Campaign, Spend, Impressions, Clicks, Leads, Qualified Leads, Registrations.',
    'Notes should be short and factual: optimization change, anomaly, platform issue, or pacing context.',
    'The form itself states: one row per campaign per day, mandatory by 11:00 AM IST.'
  ], { x: 7.7, y: 1.95, w: 4.5, h: 3.85 });
  addCallout(s, 'Do not invent fields in training', 'Fields like Campaign Objective, Input By, sign-off signature, or separate reconciliation stage are not part of the live Agency form unless added later.', 7.72, 5.95, 4.45, 0.82, 'FDEFEF');
}

// Slide 10
{
  const s = pptx.addSlide('SANTAAN_MASTER');
  addTitle(s, 'Ops Inputs: Field and TV logging', 'Offline execution must become traceable data. If source tagging is weak here, CEO-level ROI becomes guesswork later.');
  addImageContain(s, img('ops-inputs-field.png'), 0.7, 1.8, 5.95, 4.55);
  addImageContain(s, img('ops-inputs-tv.png'), 6.82, 1.8, 5.8, 4.55);
  addCallout(s, 'Field team must include', 'Center, location, owner, activity type, date, and at least one tracking handle such as QR, short URL, call number, or WhatsApp number.', 0.76, 6.0, 5.85, 0.82, 'E8F0EC');
  addCallout(s, 'TV / broadcast must include', 'Channel, run date, asset or show reference, center mapping, and the response path being used for attribution.', 6.88, 6.0, 5.66, 0.82, 'E8F0EC');
}

// Slide 11
{
  const s = pptx.addSlide('SANTAAN_MASTER');
  addTitle(s, 'Telecalling and counselor work', 'Lead handling quality depends on consistent status updates and next-step discipline.');
  addBullets(s, [
    'Telecaller / IVR flow: work Hot Leads first, then all new leads, update last contact, next follow-up, outcome, and reason code.',
    'Qualified leads must include a clear handoff note for the counselor.',
    'Lost leads must never be closed without a standardized reason.',
    'Counselor flow: same-day action on qualified leads, update consult outcome, registration status, or defer/loss reason.',
    'These users primarily work in All Contacts, Hot Leads, Daily Command, and Workboard.'
  ], { x: 0.82, y: 1.95, w: 6.2, h: 4.0 });
  addCallout(s, 'SLA to train clearly', 'Hot leads in 10 minutes. All new leads in 2 hours. Qualified leads actioned same day.', 7.25, 2.1, 5.0, 1.0, 'E6F2EE');
  addCallout(s, 'Leadership consequence', 'If telecalling and counselor notes are incomplete, CEO Command can show volume but not trustworthy conversion intelligence.', 7.25, 3.45, 5.0, 1.0, 'FFF7E9');
  addCallout(s, 'Do not train vague closure', '“Call done” is not enough. Users must leave status, next action, or a valid reason code.', 7.25, 4.8, 5.0, 1.0, 'FDEFEF');
}

// Slide 12
{
  const s = pptx.addSlide('SANTAAN_MASTER');
  addTitle(s, 'Daily operating rhythm', 'This is the rhythm that keeps the dashboard decision-ready by evening.');
  addCallout(s, '09:00 AM | IVR lead', 'Review fresh leads, assign queues, and clear hot-lead risk.', 0.82, 2.0, 2.35, 1.15, 'F7FBF9');
  addCallout(s, '11:00 AM | Agency', 'Update Ops Inputs rows for live campaigns.', 3.35, 2.0, 2.35, 1.15, 'E6F2EE');
  addCallout(s, '11:15 AM | Agency', 'Complete Spend sync and validation.', 5.88, 2.0, 2.35, 1.15, 'E6F2EE');
  addCallout(s, '03:00 PM | Ops teams', 'Correction round for missing updates, stale leads, and blockers.', 8.41, 2.0, 2.35, 1.15, 'F7FBF9');
  addCallout(s, '07:30 PM | CEO/Admin', 'Review Daily Command, CEO Command, and assign owners.', 10.94, 2.0, 1.45, 1.15, 'FFF7E9');
  addBullets(s, [
    'Workboard should be updated through the day, not only at day-end.',
    'Teams should not wait for WhatsApp reminders to complete CRM basics.',
    'The dashboard should surface what to do; the process should not depend on memory.'
  ], { x: 1.0, y: 3.65, w: 5.5, h: 2.0 });
  addCallout(s, 'Leadership review logic', 'CEO/Admin should see: lead volume, speed-to-lead, source quality, spend visibility, leakage, and clear owner assignments. The dashboard is valuable only if input discipline is sustained.', 7.0, 3.75, 5.2, 1.5, 'E8F0EC');
}

// Slide 13
{
  const s = pptx.addSlide('SANTAAN_MASTER');
  addTitle(s, 'Common mistakes to avoid', 'These are the errors that create noise and erode trust in the CRM.');
  addBullets(s, [
    'Teaching labels that do not exist in the live UI.',
    'Comparing single-account platform data against combined CRM sync totals.',
    'Using post-GST finance totals as campaign ROI numbers.',
    'Leaving UTM Campaign or Campaign ID blank in agency rows.',
    'Logging offline activity without a tracking handle.',
    'Closing leads without next action or reason code.',
    'Treating Workboard as optional.',
    'Presenting sample metrics as if they are live product truth.'
  ], { x: 0.82, y: 1.95, w: 6.3, h: 4.2 });
  addCallout(s, 'Training rule', 'Accuracy beats polish. If a process is not in the product today, keep it out of the training deck.', 7.35, 2.2, 4.9, 0.95, 'FDEFEF');
  addCallout(s, 'Escalation standard', 'When users report a mismatch, ask first: Which date? Which account scope? Which button? What exact CRM message? What exact screenshot?', 7.35, 3.55, 4.9, 1.15, 'E6F2EE');
}

// Slide 14
{
  const s = pptx.addSlide('SANTAAN_MASTER');
  addTitle(s, 'Final operating checklist for tomorrow’s training', 'Use this sequence in the live session so users learn the real product in the right order.');
  addBullets(s, [
    'Show the login page and tell users exactly what exists there.',
    'Open the dashboard and point to the real tab names.',
    'Explain role-based access and why not everyone sees every tab.',
    'Walk agency users through Spend first, then Ops Inputs.',
    'Walk field users through Field / TV logs and the need for tracking handles.',
    'Walk telecallers and counselors through status discipline and handoff notes.',
    'Close with reconciliation rules, tolerances, and escalation protocol.'
  ], { x: 0.82, y: 1.95, w: 6.0, h: 4.0 });
  addCallout(s, 'Current CRM URL', 'https://santaan-web.vercel.app/login', 7.15, 2.05, 5.0, 0.8, 'E6F2EE');
  addCallout(s, 'Current support model', 'Role access issues and process blockers go to CRM Ops Admin / CEO delegate. Do not invent a helpdesk process in training unless it exists operationally.', 7.15, 3.2, 5.0, 1.1, 'FFF7E9');
  addCallout(s, 'End state', 'After the training, each user should know: where they work, what they must update, by when, and how leadership uses their data.', 7.15, 4.75, 5.0, 1.1, 'F7FBF9');
}

pptx.writeFile({ fileName: OUT });
console.log(OUT);
