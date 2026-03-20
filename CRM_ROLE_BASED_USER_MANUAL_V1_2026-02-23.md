# Santaan CRM Role-Based User Manual (Interim Growth OS)

Version: 1.0
Date: February 23, 2026 (IST)
Audience: CEO, CRM Ops Admin, Agency Ops, Field Teams, IVR/Telecalling, Counselors

## 1) Purpose
This manual explains exactly how each team member logs in, what they must update daily, and how CEO monitors execution and growth.

## 2) Login Basics

## 2.1 URL
- Open: `/login`
- After login: `/admin/dashboard`

## 2.2 Credentials format
Current system uses **email + password** login.

Standard temporary training password (if assigned):
- Ask CRM Ops Admin for the current temporary training password.

### Starter role test accounts (for UAT/training)
- Agency Ops: `agency.e2e@santaan.in`
- Field Exec: `field.e2e@santaan.in`
- IVR Lead: `ivr.e2e@santaan.in`
- Counselor: `counselor.e2e@santaan.in`

Admin accounts remain separate and controlled by leadership.

## 2.3 If login fails
1. Confirm email spelling.
2. Confirm password case.
3. Ask CRM Ops Admin for reset.
4. Retry in incognito/private window.

## 3) What each role sees in CRM

### 3.1 All operational roles
- `Workboard` tab (mandatory)

### 3.2 Role-specific tabs
- CEO/CRM Ops Admin:
  - Workboard, Contacts tabs, Analytics, CEO Command, Ops Inputs, Spend, Team, Settings, Centers, Announcements
- Agency Ops:
  - Workboard, Ops Inputs (Agency, TV)
- Field Exec:
  - Workboard, Ops Inputs (Field Team)
- IVR/Telecalling Lead:
  - Workboard, All Contacts, Hot Leads
- Counselor:
  - Workboard, All Contacts, Hot Leads

## 4) Workboard: Daily execution center

## 4.1 Why Workboard is mandatory
If a task is not updated in Workboard, it is treated as **not done**.

## 4.2 How to update a task
1. Open `Workboard`.
2. Select date (today).
3. Select your profile.
4. For each assigned task:
- choose status: `pending`, `in_progress`, `done`, `blocked`
- enter note: what was done / blocker / next owner
- click `Save`
5. If wrong update made, click `Reset`.

## 4.3 Note quality standard
Every note should include:
1. action completed
2. blocker (if any)
3. owner for next step

Bad note: `done`
Good note: `Uploaded 7 campaign rows; 2 pending due to missing UTM from agency owner Anita; follow-up by 12:30 PM.`

## 5) Role-wise Daily SOP

## 5.1 Agency Ops (outsourced)
Daily tasks:
1. 11:00 AM: submit campaign metrics in `Ops Inputs -> Agency`
2. 3:00 PM: mark underperformers + correction note in Workboard
3. 8:30 PM: submit TV entries in `Ops Inputs -> TV` (if running)

Mandatory fields (Agency):
- report date, platform, center, campaign id/name, utm source/medium/campaign, spend

SLA:
- 100% active campaigns updated by 11:00 AM
- underperformers flagged within 24h

## 5.2 Field Exec (BBSR/BER/BLR)
Daily tasks:
1. 8:00 PM: log all field activities in `Ops Inputs -> Field Team`

Mandatory fields:
- date, center, activity type, asset code, location, owner, utm campaign
- at least one tracking handle: QR or call number or WhatsApp number

SLA:
- same-day logging for all activities

## 5.3 IVR / Telecalling Lead
Daily tasks:
1. 11:00 AM: sync cycle A + hot lead updates
2. 3:00 PM: sync cycle B + callback reconciliation
3. 7:00 PM: sync cycle C + close day note

Work areas:
- `All Contacts` and `Hot Leads`
- Workboard task notes for each cycle

SLA:
- hot leads contacted <= 10 min
- all new leads first touch <= 2 hours

## 5.4 Counselor (per center)
Daily tasks:
1. 4:30 PM: update qualified lead outcomes in contacts
2. mark Workboard counselor task done with summary note

SLA:
- all qualified leads actioned same day
- no closure without reason/status update

## 5.5 CEO / CRM Ops Admin
Daily tasks:
1. 9:30 AM: review Workboard + CEO Command and assign priorities
2. 9:00 PM: review blockers and close daily action sheet

SLA:
- owner assignments before 10:00 AM
- daily closure note with unresolved blockers

## 6) Contacts workflow (IVR + Counselor)

## 6.1 Minimum fields to update per lead touch
1. `status`
2. `last contact`
3. message/notes
4. tags (if relevant, e.g. hot_lead)

## 6.2 Status progression (recommended)
- `new` -> `contacted` -> `qualified` -> `converted` or `lost`

## 6.3 Lost leads
Always capture reason in notes (price/timing/competitor/no-response/etc).

## 7) Ops Inputs workflow

## 7.1 Agency module
Use for Meta/Google/YouTube campaign-level daily performance rows.

## 7.2 Field module
Use for doctor visits, camps, hoardings, offline activities.

## 7.3 TV module
Use for airing logs with campaign and tracking handles.

## 8) CEO Monitoring Workflow

## 8.1 Morning review sequence (recommended)
1. Workboard summary cards (who is pending/blocked)
2. CEO Action Feed (latest updates)
3. CEO Command (funnel, leaks, spend, ROI)
4. Assign owners and due dates

## 8.2 Evening review sequence
1. Check unresolved blocked tasks
2. Check pending >24h and SLA breaches
3. Confirm next-day owner assignments

## 9) Escalation rules
1. Any `blocked` task must include blocker + owner in note.
2. Missing daily input row = non-compliance.
3. Repeated SLA miss (2 times/week) goes to CEO review.

## 10) Admin Controls

## 10.1 CRM Ops Admin responsibilities
1. access control
2. role assignment
3. data hygiene checks
4. daily compliance snapshot

## 10.2 Reset protocol
If user forgets password:
1. verify identity
2. reset to temporary password
3. enforce immediate change in next session (process level)

## 11) Daily checklist by user (copy-paste)

### Agency Ops checklist
- [ ] Agency rows submitted by 11:00 AM
- [ ] Underperformers flagged by 3:00 PM
- [ ] TV rows submitted by 8:30 PM (if active)
- [ ] Workboard notes complete

### Field checklist
- [ ] All activities logged same day
- [ ] Tracking handles present
- [ ] Workboard marked done with note

### IVR checklist
- [ ] Hot leads touched <=10 min
- [ ] New leads touched <=2h
- [ ] Three cycle notes updated in Workboard

### Counselor checklist
- [ ] Qualified leads updated same day
- [ ] Follow-up/closure notes filled
- [ ] Workboard marked done

### CEO/Admin checklist
- [ ] Morning priorities assigned
- [ ] Blocked items reviewed
- [ ] Daily closure completed

## 12) Troubleshooting

### Problem: cannot save Workboard task
Check:
1. valid status selected
2. profile/task belongs to your role
3. session not expired

### Problem: API returns unauthorized
Check:
1. user role mapping
2. login session valid
3. role has permission for that module

### Problem: module opens but inserts fail
Likely missing DB migration.
Required commands:
- `npm run migrate:ops-workboard`
- `npm run migrate:ops-inputs`

## 13) Governance rule
No owner, no due date, no note = no action.
This CRM is an execution system, not only a reporting dashboard.
