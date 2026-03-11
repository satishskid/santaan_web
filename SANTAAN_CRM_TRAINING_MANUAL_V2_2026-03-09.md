# Santaan CRM Training Manual (v2)

Date: 2026-03-09  
System: Santaan Growth OS CRM  
Primary URL: https://santaan-web.vercel.app/admin/dashboard

---

## 1) Purpose of This Manual

This manual is for clinical and non-technical teams.  
It explains:

- Who does what in CRM
- What each team member must update daily
- How leadership monitors performance
- What standards make data trustworthy and useful

Core operating rule:

> If work is not updated in CRM, it is treated as not done.

---

## 2) Login and First 5 Minutes

### 2.1 Login

1. Open: `https://santaan-web.vercel.app/login`
2. Enter assigned role email and password
3. Click `Sign In`
4. On dashboard, first open `Daily Command`

### 2.2 What users should see immediately

At top of CRM dashboard:

- Role name
- Role mission
- SLA line
- “Today you must update” checklist
- Quick action buttons to relevant tabs

This is intentional: users should not guess what to do.

---

## 3) Role Model and Ownership

## 3.1 CEO / CRM Ops Admin

Mission:

- Convert dashboard signals into owner-level actions

Daily/weekly responsibilities:

- Review CEO Command and Analytics
- Check pending follow-ups, attribution gaps, spend gaps
- Assign fix owners and deadlines

SLA:

- Daily review completed by end of day
- Weekly growth review completed with owner assignments

## 3.2 Agency Ops (includes marketing/performance operations)

Mission:

- Keep campaign + spend + UTM discipline clean

Daily responsibilities:

- Update campaign spend by 11:00 AM
- Keep campaign IDs and UTM campaign names accurate
- Flag underperforming campaigns quickly

SLA:

- 100% active campaigns tagged and tracked
- Daily spend updates completed by 11:00 AM

## 3.3 Field Executive (BBSR/BAM/BLR)

Mission:

- Convert offline execution into trackable data

Daily responsibilities:

- Log doctor visits/hoardings/camps/events same day
- Record center + location + owner + activity type
- Add at least one tracking handle (QR/call/WhatsApp)

SLA:

- All field activities logged within 24h with traceability

## 3.4 IVR Lead / Telecaller

Mission:

- Move leads quickly from New to Qualified

Daily responsibilities:

- Contact hot leads first
- Update status, outcome, next follow-up
- Add handoff notes for counselor
- Add loss reason if lead is lost

SLA:

- Hot leads in 10 minutes
- All new leads in 2 hours

## 3.5 Counselor (BBSR/BAM/BLR)

Mission:

- Convert qualified leads into consults and registrations

Daily responsibilities:

- Action all qualified leads same day
- Update consult/registration outcome
- Capture clear reasons for defer/loss

SLA:

- Same-day action on qualified leads
- No lead without next action or reason

---

## 4) Core Tabs and When to Use Them

## 4.1 Daily Command

Use first after login.  
Shows role-based priorities and what must be closed today.

## 4.2 Workboard

Execution checklist with status and notes.  
Use to record progress and blockers.

## 4.3 Contacts / Hot Leads

Operational lead handling area for telecalling and counselors.

## 4.4 Ops Inputs

Structured data entry for:

- Agency campaign performance
- Field activities
- TV ads

## 4.5 Spend

Channel spend tracking + API sync status + manual import.

## 4.6 Analytics / CEO Command

Leadership decision view:

- Lead quality
- Conversion velocity
- Spend efficiency
- Leak points and owner actions

---

## 5) Structured Input Standards (Non-Negotiable)

All users must use standardized values and dropdowns.  
Avoid free-form formats for critical fields.

Required hygiene:

- Status pipeline must be consistent
- Source and UTM fields must be filled
- Lost leads must include reason
- Field and TV entries must include tracking handles

Without standard inputs:

- ROI becomes unreliable
- Campaign decisions become delayed
- CEO dashboard loses actionability

---

## 6) New UX Aids Added in CRM

To reduce user effort and improve adoption:

- Role-based “Today you must update” panel
- Quick action navigation buttons by role
- Field-level help tooltips across major forms
- Login page guidance for first step
- Screenshot training guide inside admin routes

---

## 7) Daily Operating Rhythm (Recommended)

09:00 AM

- IVR/Telecalling queue setup and hot lead triage

11:00 AM

- Agency spend + campaign updates

03:00 PM

- Midday correction pass (missing updates, stale leads, unresolved blockers)

07:00 PM

- Workboard status closure by all owners

07:30 PM

- CEO/Admin action review and owner assignment

---

## 8) Team Training Plan (Beginner-Friendly)

### Day 1 (90 min)

- 20 min: Why CRM exists (single source of truth)
- 20 min: Login + Daily Command + role panel
- 25 min: Role-specific tab walkthrough
- 25 min: Practice entry with sample data

### Day 2 (60 min)

- 20 min: Common errors and how to avoid them
- 20 min: SLA review and accountability
- 20 min: Q&A + live correction drill

### Week 1 reinforcement

- 10-minute daily standup:
  - Yesterday updated?
  - What is blocked?
  - What needs owner escalation?

---

## 9) Admin Checklist Before Team Go-Live

- Confirm role access for each user
- Confirm users can see correct tabs
- Confirm default values and help tooltips visible
- Confirm at least one test row from each module:
  - Agency
  - Field
  - TV
  - Spend
  - Lead update
- Confirm CEO Command reflects real updates

---

## 10) Escalation Protocol

P0 (immediate):

- Login failure
- Save failure
- Wrong role access
- Missing critical routes

P1 (same day):

- Data mismatch due to incorrect input
- Missing campaign tags
- Delayed ownership updates

Escalation owner:

- CRM Ops Admin (first line)
- CEO/Admin (for P0 and unresolved P1)

---

## 11) FAQ (for Non-Technical Teams)

Q: I don’t know where to start after login.  
A: Start from `Daily Command`, then follow quick actions.

Q: Why should I fill UTM/source fields exactly?  
A: Leadership ROI decisions depend on attribution quality.

Q: Can I close a lead without reason?  
A: No. Every closed/lost/deferred lead needs reason or next action.

Q: Why are tooltips added?  
A: To reduce mistakes and speed up data entry.

Q: What if I’m unsure of field meaning?  
A: Hover/click the help icon near the field label and follow that guidance.

---

## 12) PPT Conversion Outline (Ready-to-Use)

Use this section as slide titles:

1. Why Santaan CRM exists
2. Login and first 5 minutes
3. Role map and SLAs
4. Daily Command workflow
5. Contacts and lead movement discipline
6. Ops Inputs (Agency/Field/TV)
7. Spend tracking and ROI visibility
8. Common mistakes and fixes
9. CEO weekly review loop
10. Escalation and support protocol
11. Week-1 training plan
12. Q&A

---

## 13) Reference Links

- CRM dashboard: `https://santaan-web.vercel.app/admin/dashboard`
- Login: `https://santaan-web.vercel.app/login`
- Manual page (web): `https://santaan-web.vercel.app/admin/marketing-manual`
- Screenshot guide: `https://santaan-web.vercel.app/admin/manual-screenshots`
- Training deck: `https://santaan-web.vercel.app/admin/training-deck`

