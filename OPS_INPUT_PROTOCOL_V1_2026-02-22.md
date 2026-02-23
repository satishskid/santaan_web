# Santaan CRM Ops Input Protocol (V1)

System date: February 22, 2026  
Applies to: Agency team, Field team, TV/media ops, CEO/CRM admin

## 1) Objective
Capture all paid, offline, and TV activity in one CRM so CEO can see:
- What is running
- What it costs
- What leads/registrations it creates
- Which team has not submitted required data

## 2) Where to update in CRM
Admin dashboard -> `Ops Inputs` tab:
- `Agency`
- `Field Team`
- `TV Ads`

## 3) Daily SLA (mandatory)
- Agency: submit by `11:00 AM IST`
- Field team: submit same day by `8:00 PM IST`
- TV/media ops: submit same day after each airing batch

If no activity happened, submit a zero row with note `no_activity`.

## 4) Agency input (mandatory fields)
One row per campaign per day.

Required:
- `report_date`
- `platform` (`meta|google|youtube`)
- `center` (`bhubaneswar|berhampur|bangalore`)
- `campaign_id`
- `campaign_name`
- `utm_source` (`meta|google|youtube`)
- `utm_medium` (`paid_social|cpc|video`)
- `utm_campaign`
- `spend`
- `impressions`
- `clicks`
- `leads`
- `qualified_leads`
- `registrations`

Validation rules:
- `qualified_leads <= leads`
- `registrations <= leads`

## 5) Field team input (mandatory fields)
One row per doctor visit / hoarding / camp / event.

Required:
- `activity_date`
- `center`
- `activity_type` (`doctor_visit|hoarding|camp|event`)
- `asset_code`
- `location`
- `owner_name`
- `utm_campaign`
- At least one tracking handle:
  - `qr_code_id` OR
  - `call_number` OR
  - `whatsapp_number`

Recommended:
- `proof_url` (image proof)
- `spend`, `estimated_reach`, `actual_footfall`, `leads_collected`, `qualified_leads`, `registrations`

Validation rules:
- `qualified_leads <= leads_collected`
- `registrations <= leads_collected`

## 6) TV ad input (mandatory fields)
One row per TV airing block.

Required:
- `airing_date`
- `center`
- `channel_name`
- `program_name`
- `time_slot`
- `spot_duration_sec`
- `spots_count`
- `creative_code`
- `tv_campaign_code`
- `utm_campaign`
- At least one tracking handle:
  - `qr_code_id` OR
  - `ivr_number` OR
  - `whatsapp_keyword`

Recommended:
- `spend`
- `notes`

## 7) UTM rule (non-negotiable)
All digital links and QR destinations must include:
- `utm_source`
- `utm_medium`
- `utm_campaign`

Standard source set:
- `meta`, `google`, `youtube`, `doctor`, `hoarding`, `camp`, `tv`

## 8) CEO review routine
In `CEO Command Center`:
- Check `Protocol Compliance (Today)`:
  - Agency rows today
  - Field rows today
  - TV rows today
- If any is `Missing`, owner is blocked from scaling budget that day.

## 9) Ownership
- CEO/CRM Admin: enforce SLA and data quality
- Agency lead: campaign and spend truth
- Field lead: offline activity and lead capture truth
- TV/media lead: airing and tracking truth

## 10) Enforcement policy
- 1st miss: warning
- 2nd miss in 7 days: freeze new budget approvals for that owner
- 3rd miss in 30 days: weekly review escalation with CEO
