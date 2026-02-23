# Santaan Interim Workboard SOP (v1)

## Purpose
This SOP makes daily execution visible in one place.
Each user logs in, completes time-slot tasks, and updates status + notes.
CEO/CRM Ops uses the same board to review compliance and assign fixes.

## Where To Work
- CRM Dashboard: `/admin/dashboard`
- Workboard tab: `Workboard`
- Input modules: `Ops Inputs` (Agency / Field Team / TV Ads)
- Lead action module: `All Contacts` and `Hot Leads`
- CEO weekly review: `CEO Command`

## Core Rule
Every scheduled task must have:
- Status: `pending`, `in_progress`, `done`, or `blocked`
- Note: what was done, blocker, and owner of next step

If not updated in Workboard, work is treated as **not done**.

## Daily Timeline By Role

### 1) Agency Ops (outsourced)
- `11:00 AM`: Submit daily campaign rows in `Ops Inputs -> Agency`
- `03:00 PM`: Mark underperformers and update corrective note in Workboard
- `08:30 PM`: Log TV airing rows in `Ops Inputs -> TV Ads` (if media running)

Mandatory fields in agency input:
- report date, platform, center, campaign id/name, utm campaign/source/medium, spend

SLA:
- 100% active paid campaigns updated by 11:00 AM
- Underperforming campaigns flagged within 24h

### 2) Field Exec (Bhubaneswar / Berhampur / Bangalore)
- `08:00 PM`: Log all day activities in `Ops Inputs -> Field Team`

Mandatory fields:
- center, activity type, asset code, location, owner, utm campaign
- at least one tracking handle: QR code or call number or WhatsApp number

SLA:
- Same-day logging for doctor visits, hoardings, camps, events

### 3) IVR / Telecalling Lead
- `11:00 AM`: NeoDove sync cycle A + hot lead update
- `03:00 PM`: NeoDove sync cycle B + callback reconciliation
- `07:00 PM`: NeoDove sync cycle C + daily reconciliation note

Work areas:
- `All Contacts` / `Hot Leads` for status updates
- Workboard notes for cycle summary and mismatch reasons

SLA:
- Hot leads contacted <= 10 minutes
- New leads contacted <= 2 hours

### 4) Counselor (per center)
- `04:30 PM`: Update qualified leads, next follow-up, closure outcome

Work areas:
- `All Contacts` (status transitions and notes)
- Workboard task marked done only after updates are complete

SLA:
- Qualified leads actioned same day

### 5) CEO / CRM Ops Admin
- `09:30 AM`: Review Workboard summary and CEO Command, assign owners
- `09:00 PM`: Close day with action notes and unresolved blockers

SLA:
- Daily owner assignment by 10:00 AM
- Daily closure note with blockers + next owner

## How To Update A Workboard Task
1. Open `Workboard` tab.
2. Select date and your profile.
3. For each task:
- set status
- add action note
- click `Save`
4. If entry was wrong, click `Reset`.

## CEO Review Routine (Daily)
1. Open `Workboard`.
2. Check profile cards for:
- pending
- blocked
- completion %
3. Open `CEO Action Feed` (inside Workboard) to see who updated what.
4. Open `CEO Command` for lead/conversion/spend signals.
5. Assign next actions by owner in review call.

## Escalation Protocol
- Any `blocked` task must include blocker + owner in note.
- If no note is provided, task is treated as unresolved.
- If SLA is missed twice in a week, owner and lead must attend daily 9:30 AM review.

## Data Hygiene Rules
- Use standard center names only: `bhubaneswar`, `berhampur`, `bangalore`.
- Use consistent UTM campaign names (no random variants).
- No blank campaign/source for paid or field activities.
- No end-of-day bulk backfill without explanation note.

## First-Week Adoption Checklist
- Day 1: All users log in and complete at least one task update.
- Day 2: Agency + Field + IVR tasks all marked with notes.
- Day 3: CEO review uses Workboard completion + CEO Command together.
- Day 5: 100% scheduled tasks updated by responsible roles.

