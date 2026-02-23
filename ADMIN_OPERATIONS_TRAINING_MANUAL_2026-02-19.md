# Santaan Admin Operations and Training Manual
Date: 2026-02-19  
Application: `https://santaan.in/admin/dashboard`

## 1) Purpose
This manual is for:
1. CEO
2. Marketing manager and performance team
3. CRM/counselling/admin staff
4. Content and social teams

Use this to run Santaan as a measurable growth engine, not only a website.

## 2) What is in the admin dashboard
The dashboard now has dedicated modules:
1. Contact operations:
- `All Contacts`
- `Seminar`
- `Newsletter`
- `WhatsApp`
- `Telegram`
- `At-Home Test`
- `Hot Leads`

2. Growth and strategy:
- `Analytics`
- `CEO Command`

3. Admin controls:
- `Team`
- `Settings`
- `Centers`
- `Announcements`

## 3) Team structure and accountability
## CEO
1. Weekly strategy decisions.
2. Budget shift approvals.
3. Bottleneck escalation.

## Growth Lead (Marketing Manager)
1. Campaign strategy and UTM governance.
2. Channel optimization.
3. Weekly growth report to CEO.

## Performance Marketer
1. Ad launch execution.
2. Asset-to-landing mapping.
3. Source/campaign hygiene.

## CRM Lead
1. Callback SLA and stale lead closure.
2. Status integrity (`new` to `converted/lost`).
3. Counsellor follow-up quality.

## Clinic Operations Lead
1. Specialist slot availability.
2. Fast handoff for qualified leads.
3. Winback execution support.

## Content Lead
1. Blog production cadence and quality.
2. Medical consistency and internal linking.

## Social/Reels Lead
1. Reel publishing consistency.
2. CTA and tracked link discipline.

## 4) Funnel definitions (official)
Use these exact definitions in all reviews.

1. `new`
- Lead captured, not yet worked meaningfully.

2. `contacted`
- First outreach done (call/WhatsApp/email).

3. `qualified`
- Clinically relevant and likely consult candidate.

4. `converted`
- Became active patient per Santaan conversion policy.

5. `lost`
- Not progressing or dropped after follow-up process.

## 5) Daily operating SOP (admin + CRM)
1. Open dashboard on shift start.
2. Clear `Pending >24h` leads first.
3. Process all `Hot Leads` with same-day callback.
4. Update every interacted lead status and last contact timestamp.
5. Ensure source/campaign details are present.
6. End shift only after no unresolved urgent callbacks.

## SLA targets
1. First response: under 30 minutes (working hours).
2. High-intent callback: same day.
3. Qualified lead consult slot attempt: under 24 hours.
4. Stale leads target: near zero by end of day.

## 6) Module-by-module training guide
## A) Contact tabs
1. Filter by source segment (`Seminar`, `Newsletter`, etc.).
2. Search by name/email/phone.
3. Use status and channel filters.
4. Update lead data and status from edit action.
5. Use bulk delete only for invalid/test records.
6. Export for audit/reconciliation.

## B) Analytics tab
Read:
1. total leads
2. total conversions
3. conversion rate
4. pending follow-up
5. channel performance
6. campaign performance
7. landing page ROI signals
8. actionable next steps

Use this for weekly marketing review.

## C) CEO Command tab
This is executive action view.

Read in order:
1. North Star conversion rate
2. KPI cards (leads, converted, high-intent, pending >24h, attribution)
3. Funnel snapshot
4. Channel ROI
5. Center performance
6. Asset ROI
7. Weekly action queue

Decide:
1. scale
2. repair
3. pause
4. process enforcement

## D) Team tab
1. Add authorized admin emails.
2. Remove access for exits/transfers.
3. Keep least-privilege discipline.

## E) Settings tab
1. Maintain operational key/value config.
2. Update values and save.
3. Never store secrets in free text settings without policy.

## F) Centers tab
1. Maintain branch address, phones, map URL, sort order.
2. Activate/deactivate centers intentionally.
3. Keep contact data consistent with public listings.

## G) Announcements tab
1. Publish campaigns, awards, events, updates.
2. Control active/pinned state.
3. Set publish and optional expiry timestamps.

## 7) Asset creation and tagging standard
## Asset naming format
`YYYYMM_CHANNEL_OBJECTIVE_CITY_SERVICE_ANGLE_VARIANT`

Example:
`202602_META_LEAD_BBSR_PCOS_INSULINLOCK_V2`

## Mandatory UTM standard
1. `utm_source`: meta/google/youtube/hoarding_qr/tv/referral
2. `utm_medium`: cpc/reel/qr/email/bio/whatsapp
3. `utm_campaign`: campaign family name
4. `utm_content`: creative variant id
5. `utm_term`: optional intent/keyword

If UTM is missing, ROI decisions are invalid.

## 8) CEO weekly growth routine (15-20 min)
## Monday
1. Review previous week conversion and stale leads.
2. Confirm weekly top 3 growth actions.

## Wednesday
1. Mid-week health check:
- stale leads trend
- attribution coverage trend

## Friday
1. Decide scale/pause/repair using CEO Command.
2. Approve next-week budget split by channel.
3. Assign owners + deadlines for action queue.

## 9) Decision thresholds
1. Attribution coverage < 85%:
- Stop non-compliant campaign launches.

2. Pending >24h high:
- Trigger callback sprint and counselling audit.

3. Lost rate > conversion rate:
- Trigger winback workflow + script correction.

4. Top channel clear winner:
- Shift 10-20% spend into winner for controlled 7-day test.

## 10) 2-week staff training rollout
## Week 1
1. Day 1: Dashboard orientation.
2. Day 2: Contact workflow and status hygiene.
3. Day 3: Analytics interpretation.
4. Day 4: UTM/tag discipline.
5. Day 5: Guided live run with supervisor.

## Week 2
1. Day 1: Team/Settings controls.
2. Day 2: Centers/Announcements management.
3. Day 3: CEO Command simulation.
4. Day 4: Escalation and incident handling.
5. Day 5: Certification check with mock cases.

## 11) Quality audit checklist (weekly)
1. Are stale leads dropping?
2. Are statuses updated correctly?
3. Are source/campaign fields filled?
4. Are top assets mapped to right landing pages?
5. Are center and announcement data current?
6. Is CEO action queue being executed on time?

## 12) Escalation matrix
1. API/data issue:
- Owner: engineering support
- SLA: same business day for production blockers

2. Lead leakage/process issue:
- Owner: CRM lead + operations lead
- SLA: immediate triage same day

3. Campaign attribution failure:
- Owner: growth lead
- SLA: fixed before next spend cycle

---
This manual should be used in onboarding, weekly reviews, and monthly performance calibration.
