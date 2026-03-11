# Santaan NeoDove Rollout SOP
Date: March 11, 2026

Purpose: Define how Santaan, the agency, and the telecalling team will operate NeoDove so that telecalling execution becomes measurable, attributable, and usable inside Santaan CRM.

## 1. Operating principle
- NeoDove is the telecalling execution system.
- Santaan CRM is the reporting and decision system.
- Campaign identity must be preserved before or at NeoDove entry.
- If work is not updated in NeoDove or Santaan CRM, it is treated as not done.

## 2. What this SOP is solving
- Paid call leads are entering a common flow and campaign identity is getting lost.
- Agency cannot accurately fill campaign-wise leads and qualified leads.
- CEO cannot see true campaign to qualification flow.
- Telecalling performance is visible only partially.

## 3. Final source buckets to create in NeoDove
Create separate NeoDove campaigns for at least:
- META_BBSR_CALL
- META_BAM_CALL
- META_RETARGET_CALL
- GOOGLE_BBSR_CALL
- GOOGLE_BAM_CALL
- DIRECT_WEBSITE_CALL
- WHATSAPP_INBOUND
- ORGANIC_CALLS
- MISSED_CALL_FOLLOWUP
- OLD_FOLLOW_UP

## 4. Tracking number rule
Best practice:
- one number per major paid campaign

Minimum acceptable:
- one number per center/source bucket

Required mapping sheet:
- number
- source bucket
- center
- NeoDove campaign
- owner

## 5. Standard lead stages
All NeoDove campaigns must use the same stages:
- OPEN
- CONTACTED
- QUALIFIED
- CONSULT_BOOKED
- CONVERTED
- LOST

## 6. Standard lost reasons
Use only these codes:
- price
- not_ready
- family_discussion
- competitor
- no_response
- outside_city
- medical_deferral
- duplicate_invalid

## 7. Telecaller mandatory update fields
For every touched lead, telecaller must update:
- status
- last contact time
- call outcome
- next follow-up time
- lost reason if lost
- qualified handoff note if qualified

## 8. Qualified handoff note format
Every qualified lead handed to counselor must include:
- center
- treatment intent
- key concern
- urgency
- affordability note
- requested callback or consult slot

## 9. Telecaller SLA
- Hot leads: first contact within 10 minutes
- All new leads: first contact within 2 hours
- Qualified leads: same-day counselor handoff
- No OPEN lead should stay stale beyond 2 hours without a documented reason
- No LOST lead should exist without a lost reason

## 10. Agency operational duties inside NeoDove
Agency manages:
- campaign to NeoDove mapping
- number to campaign mapping
- queue hygiene review
- stale lead review
- missed-call recovery monitoring
- workflow and webhook health check
- daily reporting discipline

Agency does not change without Santaan approval:
- stage definitions
- lost reason definitions
- counselor handoff logic
- campaign architecture

## 11. NeoDove automation to enable
Webhook events:
- Lead Create
- Lead Dispose
- optionally Lead Delete

Workflow triggers:
- lead created
- call connected
- call not connected
- qualified

Workflow outcomes:
- send webhook to Santaan CRM
- move or copy lead where needed
- send WhatsApp rescue or follow-up template where approved

## 12. Website and WhatsApp routing
Website forms should send leads into the correct NeoDove campaign through Custom Integration.

Mandatory website form fields:
- name
- mobile
- email
- center
- utm_source
- utm_medium
- utm_campaign
- landing_path

WhatsApp enquiries should enter the correct NeoDove campaign through the WhatsApp integration layer.

## 13. Daily operating sequence
### 09:00 AM
- Telecalling lead reviews fresh leads and stale OPEN leads

### 11:00 AM
- Agency updates spend and campaign hygiene in Santaan CRM

### 11:30 AM
- Agency verifies NeoDove queue health and stale lead list

### 03:00 PM
- Telecalling lead checks qualified handoffs and missed-call recovery

### 06:00 PM
- Agency and telecalling lead complete second queue review

### 07:30 PM
- Santaan leadership reviews CEO Command and action queue

## 14. Interim rule until full attribution is live
- Agency must report spend, impressions, and clicks accurately
- Exact campaign-wise call leads must not be claimed unless traceable from NeoDove campaign mapping
- If not traceable, note: "Campaign-wise call attribution unavailable; center-level truth only"

## 15. What Santaan must prepare before build
- final campaign naming convention
- tracking number procurement decision
- NeoDove admin access owner
- webhook secret owner
- BhashSMS / WhatsApp API owner
- final center codes
- final stage and lost-reason approval
- telecaller queue ownership

## 16. Build recommendation
Yes, build the new integration architecture.

Build it in parallel with the current CRM, behind feature flags, so the current working CRM is not disturbed.

Suggested feature flags:
- ENABLE_NEODOVE_AUTOMATION
- ENABLE_NEODOVE_SLA
- ENABLE_AUTO_CAMPAIGN_LEADS

## 17. What is needed from Santaan to start development
- approval to build the integration layer in parallel
- NeoDove admin coordination access
- final source bucket list
- final number mapping plan
- webhook secret
- confirmed telecaller ownership structure
- confirmation of who owns WhatsApp routing

## 18. Final expected outcome
After rollout:
- NeoDove becomes the execution truth for telecalling
- Santaan CRM becomes the intelligence and CEO command layer
- agency stops guessing leads
- telecaller SLA becomes visible
- campaign to qualified lead flow becomes measurable
