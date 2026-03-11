# Santaan CRM Agency Training Deck Script
Date: March 10, 2026  
Audience: Budventure + Odisha Agency Teams  
Trainer: CRM Ops Admin / CEO Delegate  
Duration: 45 minutes + 15 minutes Q&A

---

## Slide 1 - Title
On screen text:
- Santaan CRM Agency Onboarding
- Single Source of Truth for Spend, Performance, and Accountability

Trainer line:
- "Today we are locking one reporting method. From now on, if it is not in CRM, it is not reported."

---

## Slide 2 - Session Goal
On screen text:
- Align agency reporting with Santaan CRM
- Remove data conflicts between screenshots and dashboards
- Standardize daily workflow

Trainer line:
- "The objective is not just tool usage. The objective is decision-ready data for CEO review every week."

---

## Slide 3 - Ground Rules (Non-Negotiable)
On screen text:
- CRM is operational source of truth
- ROI uses pre-GST platform spend
- Post-GST invoice is finance reconciliation only
- Daily SLA cutoff: 11:15 AM IST

Trainer line:
- "For campaign performance, use Meta/Google delivery spend. Invoice tax numbers are tracked separately."

---

## Slide 4 - Login Flow (Live Demo)
On screen text:
- URL: https://santaan-web.vercel.app/login
- Use role email and shared team password
- Open Admin Dashboard after login

Action sequence:
1. Go to Login page.
2. Enter agency role account.
3. Click Sign In.
4. Open `Admin Dashboard`.

Trainer line:
- "Every day starts from login and dashboard check. No work starts outside CRM."

---

## Slide 5 - Where Agency Works
On screen text:
- Main tabs: Analytics, CEO Command, Ops Inputs
- Agency primary modules:
- Campaign Spend Tracking
- Ops Inputs -> Agency

Action sequence:
1. In `CRM Dashboard`, click `Analytics`.
2. Scroll to `Campaign Spend Tracking`.
3. Click `Ops Inputs`.
4. Select `Agency`.

Trainer line:
- "These two modules are mandatory for agency. Other tabs are reference only."

---

## Slide 6 - Spend Sync (Meta) Click-by-Click
On screen text:
- Purpose: Fetch campaign spend from Meta API by date
- Output: rows, campaigns, accounts, total spend

Action sequence:
1. In `Campaign Spend Tracking`, set `Spend Date` to reporting date.
2. Confirm `Channel` is `meta`.
3. Click `Sync Meta`.
4. Wait for green message.
5. Read result text.

Expected result:
- `Meta sync completed for YYYY-MM-DD. Rows: X, campaigns: Y, accounts: Z, spend: ₹...`

Trainer line:
- "Always verify account count. If account count is 2, this is combined spend across two ad accounts."

---

## Slide 7 - Spend Sync (Google) Click-by-Click
On screen text:
- Purpose: Fetch Google Ads spend by date and customer IDs
- Output: rows, campaigns, customers, total spend

Action sequence:
1. Keep same `Spend Date`.
2. Click `Sync Google`.
3. If needed, click `Google Debug`.
4. Review customer-wise output.

Expected result:
- `Google sync completed for YYYY-MM-DD... customers: N, spend: ₹...`

Trainer line:
- "Google Debug is not optional when something looks off. It is the first audit step."

---

## Slide 8 - Understanding the Red Error Line
On screen text:
- Green line = successful sync call
- Red line = some other API call failed
- Do not assume green and red refer to same action

Trainer line:
- "If Meta sync is green and red text appears, report the exact button you clicked and timestamp. We isolate by module."

---

## Slide 9 - Manual Spend Entry (When Needed)
On screen text:
- Use only when API sync is unavailable
- Required fields: Date, Channel, UTM Campaign, Amount
- Keep campaign naming consistent

Action sequence:
1. Fill Date.
2. Fill Channel.
3. Fill UTM Campaign.
4. Fill Amount.
5. Click `Add Spend`.

Trainer line:
- "Manual entry is fallback, not default. API sync is preferred."

---

## Slide 10 - Ops Inputs -> Agency (Mandatory by 11:00 AM)
On screen text:
- One row per campaign per day
- This captures performance context beyond raw spend

Action sequence:
1. Click `Ops Inputs`.
2. Click `Agency`.
3. Fill row fields.
4. Click `Add` / `Save`.

Trainer line:
- "Spend alone is not enough. CEO needs leads, quality, and registrations in same timeline."

---

## Slide 11 - Ops Inputs Required Fields
On screen text:
- Report Date
- Platform
- Center
- Campaign ID
- Campaign Name
- UTM Campaign
- Spend
- Leads
- Qualified Leads
- Registrations

Trainer line:
- "If campaign ID or UTM campaign is missing, attribution quality drops and weekly review becomes unreliable."

---

## Slide 12 - Reconciliation SOP (Daily)
On screen text:
- Reconcile CRM vs platform totals for same date
- Match account scope before comparing
- Escalate mismatch > ₹1

Action sequence:
1. Match date filter exactly.
2. Match account selection exactly.
3. Compare totals.
4. If mismatch > ₹1, log escalation template.

Trainer line:
- "Most mismatches are scope mismatch: one account vs two accounts."

---

## Slide 13 - Escalation Template
On screen text:
- Date
- Platform
- Accounts selected
- CRM total
- Platform total
- Difference
- Campaign IDs impacted
- Screenshot evidence

Trainer line:
- "No generic escalation. Every escalation must be structured and evidence-backed."

---

## Slide 14 - Daily SLA Board
On screen text:
- 11:00 AM: Ops Inputs complete
- 11:15 AM: Spend sync complete
- Same-day: mismatch escalation if any
- EOD: optimization notes updated

Trainer line:
- "This is not a reporting ritual. This is operations discipline."

---

## Slide 15 - Weekly CEO Review Logic
On screen text:
- CEO Command reads:
- Spend quality by channel
- Lead conversion and leakage
- Center-level momentum
- Owner-wise action completion

Trainer line:
- "If your daily updates are incomplete, CEO decisions become guesswork."

---

## Slide 16 - Common Mistakes to Avoid
On screen text:
- Wrong date selected
- Single account compared against combined CRM
- Missing campaign ID
- Wrong UTM naming
- Late updates after SLA cutoff

Trainer line:
- "All five are avoidable with checklist discipline."

---

## Slide 17 - Live Practice Exercise (5 Minutes)
On screen text:
- Date: 2026-03-05
- Run Meta sync
- Add one Ops Inputs row
- Report total and account count

Action sequence:
1. Set spend date.
2. Click `Sync Meta`.
3. Note spend and accounts.
4. Enter one campaign row in Ops Inputs -> Agency.

Trainer line:
- "We validate skill through action, not passive listening."

---

## Slide 18 - Acceptance Checklist
On screen text:
- User can login without help
- User can run Meta and Google sync
- User can submit Ops Inputs row correctly
- User can perform daily reconciliation
- User can raise structured escalation

Trainer line:
- "If all five are done, training is complete."

---

## Slide 19 - Commitment Slide
On screen text:
- Start Date: March 10, 2026
- SLA active from Day 1
- SPOC-based accountability

Trainer line:
- "From tomorrow, the CRM record is the official operating record."

---

## Slide 20 - Q&A
On screen text:
- Clarify role
- Clarify workflow
- Clarify SLA
- Clarify escalation path

Trainer line:
- "Ask now. From tomorrow, process compliance is expected."

---

## Appendix A - Trainer Opening Script (Read Verbatim)
"Good morning team. Today we are not introducing a new spreadsheet. We are implementing a unified operating system for Santaan growth. Every spend number, campaign movement, and performance signal must be captured in CRM so CEO decisions are based on one reliable source. We will do this practically: login, sync, input, reconcile, escalate. By the end of this session, each team member should be able to complete their daily responsibilities without assistance."

## Appendix B - Trainer Closing Script (Read Verbatim)
"Thank you everyone. Starting March 10, 2026, CRM update compliance is mandatory. If there is a data mismatch, escalate with structure and proof. If there is a role or access blocker, raise it same day. We are now moving from fragmented reporting to accountable execution."

