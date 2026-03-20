# Santaan CEO Growth Job Manual (Operational)
Date: 2026-02-19
Owner: CEO, Santaan Fertility
Scope: Website-led acquisition, conversion, attribution, and center growth execution

## 1) Purpose
This manual defines how the CEO should use Santaan's website and admin dashboard as a growth operating system, not just a reporting screen.

Primary outcomes:
1. Increase lead-to-patient conversion.
2. Reduce response delays and lead leakage.
3. Allocate budget to high-ROI channels and campaigns.
4. Improve center-level demand planning.
5. Enforce attribution discipline across all assets (TV, hoardings, social, paid).

## 2) What Is Real and Wired (Current System)
The following are database-backed and API-backed features, not mockups:
1. CRM contacts and lead attributes: `/api/admin/contacts`, `/api/admin/contacts/[id]`
2. Team management: `/api/admin/team`
3. Settings management: `/api/admin/settings`
4. Centers management: `/api/admin/centers`
5. Announcements management: `/api/admin/announcements`
6. Analytics module (channel/campaign/landing metrics) in `CampaignAnalytics`
7. CEO Command Center module in `CeoCommandCenter`

Data sources:
1. `contacts` table (funnel, source, lead score, lifecycle)
2. `centers` table (branch configuration)
3. `announcements` table (campaign/news modules)
4. `settings` table (admin-configured ops settings)
5. `users` + `admins` (authorization)

## 3) CEO North-Star Metrics
Track these every week in CEO Command Center:
1. Conversion Rate = Converted Leads / Total Leads
2. High-Intent Lead Count = lead_score >= 70
3. Pending >24h = leads in pending states (`new/contacted/qualified`) with no timely follow-up
4. Attribution Coverage = leads with UTM/source visibility / total leads
5. Center Conversion Mix = center-level leads, conversions, and rates
6. Channel Efficiency = conversions and conversion rate by source

## 4) CEO Daily Workflow (20-30 min)
1. Open `/admin/dashboard` -> `CEO Command` tab.
2. Check 3 red flags first:
   - Pending >24h
   - Attribution coverage below baseline
   - Conversion rate drop vs last review
3. Assign same-day actions:
   - CRM lead for stale lead callbacks
   - Marketing manager for UTM/campaign fixes
   - Counseling lead for qualified-to-converted closure
4. Verify action ownership and due time in team standup.

Daily decision rule:
1. If stale leads > 0: follow-up action is top priority.
2. If attribution coverage < 85%: pause new budget scaling until tagged links are fixed.
3. If high-intent leads exist: mandate same-day callback SLA.

## 5) CEO Weekly Workflow (60-90 min)
1. Review `Analytics` tab:
   - Channel table
   - Campaign table
   - Landing page table
2. Review `CEO Command` tab:
   - Funnel snapshot
   - Channel mix
   - Center demand and conversion
   - Weekly action queue
3. Budget actions:
   - Scale top 1-2 performing assets by 10-15%
   - De-prioritize channels with volume but weak conversion
4. Conversion actions:
   - Audit scripts for `qualified` leads not converting
   - Fix appointment friction, callback lag, or mismatch in landing message
5. Team actions:
   - Confirm clear owners for each action item
   - Carry unresolved tasks to next week with dates

## 6) Team Structure and Ownership
Minimum growth operating team:
1. CEO (decision owner): budget, growth direction, center strategy
2. Marketing Manager: channels, campaigns, UTMs, creative/landing match
3. CRM Lead: lead hygiene, follow-up SLA, pipeline discipline
4. Counseling Lead: conversion scripts and closure quality
5. Center Operations Lead: center-level readiness and slot management

Ownership matrix:
1. Attribution coverage: Marketing Manager
2. Pending >24h: CRM Lead
3. Qualified-to-converted: Counseling Lead
4. Center conversion gaps: Center Ops + Counseling
5. Reporting cadence and final decisions: CEO

## 7) Funnel Definition (Use These Exact Stages)
Allowed lead statuses:
1. `new`
2. `contacted`
3. `qualified`
4. `converted`
5. `lost`

SLA targets:
1. New lead first-response: <= 2 hours
2. Qualified lead specialist slot: <= 24 hours
3. High-intent lead callback: same day
4. Stale pending leads (>24h): zero by end of day

## 8) Asset and Tagging Standards (Mandatory)
Every outbound asset must carry UTMs.

UTM template:
`https://santaan.in/<landing-path>?utm_source=<source>&utm_medium=<medium>&utm_campaign=<campaign>&utm_content=<creative>&utm_term=<keyword_or_audience>`

Examples:
1. TV QR: `utm_source=tv&utm_medium=offline&utm_campaign=brand_q1`
2. Hoarding QR: `utm_source=hoarding&utm_medium=offline&utm_campaign=center_launch_bbsr`
3. Instagram reel: `utm_source=instagram&utm_medium=organic&utm_campaign=pcos_education`
4. Meta ads: `utm_source=facebook&utm_medium=cpc&utm_campaign=ivf_consult_q2`

Naming rules:
1. Lowercase only
2. Use underscore separators
3. No spaces or date ambiguity
4. Include city/service when relevant (`ivf_bhubaneswar_q2`)

## 9) CEO Action Thresholds
Use these objective triggers:
1. Conversion rate < 10% for 2 consecutive weeks:
   - Trigger script audit and landing page review
2. Pending >24h > 5 leads:
   - Trigger mandatory callback blitz in 24h
3. Attribution coverage < 85%:
   - Trigger UTM compliance sweep and campaign freeze for non-tagged assets
4. Any center conversion rate 30% below best center:
   - Trigger center-specific operational diagnosis

## 10) Admin Modules: CEO Use Cases
1. `Analytics` tab:
   - Decide budget shifts by channel/campaign efficiency
2. `CEO Command` tab:
   - Run weekly command review and assign execution actions
3. `Team` tab:
   - Control admin access and accountability ownership
4. `Settings` tab:
   - Maintain operational settings consistency
5. `Centers` tab:
   - Keep center metadata and ordering accurate for lead routing clarity
6. `Announcements` tab:
   - Publish trust and campaign updates aligned with active acquisition goals

## 11) Data Hygiene Rules
1. No lead should remain without status.
2. Every converted lead must be marked `converted`.
3. Every campaign link must include UTM fields.
4. Contacts with missing source data must be corrected in 48h.
5. Do not run growth reviews on stale/unclean CRM data.

## 12) Security and Access Rules
1. Admin access is role-based and registry-backed.
2. Sensitive admin APIs require authenticated admin authorization.
3. Default weak password policy is removed.
4. Admin password baseline is rotated periodically and shared only via CRM Ops Admin.
5. CEO should mandate immediate periodic password rotation (quarterly minimum).

## 13) CEO Weekly Review Template (Copy/Paste)
1. Total leads this week:
2. Converted patients this week:
3. Conversion rate (%):
4. High-intent leads (#):
5. Pending >24h (#):
6. Attribution coverage (%):
7. Top 3 channels by conversion:
8. Bottom 2 channels by conversion:
9. Best campaign and why:
10. Worst campaign and corrective action:
11. Center with highest conversion:
12. Center needing intervention:
13. 3 committed actions (owner + deadline):

## 14) CEO Final Principle
The dashboard is an execution cockpit. Growth comes from:
1. Fast follow-up
2. Clean attribution
3. Budget discipline
4. Clinical trust signals
5. Weekly action closure

If these five are enforced, Santaan's website will function as a measurable growth engine, not just a brand surface.
