# Santaan Growth OS: CEO Action Intelligence Manual
Version: 3.0
Date: February 22, 2026 (IST)
Audience: CEO, Marketing Head, CRM Lead, Counseling Lead, Center Leads
Scope: No product code change. Operating model for current live dashboard.

## 1) Executive Verdict: Is the dashboard real or just numbers?
It is real-data driven, not a visual mock.

### 1.1 What is genuinely live today
1. Contact/lead records are read from DB through admin API (`/api/admin/contacts`).
2. CTA intent tracking is live (`/api/track-call`) and records Call/WhatsApp/Book clicks with UTM + landing path + center inference.
3. NeoDove webhook ingestion is live (`/api/neodove/webhook`) and updates/creates contacts from NeoDove events.
4. Call webhook ingestion is live (`/api/calls/webhook`) and updates/creates contacts from IVR/telephony events.
5. WhatsApp webhook ingestion is live (`/api/whatsapp/webhook`) and updates/creates contacts + sends automated replies via Bhash.
6. Spend is live with secured CRUD (`/api/admin/spend`) and CSV import (`/api/admin/spend/import`).
7. Analytics and CEO Command tabs compute KPIs from these stored tables, not static literals.
8. Team/Settings/Centers/Announcements tabs are backed by working APIs and DB tables.

### 1.2 What is live but can still mislead leadership
1. Conversion is status-driven. If teams do not set `converted`, conversion remains 0 even if patients exist.
2. ROI is spend-driven. If spend rows are missing, CPL/CPP will stay 0 and falsely look healthy.
3. Center performance depends heavily on naming and inferred center signals (campaign/path/target).
4. Campaign ROI depends on exact `utm_campaign` string match between media links and spend log.
5. Revenue/profit per patient is not yet integrated, so this is performance intelligence, not full financial accounting.

Conclusion:
- System = operationally real.
- Decision quality = currently limited by process discipline, not by missing UI.

---

## 2) Why the current screen feels overwhelming
Current dashboard shows many numbers but mixes three levels:
1. Signal level (what happened)
2. Diagnostic level (why it happened)
3. Action level (what to do now)

CEO should not browse all widgets equally.
Use one fixed sequence every week.

---

## 3) CEO operating sequence (non-negotiable order)
When CEO logs in, review in this order only:

1. **Outcome Truth (2 min)**
- Converted Patients
- Conversion Rate
- Center-wise converted count

2. **Leakage Truth (3 min)**
- Pending >24h
- 2h SLA breaches (call/WhatsApp)

3. **Attribution Truth (3 min)**
- Attribution Coverage
- Top campaign naming hygiene (no random IDs, no blanks)

4. **Efficiency Truth (3 min)**
- Total Spend
- CPL
- CPP

5. **Execution Truth (4 min)**
- Action queue owners
- Last week commitments: done/not done

If step 1 is bad (conversion flat/zero), do not discuss creative first.
Fix counseling velocity and closure first.

---

## 4) Current-state interpretation (based on your screenshot)
Observed:
1. Leads are present and mostly from NeoDove.
2. Conversions are zero.
3. Spend is zero.
4. Pending follow-up exists.

CEO meaning:
1. Acquisition pipeline is active.
2. Conversion accounting and closure discipline are failing.
3. ROI panel is underfed (spend process not active).

Priority order for next 14 days:
1. Conversion logging discipline
2. Daily spend ingestion discipline
3. Campaign taxonomy cleanup
4. Center-level ownership cadence

---

## 5) Action thresholds (RAG) for CEO decisions

### Green
1. Attribution Coverage >= 95%
2. Pending >24h <= 3 (network) and <= 1 per center
3. Spend entered daily
4. Conversions updated daily

Action:
- Scale top 1-2 channels by 10-15%.

### Amber
1. Attribution 85-94%
2. Pending >24h between 4 and 10
3. CPP worsens >20% week over week

Action:
- Repair workflow this week; no major budget increase.

### Red
1. Spend > 0 and Converted = 0
2. Pending >24h > 10
3. Any center at 0 conversions for 2 consecutive weeks
4. Attribution < 85%

Action:
- Same-day escalation with named owner + deadline.
- Freeze scaling until red condition is removed.

---

## 6) CEO weekly routine (what to do, when, with whom)

### Monday 9:00 AM (30 min) - Direction meeting
Attendees: CEO, Marketing Head, CRM Lead, Counseling Lead, Ops Lead

Agenda:
1. Last week scorecard by center: Leads, Converted, Conv%, Pending>24h, Spend, CPP
2. Pick exactly:
- 2 scale bets
- 2 repair bets
- 1 risk-control bet
3. Assign one owner and one due date per bet

Output format:
- Action
- Owner
- Due date
- Success metric

### Wednesday 5:00 PM (20 min) - Exception review
Agenda:
1. Red/Amber exceptions only
2. Verify closure of Monday assignments
3. Unblock teams (slots, creative approval, script approval)

### Friday 6:00 PM (25 min) - Closure and next-week setup
Agenda:
1. Completed vs missed actions
2. Budget shifts (pause/scale)
3. Campaign naming and spend import compliance check

---

## 7) Owner SLAs (who must do what daily)

### Marketing Ops (daily by 11:00 AM)
1. Upload previous-day spend (CSV import).
2. Verify every running campaign has mandatory UTM.
3. Ensure `utm_campaign` matches exactly between ad links and spend entries.

### CRM Lead (daily by 1:00 PM and 7:00 PM)
1. No lead should remain unworked >24h.
2. High-intent leads get same-day callback.
3. Every contacted/qualified lead has updated status and note.

### Counseling Lead (daily by 7:30 PM)
1. Close qualified leads with explicit outcome.
2. Tag closure blockers: price, fear, family decision, timing, doctor confidence.
3. Escalate unresolved hot leads to center lead.

### Center Lead (daily by 8:00 PM)
1. Confirm consult slot availability for next 48h.
2. Resolve local callback backlog.
3. Approve center-specific winback list.

---

## 8) Data contract (if broken, dashboard becomes noisy)
1. Status vocabulary only: `new`, `contacted`, `qualified`, `converted`, `lost`.
2. `utm_campaign` must be deterministic and reused exactly in spend logs.
3. Every paid/QR/hoarding/social link must include mandatory UTM keys.
4. Spend entry must include date, channel, campaign, center, amount.
5. Center labels standardized: `bhubaneswar`, `berhampur`, `bangalore`, `network`.

---

## 9) CEO one-page command sheet (weekly)
Copy this weekly and fill values:

1. Leads (Network / BBSR / BER / BLR): ____ / ____ / ____ / ____
2. Converted (Network / BBSR / BER / BLR): ____ / ____ / ____ / ____
3. Conversion Rate (%): ____
4. Pending >24h (Network / by center): ____
5. Attribution Coverage (%): ____
6. Total Spend (INR): ____
7. CPL (INR): ____
8. CPP (INR): ____
9. Top 2 channels to scale: ____
10. Top 2 leakages to fix: ____
11. Action owners + due dates: ____

---

## 10) “From overwhelming dashboard to actionable intelligence” mapping
Use this simplification layer mentally (or in your weekly review note):

1. **Outcome Block**
- Converted, Conv%
- Question: “Are we winning?”

2. **Leakage Block**
- Pending >24h, SLA breaches
- Question: “Where are we losing speed?”

3. **Economics Block**
- Spend, CPL, CPP
- Question: “Are we buying quality or waste?”

4. **Execution Block**
- Owner actions, due dates, closure
- Question: “Who fixes what by when?”

If a metric does not answer one of these four questions, it is background, not leadership focus.

---

## 11) Gaps to track (not code changes, only governance)
1. Ensure teams actually mark converted status from NeoDove/clinic outcomes daily.
2. Ensure spend import happens every day, not weekly backlog.
3. Standardize campaign names before launching new creatives.
4. Maintain a weekly “reason code” report for lost leads and qualified-not-converted leads.

---

## 12) Final guidance
Santaan Growth OS is already functional as a real operating system.
The next growth jump will come from execution discipline:
1. status integrity,
2. spend integrity,
3. attribution integrity,
4. owner accountability cadence.

When these four are enforced, CEO dashboard becomes a decision engine, not a reporting wall.
