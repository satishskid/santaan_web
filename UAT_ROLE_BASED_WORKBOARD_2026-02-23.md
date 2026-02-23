# Santaan CRM UAT - Role-Based Workboard (v1)

Date: February 23, 2026 (IST)
Environment: Production (`https://santaan.in/admin/dashboard`) or Staging equivalent

## 1) UAT Objective
Validate that the interim Growth OS flow works end-to-end:
- Every role sees the right tabs/tasks.
- Every role can submit required inputs.
- Workboard statuses + notes persist and are visible to CEO.
- CEO can run daily accountability from one screen.

## 2) Roles Under Test
- CEO / CRM Ops Admin
- Agency Ops (outsourced)
- Field Exec (Bhubaneswar)
- Field Exec (Berhampur)
- Field Exec (Bangalore)
- IVR / Telecalling Lead
- Counselor (Bhubaneswar)
- Counselor (Berhampur)
- Counselor (Bangalore)

## 3) Pre-UAT Setup
1. Ensure users can log in and have correct `role` in users table.
2. Ensure `ops_task_updates` table exists.
3. Use one fixed UAT date (today) for all testers.
4. Keep one shared UAT sheet with columns:
- Test ID
- Role
- Step
- Expected
- Actual
- Pass/Fail
- Screenshot URL
- Defect ID (if fail)

## 4) Access Matrix (Expected)
- All ops roles: `Workboard` tab visible.
- CEO/Admin: `Workboard`, contacts tabs, `Analytics`, `CEO Command`, `Ops Inputs`, `Spend`, `Team`, `Settings`, `Centers`, `Announcements`.
- Agency Ops: `Workboard`, `Ops Inputs` (Agency + TV), contact tabs if role grants.
- Field Exec: `Workboard`, `Ops Inputs` (Field Team).
- IVR Lead: `Workboard`, contact tabs (`All Contacts`, `Hot Leads`).
- Counselor: `Workboard`, contact tabs (`All Contacts`, `Hot Leads`).

## 5) Core UAT Scenarios

### A. Login and Role Visibility
- **TC-A1**: Login as each role.
- Expected: Only role-allowed tabs are shown; blocked tabs absent.

### B. Workboard Task Lifecycle
- **TC-B1**: Open Workboard for today.
- Expected: Role-relevant profile/tasks are visible.

- **TC-B2**: Update one task to `in_progress`, add note, click Save.
- Expected: Success message, state persists after refresh.

- **TC-B3**: Update same task to `done`, note updated.
- Expected: Summary card reflects completion change.

- **TC-B4**: Click Reset on updated task.
- Expected: Task returns to `pending`, note cleared.

- **TC-B5 (Security)**: Try profile/task not belonging to role (if possible via URL or API tools).
- Expected: Forbidden/blocked; no unauthorized update.

### C. Ops Inputs - Agency
(Agency Ops / leadership)
- **TC-C1**: Submit one valid row in `Ops Inputs -> Agency`.
- Expected: Row saves, appears in list, no validation error.

- **TC-C2**: Submit invalid row (missing campaign/spend/utmCampaign).
- Expected: Validation error message.

### D. Ops Inputs - Field
(Field Exec / leadership)
- **TC-D1**: Submit one valid field activity row with at least one tracking handle.
- Expected: Row saves successfully.

- **TC-D2**: Submit row with no QR/call/WhatsApp handle.
- Expected: Validation error.

### E. Ops Inputs - TV
(Agency Ops / leadership)
- **TC-E1**: Submit one TV log row with at least one tracking handle.
- Expected: Row saves successfully.

- **TC-E2**: Submit with no tracking handle.
- Expected: Validation error.

### F. Contact Workflow
(IVR Lead / Counselor / leadership)
- **TC-F1**: Update contact status and last-contact progression.
- Expected: Saved and visible after refresh.

- **TC-F2**: Non-leadership role tries deleting contact.
- Expected: Delete control absent or action denied.

### G. CEO Accountability View
(CEO/Admin)
- **TC-G1**: Open Workboard after other roles update tasks.
- Expected: Profile completion cards and action feed show latest updates.

- **TC-G2**: Open CEO Command.
- Expected: Leads/conversion/spend blocks load and render (values may be low but not broken).

## 6) Role-Wise Daily UAT Script

### 6.1 Agency Ops
1. Login.
2. Workboard: mark 11:00 AM task `done` + note.
3. Add 1 agency row.
4. Mark 03:00 PM task `in_progress` + underperformer note.
5. Add 1 TV row.
6. Mark 08:30 PM task `done` + note.

### 6.2 Field Exec (each center)
1. Login.
2. Workboard: open center profile.
3. Add 1 field row with center-specific details.
4. Mark field evening task `done` + note.

### 6.3 IVR Lead
1. Login.
2. Update 3 contacts (`new -> contacted`, add note).
3. Workboard: mark 11:00 AM task `done` with reconciliation note.
4. Mark 03:00 PM task `in_progress`.
5. Mark 07:00 PM task `done`.

### 6.4 Counselor (each center)
1. Login.
2. Update at least 2 qualified leads with follow-up/closure.
3. Workboard: mark 04:30 PM task `done` + center summary note.

### 6.5 CEO/Admin
1. Login.
2. Review Workboard summary for all profiles.
3. Confirm any pending/blocked item has owner note.
4. Open CEO Command and capture screenshot.
5. Record 3 action assignments in UAT sheet.

## 7) Defect Severity
- **P0**: login failure, data loss, role bypass, no save.
- **P1**: wrong role visibility, incorrect persistence, broken CEO visibility.
- **P2**: validation mismatch, minor UI workflow friction.
- **P3**: copy/layout issues with no workflow impact.

## 8) Exit Criteria (Go/No-Go)
Go-live for interim ops is approved only if:
1. 100% TC-A/B/C/D/E/F/G pass for at least one cycle.
2. No open P0/P1 defects.
3. CEO can see updates from agency, field, IVR, counselor in one place.
4. At least one full day’s role updates are captured with evidence.

## 9) Evidence Pack Required
- Screenshot per failed test.
- Screenshot of each role’s tab visibility.
- Screenshot of Workboard summary after all role updates.
- Exported rows from Agency/Field/TV modules for UAT date.
- Final signed UAT sheet with owner initials.

## 10) Post-UAT Daily Operating Cadence
- 9:30 AM: CEO/Admin opens Workboard + CEO Command.
- 11:00 AM: Agency input complete.
- 3:00 PM: Midday status and correction notes.
- 7:00-9:00 PM: IVR reconciliation + field closure + final daily CEO review.

