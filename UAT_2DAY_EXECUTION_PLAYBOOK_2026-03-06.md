# Santaan CRM 2-Day UAT Execution Playbook
Date: March 6, 2026  
Owner: CEO / CRM Ops Admin  
UAT Window: 2 days (Day-1 + Day-2)

## 1) UAT Scope
Validate that Santaan Growth CRM works end-to-end for:
1. Role-based login access
2. Daily execution updates (agency, field, IVR, counselor)
3. CEO visibility and actionability
4. Core ROI inputs (spend + attribution + lead progression)

## 2) UAT URLs
1. CRM UAT URL: `https://santaan-web.vercel.app/login`
2. CRM dashboard after login: `https://santaan-web.vercel.app/admin/dashboard`
3. Public site (current stable): `https://santaan.in`

Note: Use `santaan-web.vercel.app` for UAT. Do not use `santaan.vercel.app` yet.

## 3) UAT Login Credentials (Temporary)
Temporary password for all UAT users: `sant_growth26`

| Role | Login |
|---|---|
| CEO + CRM Ops Admin | `ceo.crmops@santaan.in` |
| Agency Ops (Outsourced) | `santaandigital.ops@santaan.in` |
| Field Exec - Bhubaneswar | `field.bhubaneswar@santaan.in` |
| Field Exec - Berhampur | `field.berhampur@santaan.in` |
| Field Exec - Bangalore | `field.bangalore@santaan.in` |
| IVR Lead | `ivr.lead@santaan.in` |
| Telecaller - Bhubaneswar | `telecaller.1@santaan.in` |
| Telecaller - Berhampur | `telecaller.2@santaan.in` |
| Telecaller - Bangalore | `telecaller.3@santaan.in` |
| Counselor - Bhubaneswar | `counselor.bhubaneswar@santaan.in` |
| Counselor - Berhampur | `counselor.berhampur@santaan.in` |
| Counselor - Bangalore | `counselor.bangalore@santaan.in` |

Security action after UAT close: reset all above passwords on Day-3 morning.

## 4) Role Responsibilities During UAT

### CEO / CRM Ops Admin
1. Confirm each team member can log in.
2. Review `Analytics`, `CEO Command`, and `Ops Workboard`.
3. Assign owners for red flags.
4. Sign off Day-1 and Day-2 checklists.

### Agency Ops
1. Fill `Ops Inputs -> Agency` rows.
2. Fill `Spend` rows for active channels.
3. Run Meta sync once and verify entries.
4. Update workboard notes with action taken.

### Field Exec (each center)
1. Fill `Ops Inputs -> Field Activities`.
2. Enter activity type, center, location, spend, tracking handle.
3. Ensure each row has at least one traceable handle (QR/call/WhatsApp).

### IVR Lead + Telecallers
1. Update contacts in CRM (`new/contacted/qualified/lost`).
2. Add call outcome + next follow-up.
3. Handoff qualified leads to center counselor.

### Counselors (each center)
1. Update qualified leads to `consult_booked/converted/lost`.
2. Enter reason code for lost leads.
3. Add next action for pending leads.

## 5) Day-1 UAT Script (Functional)

### Phase A: Access and Role Visibility (09:00-10:00)
1. Each user logs in.
2. Check allowed tabs appear.
3. Check blocked tabs are not editable.
Pass criteria: 100% users can login and see correct role scope.

### Phase B: Core Data Entry (10:00-13:00)
1. Agency: submit 2 agency rows + 2 spend rows.
2. Field: each center submits 1 field activity row.
3. IVR/Telecaller: update minimum 5 leads total.
4. Counselor: update minimum 2 qualified leads per center.
Pass criteria: rows save correctly and are visible after refresh.

### Phase C: CEO Verification (16:00-17:00)
1. CEO opens `CEO Command`.
2. Verify counts reflect role updates.
3. Verify pending follow-up and action queue are visible.
Pass criteria: CEO can identify what is missing and assign owner.

## 6) Day-2 UAT Script (Operational)

### Phase A: SLA Compliance Simulation
1. Telecaller marks one lead pending >2h (test breach).
2. IVR Lead closes breach with note.
3. Counselor closes or schedules all qualified leads.
Pass criteria: breach appears and then clears after action.

### Phase B: ROI and Attribution Check
1. Agency updates spend by 11:00 AM.
2. CEO checks `Total Spend`, `Cost/Patient`, channel/campaign tables.
3. Verify UTM/source present on newly created leads.
Pass criteria: channel-wise spend and lead attribution visible.

### Phase C: Closure and Sign-off
1. CEO runs final review at 7:00 PM.
2. Mark issues as P0/P1/P2.
3. Decide Go / Conditional Go / Hold.

## 7) Defect Severity
1. P0: login failure, save failure, role bypass/security issue
2. P1: wrong role visibility, incorrect KPI rendering
3. P2: validation/UI friction, non-blocking copy/layout issue

Go-live condition: no open P0/P1 at end of Day-2.

## 8) Daily UAT Reporting Format
Use one shared sheet with columns:
1. Date
2. Role
3. Module
4. Action performed
5. Expected result
6. Actual result
7. Pass/Fail
8. Screenshot link
9. Owner
10. ETA

## 9) Recommended Deployment Model

### Immediate (next 2 days UAT)
1. Keep public website on Netlify (`santaan.in`).
2. Keep CRM on Vercel (`santaan-web.vercel.app`).
Reason: zero risk to current patient-facing site while ops teams test CRM deeply.

### Post-UAT (recommended target)
Move both website + CRM to Vercel as one platform.

Why:
1. Single deployment and env management
2. No cross-platform function limits mismatch
3. Cleaner analytics and auth/session handling
4. Faster debugging and fewer integration breaks

## 10) Post-UAT Hardening Checklist
1. Rotate all temporary passwords
2. Keep role-based permanent accounts only
3. Enable weekly credential reset policy
4. Freeze UAT test users not needed in production
5. Lock final SOP and SLA dashboard review cadence
