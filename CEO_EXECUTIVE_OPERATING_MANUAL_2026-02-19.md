# Santaan CEO Executive Operating Manual
Version: 1.0
Prepared on: February 19, 2026 (IST)
Audience: CEO, Admin Leadership, Marketing Head, CRM/Counseling Leads

## 1. Executive Summary
This manual defines how Santaan should use the website + admin dashboard as a growth operating system.

The system is intended to answer 5 leadership questions every week:
1. Are we generating enough qualified leads by center?
2. Are we converting fast enough into consults/patients?
3. Which channels and campaigns are creating real ROI?
4. Where are leads leaking (delay, attribution, counseling, trust)?
5. Which exact actions should each owner execute this week?

This is not a reporting document. It is an action and accountability document.

---

## 2. What Is Live and Real (Not Mock)
As of February 19, 2026, the following modules are connected to production data:

### Admin Dashboard modules
1. CRM Contact Management (list/create/edit/delete)
2. Analytics (channel/campaign/landing performance)
3. CEO Command Center (funnel health + action queue + center performance)
4. Team Management (admin access management)
5. Settings Management (operational configuration keys)
6. Centers Management (branch data and ordering)
7. Announcements Management (public updates/news/awards)

### Backing production APIs
1. `/api/admin/contacts`
2. `/api/admin/contacts/[id]`
3. `/api/admin/team`
4. `/api/admin/settings`
5. `/api/admin/centers`
6. `/api/admin/announcements`

### Security status
Admin endpoints are now protected for write/admin scopes. Public-safe reads remain available where intended (active centers/announcements).

---

## 3. Data Model Leadership Must Know
Core production entities:
1. `contacts` -> leads, funnel status, attribution, source quality
2. `users` / `admins` -> access and roles
3. `settings` -> KPI and operational configuration
4. `centers` -> branch/city operational metadata
5. `announcements` -> trust and campaign content blocks
6. `blog_posts` -> patient + doctor content streams

### Funnel statuses (strict)
Use only:
1. `new`
2. `contacted`
3. `qualified`
4. `converted`
5. `lost`

If statuses are inconsistent, dashboard decisions become unreliable.

---

## 4. CEO Command Center: How to Read It
Open: `/admin/dashboard` -> `CEO Command`

### Top KPI cards
1. Total Leads: all tracked inquiries.
2. Converted Patients: count + conversion percentage.
3. High-Intent Leads: lead score >= 70.
4. Avg Lead Score: quality trend.
5. Pending >24h: operational leakage indicator.
6. Attribution Coverage: how visible campaign origin is.

### Funnel Snapshot
Shows stage distribution from `new` to `converted/lost`.
Interpretation:
1. Too many `new/contacted`: follow-up lag.
2. Too many `qualified` but low `converted`: counseling/offer/scheduling friction.
3. High `lost` share: trust, pricing, timing, or response quality issues.

### Weekly Action Queue
Auto-generated priorities from data patterns.
CEO should enforce owner + deadline for each action item.

### Channel ROI
Compares channels by leads, conversions, conversion rate, stale leads.
Use to decide scale/hold/cut budget.

### Center Performance
Compares Bhubaneswar/Berhampur/Bangalore by leads and conversion.
Use for center-level accountability and intervention.

### Asset ROI (Campaign + Landing Path)
Use to identify which exact campaign + page combinations perform best/worst.

---

## 5. New Feature: Week-1 Target vs Actual (Center-wise)
The CEO dashboard now includes a target tracker fed from `settings` keys (`ceo_week1_*`).

For each center, it shows:
1. Leads actual vs target (+ stretch)
2. Converted actual vs target
3. Conversion % actual vs min target
4. Attribution % actual vs min target
5. Pending >24h actual vs max limit
6. Overall status: `On track` / `Behind` / `No target`

This enables management by objective, not intuition.

---

## 6. Week-1 Center KPI Targets (Loaded in Settings)
Window: February 23, 2026 -> March 1, 2026

### Bhubaneswar
1. Leads: 24 (stretch 30)
2. High-intent leads: 8
3. Qualified leads: 12
4. Converted leads: 3
5. Conversion rate: >= 12.5%
6. Pending >24h: <= 2
7. Attribution coverage: >= 95%
8. First response <= 2h: >= 90%

### Berhampur
1. Leads: 12 (stretch 16)
2. High-intent leads: 4
3. Qualified leads: 6
4. Converted leads: 1
5. Conversion rate: >= 8.0%
6. Pending >24h: <= 1
7. Attribution coverage: >= 95%
8. First response <= 2h: >= 90%

### Bangalore
1. Leads: 16 (stretch 22)
2. High-intent leads: 5
3. Qualified leads: 8
4. Converted leads: 2
5. Conversion rate: >= 10.0%
6. Pending >24h: <= 1
7. Attribution coverage: >= 95%
8. First response <= 2h: >= 90%

### Network-wide non-negotiables
1. `Not Tagged` leads: 0
2. Attribution coverage overall: >= 95%
3. Stale pending leads (>24h): < 4 total

---

## 7. Daily CEO Operating Routine (15-30 min)
### Morning
1. Check Pending >24h.
2. Check attribution coverage.
3. Check center status in target-vs-actual table.
4. Assign same-day owners for gaps.

### Evening
1. Review lead movement (`new` -> `contacted` -> `qualified`).
2. Confirm follow-up completion.
3. Ensure no center slips into stale backlog.

---

## 8. Weekly CEO Operating Routine (60-90 min)
Run this every Sunday.

1. Review center targets vs actual.
2. Review channel ROI and asset ROI.
3. Compare conversion efficiency by center.
4. Decide budget shifts (+10-15% to winners, reduce weak assets).
5. Approve next-week action list with owner + due date.

Mandatory outputs:
1. 3 scale decisions
2. 3 fix decisions
3. 1 cross-team priority for next week

---

## 9. Team Roles and Accountability
### CEO
1. Sets weekly targets
2. Approves budget shifts
3. Forces closure discipline

### Marketing Manager
1. UTM compliance
2. Creative and landing alignment
3. Channel/campaign performance ownership

### CRM Lead
1. Follow-up SLA
2. Stale lead elimination
3. Contact hygiene

### Counseling Lead
1. Qualified-to-converted improvement
2. Script quality
3. Objection handling consistency

### Center Ops Lead
1. Slot and consult readiness
2. Center response quality
3. Center-level conversion gap closure

---

## 10. Funnel SLA Standards (Operational)
1. New lead first response: <= 2 hours
2. High-intent lead callback: same day
3. Qualified lead specialist slot: <= 24 hours
4. Pending >24h: must be cleared daily

These are operational SLAs, not optional goals.

---

## 11. Asset + UTM Governance (Critical)
Every external link must include UTMs.

Standard format:
`https://santaan.in/<landing-path>?utm_source=<source>&utm_medium=<medium>&utm_campaign=<campaign>&utm_content=<creative>&utm_term=<term>`

Examples:
1. TV QR: `utm_source=tv&utm_medium=offline&utm_campaign=brand_q1`
2. Hoarding QR: `utm_source=hoarding&utm_medium=offline&utm_campaign=bbsr_launch`
3. Instagram reel: `utm_source=instagram&utm_medium=organic&utm_campaign=pcos_awareness`
4. Meta ads: `utm_source=facebook&utm_medium=cpc&utm_campaign=ivf_conversion_q1`

Naming rules:
1. Lowercase only
2. Use `_`
3. No spaces
4. Include city/service intent when relevant

---

## 12. Decision Rules for CEO (Use Exactly)
1. If attribution < 90% in any center: freeze incremental spend until fixed.
2. If Pending >24h exceeds target for 2 days: escalate to CRM + Counseling immediately.
3. If center conversion < target by >40%: mandatory root-cause review.
4. If one channel has volume but low conversion for 2 cycles: creative + landing reset.

---

## 13. Team Module Manual
### Team tab
Purpose: add/remove admin access.

Policy:
1. Only active accountable managers get admin access.
2. Remove access same day when role changes.

### Settings tab
Purpose: control KPI/ops settings (`ceo_week1_*`, analytics keys, etc.).

Policy:
1. Store targets here, not in WhatsApp threads.
2. Update settings only in weekly leadership review.

### Centers tab
Purpose: maintain center metadata and ordering.

Policy:
1. Keep active centers accurate.
2. Ensure city naming consistency (Bhubaneswar/Berhampur/Bangalore).

### Announcements tab
Purpose: trust and campaign messaging.

Policy:
1. Publish only current, verified updates.
2. Use pinned announcements for key campaign periods.

---

## 14. Security Protocol (Leadership)
1. Admin credentials must not be shared on chat groups.
2. Password rotation cadence: every 90 days.
3. Disable access for inactive team members immediately.
4. Use only approved admins for production changes.

Current emergency reset baseline:
1. Admin password rotated and shared only via CRM Ops Admin
2. CEO should schedule mandatory password refresh after onboarding cycle.

---

## 15. Weekly CEO Review Template
Copy this into your weekly review note.

1. Total leads:
2. Converted:
3. Conversion %:
4. High-intent leads:
5. Pending >24h:
6. Attribution %:
7. Best channel:
8. Weak channel:
9. Best campaign+landing asset:
10. Worst campaign+landing asset:
11. Bhubaneswar target status:
12. Berhampur target status:
13. Bangalore target status:
14. Actions approved (owner + date):

---

## 16. 30-Day Growth Outcome Expectations
If this manual is executed strictly for 30 days:
1. Attribution blind spots reduce sharply.
2. Lead leakage from delayed follow-up drops.
3. Budget quality improves (less waste, better conversions).
4. Center-level accountability becomes measurable.
5. CEO decisions become data-backed and faster.

---

## 17. Appendix: Where to Find Everything
1. CEO command module: `/admin/dashboard` -> `CEO Command`
2. Week-1 setup runbook: `/Users/spr/santaan hope/santaan-web/CEO_FIRST_WEEK_SETUP_2026-02-19.md`
3. Growth operating manual: `/Users/spr/santaan hope/santaan-web/CEO_GROWTH_JOB_MANUAL_2026-02-19.md`
4. This executive manual: `/Users/spr/santaan hope/santaan-web/CEO_EXECUTIVE_OPERATING_MANUAL_2026-02-19.md`
