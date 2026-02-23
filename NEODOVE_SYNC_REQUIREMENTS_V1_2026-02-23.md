# NeoDove Sync Requirements (Santaan Growth OS)

Date: February 23, 2026 (IST)  
Goal: Full lead lifecycle visibility in Santaan CRM + CEO dashboard.

## 1) Syncs required from NeoDove

### A. Real-time inbound webhook sync (mandatory)
Events:
- `Lead Create`
- `Lead Dispose`
- `Lead Update` (if NeoDove supports adding this)
- `Lead Assign/Reassign` (if available)
- `Follow-up Update` (if available)

Payload fields required:
- `lead_id`
- `name`
- `mobile`
- `email` (optional but preferred)
- `campaign_id`
- `campaign_name`
- `event_name`
- `lead_stage_name`
- `lead_status` / `status_code`
- `disposition`
- `dispose_reason`
- `pipeline_name`
- `center` / `branch`
- `assigned_to_id`
- `assigned_to` (agent name)
- `call_connected`
- `call_duration` or `call_duration_sec`
- `next_follow_up` / `follow_up_date`
- `updated_at`

Webhook target:
- `https://santaan.in/api/neodove/webhook?token=<NEODOVE_WEBHOOK_SECRET>`

Optional header:
- `x-neodove-token: <NEODOVE_WEBHOOK_SECRET>`

---

### B. Master data sync (daily)
Need daily pull/export of:
- Campaign master (`campaign_id`, name, source, active status)
- User/agent master (`agent_id`, name, role, center, active status)
- Pipeline and disposition dictionary

Reason:
- CEO dashboard must show owner-wise and campaign-wise truth consistently.

---

### C. Daily reconciliation sync (mandatory)
Daily 8:00 PM IST compare:
- NeoDove total touched leads today
- Santaan CRM updated leads today
- NeoDove converted today
- Santaan CRM converted today

Target:
- Variance <= 5% on touched leads
- Variance <= 2 cases on converted

---

### D. Optional push sync from Santaan to NeoDove (already in place)
Current state:
- Website CTA and lead forms already push into NeoDove custom integration.
Needed:
- Keep campaign mapping updated (`CHATBOTS`, `DIRECT CALLS`, etc.).

## 2) Current implementation status

Implemented:
- NeoDove webhook endpoint active in Santaan app.
- Parsing now supports richer fields:
  - lead id, campaign id, stage, status code, disposition, dispose reason,
  - owner id/name, call connected, call duration, next follow-up, updated time.
- These values are retained in CRM lead message trail and tags for audit.

Still pending (for full maturity):
- Dedicated CRM columns/UI for:
  - owner queue
  - follow-up datetime
  - disposition/lost-reason code
  - call outcome code

## 3) What NeoDove team must configure now

1. Keep webhook enabled for `Lead Create` + `Lead Dispose`.
2. Add additional event triggers if NeoDove supports:
   - assignment changes
   - follow-up updates
3. Send payload fields listed in section 1A.
4. Set secure webhook token:
   - query token and/or header token must match your configured secret.
5. Share daily campaign + agent export with CRM Ops until direct API pull is added.

## 4) Acceptance test checklist

1. Create a new test lead in NeoDove:
   - appears in CRM within 30 seconds.
2. Change status to `IN PROGRESS`:
   - CRM status updates to `contacted` and note trail logs event.
3. Dispose lead with reason:
   - CRM status becomes `lost`, note trail includes reason.
4. Assign lead to another agent:
   - owner tags in CRM update on next webhook.
5. Add follow-up:
   - note trail shows follow-up timestamp.

## 5) Interim process until full deep integration

Use:
- `/admin/dashboard -> Ops Inputs` for agency/field/tv compliance.
- IVR/Telecaller manager runs 3 manual sync cycles from NeoDove:
  - 11 AM, 3 PM, 7 PM.

Reference SOP:
- `INTERIM_IVR_TELECALLER_SOP_V1_2026-02-22.md`
