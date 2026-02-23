# Santaan Interim IVR + Telecaller CRM SOP (V1)

System date: February 22, 2026 (IST)  
Applies until: full NeoDove deep integration is completed  
Owner: CEO + CRM Ops Admin

---

## 1) Purpose
Run operations immediately with current CRM, without waiting for full NeoDove integration.

This SOP ensures:
- Leads from IVR/telecalling are visible in CRM
- Lead statuses stay current
- CEO can review pipeline health daily
- Team accountability is clear by role and SLA

---

## 2) Current system reality (important)
Current CRM supports:
- Contact create: `name, email, phone, role, status`
- Contact update (UI): `name, email, phone, status`
- CEO analytics from CRM lead status + spend + ops input tables

Current CRM does **not yet** provide a dedicated UI form for:
- structured call outcome code
- follow-up datetime
- lost reason code
- telecaller owner queue

So interim method is:
- Track detailed call coding in NeoDove (source of truth for call process)
- Keep CRM status synced for executive visibility and growth decisions

---

## 3) Team roles and daily ownership

### 3.1 IVR Manager
- Owns NeoDove exports and reconciliation.
- SLA: 3 sync cycles/day completed.
- SLA: end-of-day NeoDove vs CRM variance <= 5%.

### 3.2 Telecaller Manager
- Ensures telecaller updates are reflected in CRM status.
- SLA: hot leads contacted in 10 minutes.
- SLA: all new leads touched in 2 hours.
- SLA: status sync completed in each cycle.

### 3.3 Telecaller Executives (center-wise)
- Work leads in NeoDove.
- Mandatory in NeoDove: status, outcome, next follow-up, lost reason, handoff note.
- SLA: no untouched assigned new lead older than 2h.

### 3.4 CRM Ops Admin
- Maintains data hygiene in CRM.
- SLA: no blank phone on IVR-imported leads.
- SLA: no stuck status mismatch older than 24h.

### 3.5 CEO
- Uses CEO Command Center and Protocol Compliance.
- SLA: weekly review with owner-wise action assignments.

---

## 4) Daily operating rhythm (IST)

### Cycle A (11:00 AM)
- Pull NeoDove updates from morning window.
- Sync CRM contacts/status.
- Resolve urgent hot leads.

### Cycle B (3:00 PM)
- Pull incremental NeoDove updates.
- Sync CRM status changes.
- Escalate any center SLA breach.

### Cycle C (7:00 PM, mandatory close)
- Final incremental pull.
- Sync CRM.
- Reconcile and publish end-of-day summary.

---

## 5) NeoDove to CRM mapping (interim)

Use this mapping while full API sync is pending.

| NeoDove field | CRM field | Interim rule |
|---|---|---|
| `name` | `name` | Mandatory |
| `mobile` | `phone` | Mandatory, 10-digit |
| `email` | `email` | If missing, generate placeholder (see below) |
| `campaign_id/campaign_name` | `leadSource` / `utmCampaign` | Prefer campaign name as source context |
| `event_name` | `tags` (future) | Keep in NeoDove for now |
| `lead_stage_name / disposition` | `status` | Use status mapping below |
| `time` | `lastContact` | Update with latest touch time |

### Placeholder email rule (required)
If no email is available, use:
- `<10digitmobile>@ivr.santaan.in`

Example:
- `9777989739@ivr.santaan.in`

Reason: CRM currently requires unique email for create.

---

## 6) Status mapping standard (must follow exactly)

| NeoDove stage/disposition | CRM status |
|---|---|
| Open / New | `new` |
| In Progress / Contacted | `contacted` |
| Interested / Follow-up / Consult planned | `qualified` |
| Converted / Registered | `converted` |
| Lost / Not interested / Invalid | `lost` |

Do not use custom status words in CRM.

---

## 7) Minimum data that must be synced to CRM each cycle

For each touched lead:
1. `status`
2. `lastContact` (latest touch timestamp)
3. `phone` (if corrected)
4. `name` (if corrected)

For new leads:
1. Create contact with `name, email (real or placeholder), phone`
2. Set `role = Patient`
3. Set initial status (`new` or `contacted` based on first touch)

---

## 8) How IVR/Telecaller manager executes sync (step-by-step)

### Step 1: Pull from NeoDove
- Export leads touched since last cycle.
- Include: name, mobile, email, stage/status, updated time, campaign.

### Step 2: Prepare working sheet
- Deduplicate by mobile.
- Fill missing emails using placeholder rule.
- Apply status mapping standard.

### Step 3: Sync into CRM
- New records: use `Add Contact` in CRM.
- Existing records: update status in CRM contact table.
- Focus first on `hot` and `qualified` leads.

### Step 4: Verify
- No blank phone.
- No invalid status outside 5 values.
- Count variance report prepared.

### Step 5: Publish cycle summary
- Message in ops group:
  - New synced
  - Updated synced
  - Pending mismatch count
  - Escalations by center

---

## 9) Interim QA checklist (end-of-day)

### Data quality checks
1. CRM statuses only: `new/contacted/qualified/converted/lost`
2. No lead without phone.
3. No duplicate same phone with different names (unless verified household case).
4. All qualified leads have same-day status refresh.

### Reconciliation checks
1. NeoDove touched leads today vs CRM updated leads today variance <= 5%.
2. NeoDove converted today vs CRM converted today variance <= 2 cases.
3. Any breach logged with reason and owner.

---

## 10) Escalation matrix

### Critical (same day escalation)
- Hot leads untouched > 2h
- CRM status sync skipped for a cycle
- Variance > 10%

Escalate to:
- Telecaller Manager -> IVR Manager -> CRM Ops Admin -> CEO

### Major (next morning correction)
- Variance 5-10%
- Missing placeholder emails
- Incorrect status mapping

---

## 11) What CEO should monitor daily

In `Admin -> CEO Command`:
1. `Pending >24h`
2. `2h SLA Breaches`
3. `Conversion Rate`
4. `Protocol Compliance (Today)` for Agency/Field/TV
5. Weekly action queue ownership

In `Admin -> CRM`:
1. Hot leads count
2. Qualified to converted movement
3. Center-level status distribution

---

## 12) Transition plan to full NeoDove integration

This SOP is temporary.

Phase 1 (now):
- Manual manager-led sync as above.

Phase 2:
- NeoDove webhook deep mapping:
  - assignment owner
  - call outcome code
  - next follow-up time
  - lost reason

Phase 3:
- Auto reconciliation dashboard + owner queues + exception alerts.

---

## 13) Quick-start checklist for tomorrow

1. Confirm daily owners:
   - IVR Manager
   - Telecaller Manager
   - CRM Ops Admin
2. Start 3-cycle sync cadence (11 AM / 3 PM / 7 PM).
3. Enforce placeholder email rule for missing emails.
4. Enforce status mapping standard.
5. Send end-of-day reconciliation summary to CEO.

