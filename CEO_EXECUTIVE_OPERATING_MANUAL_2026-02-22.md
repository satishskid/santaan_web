# Santaan CEO Executive Operating Manual
Version: 2.0 (Operational)
Date: February 22, 2026 (IST)
Primary audience: CEO, Marketing Head, CRM Lead, Counseling Lead, Admin Leadership

## 1) Purpose
This manual is for operating growth, not reviewing reports.

CEO objective each week:
1. Know if Santaan is producing qualified demand.
2. Know if demand is converting into patients.
3. Know where money is leaking.
4. Assign fixes with owners and deadlines.

---

## 2) Reality Audit: Live vs Cosmetic
Based on current implementation and production behavior, the dashboard is real-data driven, but not all metrics are equally decision-ready.

## 2.1 Confirmed Live (Database-backed, not mock)
1. Leads/contacts pipeline (create, update, status, attribution) is real.
2. CTA tracking is real (`Call`, `WhatsApp`, `Book` intent creates/appends lead data).
3. Call webhook ingestion is real.
4. WhatsApp webhook ingestion is real.
5. NeoDove webhook ingestion is real.
6. Spend module is real (manual and CSV import both live).
7. Analytics and CEO Command calculations are derived from stored data.

## 2.2 Real but Operationally Weak (needs discipline)
1. Conversion numbers are only as good as status updates (`converted` must be set reliably).
2. Spend-based ROI is only as good as exact `utm_campaign` matching between ad links and spend logs.
3. Attribution coverage tracks field presence; it does not guarantee campaign naming quality.
4. Center performance depends on clean center tagging in campaign/landing naming.

## 2.3 Not Yet Fully Closed-loop
1. Revenue per converted patient is not yet in dashboard.
2. Financial ROI (ROAS/profit) is not yet possible inside dashboard; currently it is spend-to-lead and spend-to-conversion.
3. NeoDove and Santaan status taxonomies still need strict team alignment to avoid conversion undercount.

---

## 3) What Your Screenshot Indicates (Current Situation)
From the current dashboard snapshot:
1. Total Leads are high (237) -> acquisition system is active.
2. Conversions show 0 -> closure/status workflow is broken or not being updated.
3. Spend is 0 -> spend logging process not adopted yet.
4. Source heavily NeoDove -> lead intake is centralized but internal funnel hygiene is weak.

CEO interpretation:
1. This is not a traffic problem.
2. This is a conversion accounting + execution problem.
3. First priority is status discipline and spend logging discipline, not more campaigns.

---

## 4) CEO Decision Stack (Use this order only)
When CEO opens dashboard, follow this strict sequence:

1. **Conversion truth**
- `Converted Patients`
- `Conversion Rate`
Decision: if conversion is flat/zero, freeze scale and diagnose closure flow.

2. **Leakage truth**
- `Pending >24h`
- `2h SLA breaches`
Decision: if stale backlog exists, trigger same-day callback war-room.

3. **Attribution truth**
- `Attribution Coverage`
- Campaign table naming sanity
Decision: if poor/dirty attribution, do not trust channel ROI.

4. **Spend truth**
- `Total Spend`, `CPL`, `CPP`
Decision: if spend > 0 and conversion = 0, immediate budget containment.

5. **Center truth**
- Center performance + target-vs-actual
Decision: assign center-level intervention owner.

If Step 1 fails (conversion truth), do not jump to creative experiments first.

---

## 5) Actionability Framework (RAG)
Use objective thresholds so the dashboard becomes action engine.

## Green (operate and optimize)
1. Pending >24h <= 3 (network)
2. Attribution >= 95%
3. Conversions increasing week-on-week
4. Spend logged daily

## Amber (fix this week)
1. Pending >24h between 4 and 10
2. Attribution 85% to 94%
3. CPP rising >20% week-on-week

## Red (same-day escalation)
1. Conversion = 0 for rolling 7 days with active leads
2. Spend > 0 with no conversions
3. Pending >24h > 10
4. Any center with 0 conversions for two consecutive weeks

---

## 6) CEO Weekly Routine (Action and Accountability)

## Monday (30 minutes)
1. Review last week scorecard (Leads, Converted, Conversion %, Pending >24h, Spend, CPP) by center.
2. Approve only:
- 2 scale decisions
- 2 repair decisions
- 1 risk-control decision
3. Assign one owner per decision and due date.

## Wednesday (20 minutes)
1. Review only exception list:
- stale leads
- 2h SLA breaches
- channels with spend but weak conversion
2. Confirm owners executed Monday actions.

## Friday (30 minutes)
1. Close weekly actions as complete/incomplete.
2. Approve next week budget shifts.
3. Enforce campaign naming and spend import compliance.

CEO must avoid browsing every table each day. Use exception management.

---

## 7) Team Operating Contract (Non-negotiable)

## Marketing Ops
1. Upload spend daily before 11 AM via Spend CSV import.
2. Ensure all campaign URLs carry mandatory UTM template.
3. Keep campaign names deterministic (`service_city_month_objective`).

## CRM Lead
1. No lead remains stale >24h.
2. Every lead has valid funnel status by end of day.
3. High-intent leads receive same-day callback.

## Counseling Lead
1. `qualified` leads reviewed daily.
2. `qualified -> converted` blockers tagged by reason.
3. Script/slot issues escalated weekly.

## Admin Lead
1. Access hygiene in Team tab.
2. Settings/target keys maintained.
3. Center metadata and announcements clean.

---

## 8) Data Contract (What must be true for trustworthy intelligence)
1. `status` must be one of: `new`, `contacted`, `qualified`, `converted`, `lost`.
2. `utm_campaign` in spend rows must exactly match `utm_campaign` in leads.
3. Center names must be standardized: `bhubaneswar`, `berhampur`, `bangalore`.
4. No ad/QR link without UTM.
5. Spend upload is daily, not weekly backlog.

If these five break, dashboard remains “real” but becomes strategically misleading.

---

## 9) Practical De-cluttering: What CEO should ignore
To reduce overwhelm, CEO should ignore in routine review:
1. Individual contact rows (except audit sessions).
2. Cosmetic engagement metrics without conversion linkage.
3. Long lists of campaigns with tiny volume.

CEO focus set:
1. Conversion block
2. Leakage block
3. Spend efficiency block
4. Center accountability block
5. Action queue completion

---

## 10) Immediate 14-day Recovery Plan

## Day 1-2
1. Enforce status normalization in CRM.
2. Start daily spend upload via CSV template.

## Day 3-5
1. Correct campaign name mismatches.
2. Validate NeoDove status mapping in operations process.

## Day 6-10
1. Track `qualified -> converted` closure reasons.
2. Run one counseling quality sprint.

## Day 11-14
1. Reassess channel CPP and center conversion.
2. Scale only channels with improving CPP and real conversions.

---

## 11) CEO One-Page Weekly Scorecard (Template)
Week: __________

1. Leads (network / center-wise): __________
2. Converted patients (network / center-wise): __________
3. Conversion rate: __________
4. Pending >24h: __________
5. Attribution coverage: __________
6. Total spend: __________
7. CPL: __________
8. CPP: __________
9. Top 2 channels to scale: __________
10. Top 2 leakages to fix: __________
11. Owners + due dates: __________

---

## 12) Final CEO Guidance
The dashboard is now operationally real.
Growth outcome will depend less on new features and more on execution discipline:
1. Correct status updates.
2. Daily spend logging.
3. UTM governance.
4. Weekly owner-led closure.

Without this discipline, the dashboard shows numbers.
With this discipline, it becomes Santaan's growth command system.
