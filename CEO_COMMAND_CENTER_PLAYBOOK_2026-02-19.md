# CEO Command Center Playbook (Santaan)
Date: 2026-02-19  
Applies to: https://santaan.in/admin/dashboard

## 1) Reality check: this is real, not mock
This dashboard is driven by backend APIs + database writes, not static numbers.

## Proof from implementation
1. CRM page fetches live data from backend API:
- `/Users/spr/santaan hope/santaan-web/src/components/admin/CRM.tsx:84`
- `/Users/spr/santaan hope/santaan-web/src/components/admin/CRM.tsx:87`

2. Add/Edit/Delete are real API calls:
- Add contact POST: `/Users/spr/santaan hope/santaan-web/src/components/admin/CRM.tsx:175`
- Update contact PUT: `/Users/spr/santaan hope/santaan-web/src/components/admin/CRM.tsx:130`
- Delete contact DELETE: `/Users/spr/santaan hope/santaan-web/src/components/admin/CRM.tsx:147`

3. Admin contacts API reads/writes Turso/DB via Drizzle:
- GET/POST: `/Users/spr/santaan hope/santaan-web/src/app/api/admin/contacts/route.ts:10`
- PUT/DELETE: `/Users/spr/santaan hope/santaan-web/src/app/api/admin/contacts/[id]/route.ts:14`

4. Access is protected by admin auth check:
- `/Users/spr/santaan hope/santaan-web/src/lib/auth-helper.ts:7`
- `/Users/spr/santaan hope/santaan-web/src/app/api/admin/contacts/route.ts:14`

5. CRM schema is real and includes attribution + funnel fields:
- `/Users/spr/santaan hope/santaan-web/src/db/schema.ts:4`
- `/Users/spr/santaan hope/santaan-web/src/db/schema.ts:35`

6. Analytics cards are computed from actual contact rows:
- `/Users/spr/santaan hope/santaan-web/src/components/admin/CampaignAnalytics.tsx:53`
- `/Users/spr/santaan hope/santaan-web/src/components/admin/CeoCommandCenter.tsx:91`

7. Lead ingestion into contacts table is real from public actions:
- Newsletter: `/Users/spr/santaan hope/santaan-web/src/app/api/newsletter/subscribe/route.ts:37`
- Seminar: `/Users/spr/santaan hope/santaan-web/src/app/api/seminar/register/route.ts:15`
- At-home test: `/Users/spr/santaan hope/santaan-web/src/app/api/at-home/register/route.ts:52`
- Call intent tracking: `/Users/spr/santaan hope/santaan-web/src/app/api/track-call/route.ts:11`

## Important honesty note
1. `Analytics` and `CEO Command` tabs are fully wired to live contact data.
2. Team/Settings/Centers/Announcements APIs exist, but the current CRM tab rendering still defaults many tabs to the generic contact table view:
- `/Users/spr/santaan hope/santaan-web/src/components/admin/CRM.tsx:320`

This is not fake data. It means analytics is live, while some admin modules are API-ready and need dedicated UI panels.

---

## 2) What the CEO must know in plain terms
## Team (minimum operating structure)
1. CEO
- Decides scale/pause/shift budget and priorities.

2. Growth Lead / Marketing Manager
- Owns campaigns, UTMs, weekly experiments, budget allocation.

3. Performance Marketer
- Runs Meta/Google assets and landing-page mapping.

4. CRM Lead (counselling ops)
- Owns callback speed, stale lead closure, status discipline.

5. Content Lead
- Owns blog quality, topical clusters, medical review coordination.

6. Social/Reels Lead
- Owns short-video assets and tracked CTA traffic.

7. Clinic Operations Lead
- Owns consult slot availability and conversion handoff.

## Funnel (business definition)
A funnel is the stage-by-stage journey from first touch to converted patient.

1. Awareness (outside CRM)
- Person sees ad/reel/blog/snippet.

2. Visit / Interest
- Person lands on Santaan page.

3. Lead captured
- Form submit / call intent / WhatsApp / newsletter capture creates or updates contact row.

4. CRM statuses (in dashboard)
- `new`: lead created, no meaningful engagement yet.
- `contacted`: first outreach done.
- `qualified`: medically relevant, likely consult candidate.
- `converted`: became paying/active patient in your process definition.
- `lost`: dropped off or disqualified.

5. Post-conversion
- Treatment progression and outcomes (outside current CRM scope unless you extend schema).

---

## 3) CEO dashboard metrics and action rules
## KPI meaning
1. Total Leads
- Count of contact rows in selected dataset.

2. Converted Patients
- Count where `status = converted`.

3. Conversion Rate
- `converted / total leads`.

4. High-Intent Leads
- `leadScore >= 70`.

5. Pending >24h
- Leads in `new/contacted/qualified` with old last-contact timestamps.

6. Attribution Coverage
- Share of leads with source/campaign attribution.

## Action thresholds (non-negotiable)
1. Pending >24h > 10% of total leads
- CEO action: declare 48-hour callback sprint.

2. Attribution coverage < 85%
- CEO action: block new paid campaign launches until UTM discipline is fixed.

3. Lost rate > conversion rate
- CEO action: launch 30-day winback and counselling QA audit.

4. One channel has >2x conversion of others
- CEO action: reallocate 10-20% spend to winning channel for 2-week test.

---

## 4) How assets are created and tracked
## What is an asset
Any growth unit that can drive a lead:
1. Ad creative
2. Reel
3. Landing page
4. Blog article
5. QR code destination
6. WhatsApp click module

## Asset naming convention
Use this exact pattern:
`YYYYMM_CHANNEL_OBJECTIVE_CITY_SERVICE_ANGLE_VARIANT`

Example:
`202602_META_LEAD_BBSR_PCOS_INSULINLOCK_V1`

## Mandatory tag dimensions
Every asset must be tagged across these dimensions:
1. `channel`: meta / google / youtube / organic / referral / hoarding / tv
2. `medium`: cpc / reel / bio / qr / email / whatsapp
3. `campaign`: campaign family name
4. `city`: bhubaneswar / berhampur / bangalore / multi
5. `service`: ivf / pcos / male-factor / thyroid / unexplained / at-home-test
6. `funnel_stage`: awareness / consideration / conversion
7. `persona`: newly-married / trying-1y / trying-3y / 35plus / male-factor
8. `cta`: call / whatsapp / book-assessment

## UTM template standard
Use URL query params for all external links:
1. `utm_source` = platform/channel (e.g. `meta`, `youtube`, `hoarding_qr`)
2. `utm_medium` = traffic type (e.g. `cpc`, `reel`, `qr`)
3. `utm_campaign` = campaign family (e.g. `pcos_bhubaneswar_q1`)
4. `utm_content` = creative variant id (e.g. `insulin_lock_v3`)
5. `utm_term` = optional keyword/intent tag
6. `landing_path` = destination page (captured by app logic where passed)

## Rule
If an asset has no UTM, it does not exist for ROI decisions.

---

## 5) Weekly CEO operating cadence
## Monday (15 min)
1. Review last week conversion rate and stale leads.
2. Confirm 2 scale bets and 2 repair bets.

## Wednesday (10 min)
1. Review if stale leads dropped.
2. Verify attribution coverage improved.

## Friday (20 min)
1. Review `CEO Command` action queue.
2. Approve next week:
- budget shifts
- channel pauses
- top 3 content/reel themes
3. Confirm owner + due date for each action.

---

## 6) Team accountability matrix (RACI style)
1. Conversion rate movement
- Responsible: Growth Lead + CRM Lead
- Accountable: CEO

2. Stale lead reduction
- Responsible: CRM Lead
- Accountable: Clinic Operations Lead

3. Attribution hygiene
- Responsible: Performance Marketer
- Accountable: Growth Lead

4. Blog/reel production quality
- Responsible: Content Lead + Social Lead
- Accountable: Growth Lead

5. Consult slot readiness
- Responsible: Clinic Operations
- Accountable: Clinic Ops Lead

---

## 7) CEO decision templates (copy-paste)
## Template A: Scale winner
"Approve +15% spend shift from [Channel X] to [Channel Y] for 7 days. Keep same landing page and replicate creative [Asset ID]."

## Template B: Fix leakage
"All leads older than 24h must be contacted by 6 PM today. CRM lead to submit closure sheet with outcomes."

## Template C: Attribution enforcement
"No external campaign link goes live without full UTM template. Non-compliant assets are paused immediately."

## Template D: Improve closure
"Counselling lead to audit 20 qualified-but-not-converted cases and present script + process corrections by Friday."

---

## 8) What to build next (to complete admin suite)
1. Dedicated UI panels for `Team`, `Settings`, `Centers`, `Announcements` tabs.
2. Paid spend ingestion (Meta/Google export or API) to compute true financial ROI (not only conversion ROI).
3. Conversion event enrichment (consult booked, consult attended, treatment started) for deeper funnel.
4. Cohort view by city + service + source.

This turns a strong analytics dashboard into a full revenue operating system.
