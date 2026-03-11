# Santaan CRM Master Presentation Pack
Date: March 10, 2026
Purpose: Single reference for building tomorrow's agency and team training presentation

## 1) Core deck to use first
Primary source:
- `AGENCY_CRM_TRAINING_DECK_SCRIPT_2026-03-09.md`

Use this as the base presentation because it already has:
- slide-by-slide sequence
- trainer script
- click-by-click CRM actions
- reporting policy
- reconciliation SOP
- agency SLA and escalation flow

Recommended use:
- Convert this file into the main PPT spine
- Keep slide titles mostly unchanged
- Add screenshots from the screenshot guide where noted below

## 2) Supporting manuals to pull from
Use these only as supplements, not as the main deck.

### A. Full training reference
- `SANTAAN_CRM_TRAINING_MANUAL_V2_2026-03-09.md`

Use for:
- detailed explanations
- team role expectations
- beginner-friendly language
- week-1 training structure

Best sections to borrow:
- role guide
- module guide
- training plan
- FAQ

### B. Role-based operations manual
- `CRM_ROLE_BASED_USER_MANUAL_V1_2026-02-23.md`

Use for:
- role-wise daily responsibilities
- what each team member updates
- quality of notes and escalation discipline

Best sections to borrow:
- Agency Ops daily work
- field and counselor expectations
- checklist sections

### C. One-page closing handout
- `UAT_TEAM_HANDOUT_1PAGE_2026-03-06.md`

Use for:
- final handout slide
- day-1 and day-2 quick instruction
- simple summary after demo

### D. Governance and SLA
- `OPS_INPUT_PROTOCOL_V1_2026-02-22.md`
- `TEAM_RBAC_SLA_V1_2026-02-22.md`

Use for:
- deadline slide
- owner accountability slide
- role and access expectations

### E. Leadership framing
- `CEO_ACTION_INTELLIGENCE_MANUAL_2026-02-22.md`
- `CEO_COMMAND_CENTER_PLAYBOOK_2026-02-19.md`

Use for:
- why CRM discipline matters
- how CEO reads the dashboard
- why fragmented reporting is not acceptable

## 3) Screenshot sources
These are not Markdown files, but they should be placed into the PPT.

UI screenshot route:
- `src/app/admin/manual-screenshots/page.tsx`

Image folder:
- `public/training/`

Current screenshot assets:
- `public/training/login-screen.png`
- `public/training/crm-role-guide.png`
- `public/training/spend-form-help.png`
- `public/training/ops-inputs-agency.png`
- `public/training/ops-inputs-field.png`
- `public/training/ops-inputs-tv.png`

## 4) Recommended final slide sequence
Build the final PPT in this order.

### Section A - Why this training exists
Take from:
- `AGENCY_CRM_TRAINING_DECK_SCRIPT_2026-03-09.md`
- `CEO_ACTION_INTELLIGENCE_MANUAL_2026-02-22.md`

Slides:
1. Title
2. Session goal
3. Why Santaan is moving to CRM-first reporting
4. Ground rules: pre-GST for ROI, post-GST for finance

### Section B - Where the agency works in CRM
Take from:
- `AGENCY_CRM_TRAINING_DECK_SCRIPT_2026-03-09.md`
- screenshot assets

Slides:
5. Login flow
6. Dashboard orientation
7. Agency modules overview
8. Role view and daily checklist

Recommended screenshots:
- `login-screen.png`
- `crm-role-guide.png`

### Section C - Spend workflow
Take from:
- `AGENCY_CRM_TRAINING_DECK_SCRIPT_2026-03-09.md`
- `OPS_INPUT_PROTOCOL_V1_2026-02-22.md`

Slides:
9. Campaign Spend Tracking overview
10. Sync Meta click-by-click
11. Sync Google click-by-click
12. Manual spend entry fallback
13. How to read green success and red error messages

Recommended screenshot:
- `spend-form-help.png`

### Section D - Ops Inputs workflow
Take from:
- `AGENCY_CRM_TRAINING_DECK_SCRIPT_2026-03-09.md`
- `CRM_ROLE_BASED_USER_MANUAL_V1_2026-02-23.md`

Slides:
14. Ops Inputs -> Agency overview
15. Mandatory fields explained
16. Good row vs bad row
17. Daily cutoff and discipline

Recommended screenshot:
- `ops-inputs-agency.png`

### Section E - Reconciliation and escalation
Take from:
- `AGENCY_CRM_TRAINING_DECK_SCRIPT_2026-03-09.md`

Slides:
18. Daily reconciliation SOP
19. Common mismatch causes
20. Structured escalation template

### Section F - SLA and accountability
Take from:
- `TEAM_RBAC_SLA_V1_2026-02-22.md`
- `OPS_INPUT_PROTOCOL_V1_2026-02-22.md`

Slides:
21. Agency SLA
22. What happens if reporting is incomplete
23. How CEO uses the same data weekly

### Section G - Practice and close
Take from:
- `AGENCY_CRM_TRAINING_DECK_SCRIPT_2026-03-09.md`
- `UAT_TEAM_HANDOUT_1PAGE_2026-03-06.md`

Slides:
24. 5-minute live practice
25. Acceptance checklist
26. Q&A
27. Final commitment / next day start

## 5) Best file for each need
If you need only one file:
- Use `AGENCY_CRM_TRAINING_DECK_SCRIPT_2026-03-09.md`

If you need one deck + one backup manual:
- Use `AGENCY_CRM_TRAINING_DECK_SCRIPT_2026-03-09.md`
- Use `SANTAAN_CRM_TRAINING_MANUAL_V2_2026-03-09.md`

If you need role detail:
- Use `CRM_ROLE_BASED_USER_MANUAL_V1_2026-02-23.md`

If you need short handout:
- Use `UAT_TEAM_HANDOUT_1PAGE_2026-03-06.md`

## 6) What not to overload into the deck
Do not put these in the main agency deck unless asked:
- full CEO operating manual
- full NeoDove integration runbooks
- Google Ads API design document
- technical deployment notes

These are useful for admin or technical review, not for agency onboarding.

## 7) Final assembly recommendation
Tomorrow's best presentation pack should contain:
- Main slide body from `AGENCY_CRM_TRAINING_DECK_SCRIPT_2026-03-09.md`
- Screenshots from `public/training/`
- Role and SLA clarifications from `SANTAAN_CRM_TRAINING_MANUAL_V2_2026-03-09.md`
- Closing handout from `UAT_TEAM_HANDOUT_1PAGE_2026-03-06.md`

That is the most efficient combination and avoids duplication.
