# Santaan Growth OS: Daily Update Template (v1)

Date: 2026-03-05  
Audience: Agency + Internal Ops Teams + CEO  
Goal: Standardized, bias-free daily inputs so CRM dashboards show actionable truth.

## 1) Daily Submission Windows (IST)

- Agency Media Ops: by 11:00 AM
- Telecalling Lead: by 7:00 PM
- Counselor Leads (per center): by 7:30 PM
- Field Executives (per center): by 8:00 PM
- CRM Ops Admin: by 8:30 PM reconciliation
- CEO View Ready: 9:00 PM

## 2) Mandatory Daily Inputs by Team

## 2.1 Agency Media Ops (Meta/Google/YouTube)

Update in CRM `Spend` + `Agency Performance`.

Required fields:
- `report_date` (YYYY-MM-DD)
- `platform` (`meta|google|youtube`)
- `account_id`
- `campaign_id`
- `campaign_name`
- `adset_or_adgroup_name`
- `ad_name`
- `spend_inr`
- `impressions`
- `clicks`
- `leads_platform`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `center` (`bhubaneswar|berhampur|bangalore|angul|multi`)
- `asset_code`
- `landing_url`

SLA:
- 100% active campaigns updated daily.
- 0 campaigns without UTM.
- Underperforming campaign flag within 24h.

## 2.2 IVR/Telecalling Lead (NeoDove + CRM)

Update daily closure summary in CRM `Ops Inputs / IVR`.

Required fields:
- `date`
- `center`
- `total_new_leads`
- `hot_leads` (contacted within 10 min)
- `contacted_within_2h`
- `pending_over_2h`
- `connected_calls`
- `qualified_leads`
- `lost_leads`
- `top_lost_reason_code` (single top reason)
- `next_day_risk_notes`

Telecaller-level mandatory logging (source system: NeoDove):
- `status`
- `last_contact_time`
- `call_outcome_code`
- `next_followup_time`
- `lost_reason_code` (if lost)
- `handoff_note` (if qualified)

SLA:
- Hot leads contacted in 10 min.
- All new leads contacted in 2h.
- 100% touched leads must have next step.

## 2.3 Counselor Leads (per center)

Update in CRM `Ops Inputs / Counselor`.

Required fields:
- `date`
- `center`
- `qualified_leads_received`
- `consults_scheduled`
- `consults_done`
- `registrations`
- `pending_followups`
- `lost_after_consult`
- `top_objection_code` (`cost|fear|delay|family|other`)
- `action_taken_today`

SLA:
- Same-day action on all qualified leads.
- 100% lost-after-consult with reason code.
- Registration update before day close.

## 2.4 Field Executives (Center-wise)

Update in CRM `Field Activities`.

Required fields:
- `activity_date`
- `center`
- `activity_type` (`camp|doctor_visit|hoarding|event|rwa|other`)
- `asset_code`
- `location`
- `owner_name`
- `spend`
- `estimated_reach`
- `actual_footfall`
- `leads_collected`
- `qualified_leads`
- `registrations`
- `utm_campaign`
- `qr_code_id`
- `call_number`
- `whatsapp_number`
- `proof_url` (photo/video drive link)
- `notes`

SLA:
- 100% offline assets tagged with QR/UTM.
- Leads uploaded within 24h.
- Proof URL mandatory for every activity.

## 2.5 CRM Ops Admin

Update in CRM `Ops Workboard`.

Required checks:
- `missing_utm_count`
- `missing_owner_count`
- `missing_status_count`
- `duplicate_lead_count`
- `neodove_sync_status` (`ok|partial|failed`)
- `meta_sync_status` (`ok|partial|failed`)
- `ga4_sync_status` (`ok|partial|failed`)
- `critical_alerts`
- `actions_assigned_today`

SLA:
- No broken mandatory fields by day close.
- All sync failures escalated same day.
- CEO dashboard ready by 9:00 PM.

## 3) Mandatory UTM Standard (All Teams)

Use all parameters in every digital/offline trackable URL:

- `utm_source` (meta/google/youtube/ivr/field/whatsapp)
- `utm_medium` (paid/organic/offline/call/qr)
- `utm_campaign` (service_city_quarter format)
- `utm_content` (creative/ad variation)
- `center` (branch target)
- `asset` (exact asset id)

Example:
`https://santaan.in/ivf-clinic-bhubaneswar?utm_source=meta&utm_medium=paid&utm_campaign=ivf_bhubaneswar_q2&utm_content=reel_a&center=bhubaneswar&asset=meta_reel_07`

## 4) Daily CEO Snapshot (Auto-compiled by CRM Ops)

Must include only these 8 decision fields:
- Total leads today
- Qualified leads today (by center)
- Registrations today (by center)
- Cost per qualified lead (CPQL) by channel
- Cost per registration (CPR) by channel
- Pending >24h count
- Top 3 leakage reasons
- Next-day owner action list (owner + deadline)

## 5) Compliance Scoring (Displayed Weekly)

- Green: >=95% data completeness + SLA met
- Amber: 80-94% completeness or minor SLA misses
- Red: <80% completeness or repeat SLA breach

Rule: `No data = no credit`.  
Rule: `No reason code = invalid update`.  
Rule: `No UTM = unattributed spend`.

## 6) Copy/Paste CSV Header Templates

Agency daily:
`report_date,platform,account_id,campaign_id,campaign_name,adset_or_adgroup_name,ad_name,spend_inr,impressions,clicks,leads_platform,utm_source,utm_medium,utm_campaign,utm_content,center,asset_code,landing_url`

Telecalling daily summary:
`date,center,total_new_leads,hot_leads,contacted_within_2h,pending_over_2h,connected_calls,qualified_leads,lost_leads,top_lost_reason_code,next_day_risk_notes`

Counselor daily summary:
`date,center,qualified_leads_received,consults_scheduled,consults_done,registrations,pending_followups,lost_after_consult,top_objection_code,action_taken_today`

## 7) Rollout Protocol (First 14 Days)

- Day 1-3: soft launch, monitor missing fields.
- Day 4-7: enforce mandatory fields, reject incomplete updates.
- Day 8-14: SLA scoring visible to CEO, weekly accountability review.

---

Owner: CEO + CRM Ops Admin  
Document type: Operating protocol (live)
