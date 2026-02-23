# Santaan CARE Team Setup (V1)
Date: February 22, 2026
Purpose: Single-dashboard operations with clear ownership, SLA discipline, and easy user lifecycle management.

## 1) Final Team (V1)
1. CEO
2. CRM Ops Admin
3. Agency Growth + Performance (combined role)
4. Field Exec - Bhubaneswar
5. Field Exec - Berhampur
6. Field Exec - Bangalore
7. IVR Lead
8. Telecaller Exec - Bhubaneswar
9. Telecaller Exec - Berhampur
10. Telecaller Exec - Bangalore
11. Counselor - Bhubaneswar
12. Counselor - Berhampur
13. Counselor - Bangalore

## 2) Role, CRM Duties, SLA

| Role | Primary Responsibility | Daily CRM Duties | SLA |
|---|---|---|---|
| CEO | Weekly growth decisions and escalation clearance | Review CEO dashboard, approve/assign high-priority actions, close weekly review | Weekly review completed with owner + due date for all red items |
| CRM Ops Admin | Data integrity and access control | Run data quality checks, fix missing owner/status/source, manage users | 0 records with missing owner/status at day close; daily QA report by 7:00 PM |
| Agency GP | Campaign + spend + optimization ownership | Update campaign status, spend rows, test notes, UTM compliance | 100% active campaigns with valid UTM; spend updated by 11:00 AM daily; underperformers flagged within 24h |
| Field Exec (per center) | Capture offline demand into CRM | Upload offline leads, source tags, map/location fields, center mapping | 100% offline leads uploaded in 24h with valid source + center + location |
| IVR Lead | Queue control and speed-to-lead compliance | Assign queues, monitor breach list, escalate delays | Hot leads contacted in 10 min; all new leads first-touch in 2h |
| Telecaller Exec (per center) | First contact and progression | Update first contact timestamp, call outcome, next follow-up, status transition | No pending assigned lead beyond shift end without next action; SLA compliance >= 90% |
| Counselor (per center) | Qualified-to-registration closure | Update qualification, consult booking, converted/lost status, reason codes | Qualified leads actioned same day; 100% lost leads with mandatory reason |

## 3) Standardized CRM Input Rules (No Bias)
Use fixed values only.

### 3.1 Lead Status
- new
- contacted
- qualified
- consult_booked
- converted
- lost

### 3.2 Lead Source
- meta
- google
- youtube
- organic
- offline_event
- hoarding_qr
- ivr
- whatsapp
- referral
- neodove

### 3.3 Center
- bhubaneswar
- berhampur
- bangalore
- network

### 3.4 Call Outcome
- answered
- no_answer
- switched_off
- wrong_number
- callback_requested
- not_interested

### 3.5 Lost Reason
- price
- delay
- not_ready
- family_decision
- competitor
- no_response
- medical_deferral
- invalid_lead

### 3.6 Campaign Status
- running
- hold
- fix
- stop

## 4) Starter Usernames and Temporary Passwords
Note: Username-based login for operations simplicity. Emails are not required for each user mailbox.

| Role | Username | Temporary Password |
|---|---|---|
| CEO | ceo.core01 | SaCeo#2601! |
| CRM Ops Admin | crm.ops01 | SaOps#2602! |
| Agency GP | agency.gp01 | SaAgp#2603! |
| Field Exec - Bhubaneswar | field.bbsr01 | SaFld#2604! |
| Field Exec - Berhampur | field.ber01 | SaFld#2605! |
| Field Exec - Bangalore | field.blr01 | SaFld#2606! |
| IVR Lead | ivr.lead01 | SaIvr#2607! |
| Telecaller - Bhubaneswar | ivr.bbsr01 | SaIvr#2608! |
| Telecaller - Berhampur | ivr.ber01 | SaIvr#2609! |
| Telecaller - Bangalore | ivr.blr01 | SaIvr#2610! |
| Counselor - Bhubaneswar | counsel.bbsr01 | SaCnl#2611! |
| Counselor - Berhampur | counsel.ber01 | SaCnl#2612! |
| Counselor - Bangalore | counsel.blr01 | SaCnl#2613! |

## 5) Account Administration Authority
Only these users can create/reset/disable users:
1. CEO (`ceo.core01`)
2. CRM Ops Admin (`crm.ops01`)

## 6) User Lifecycle SOP

### 6.1 Create New User
1. CRM Ops Admin opens User Management.
2. Create username using role-center pattern.
3. Assign role and center scope.
4. Set temporary password.
5. Mark "force reset on first login".

### 6.2 Reset Existing User
1. Verify identity through team lead.
2. Issue temporary password reset.
3. Force session logout.
4. User must reset on next login.

### 6.3 Exit/Replacement
1. Disable user account immediately.
2. Reassign open leads/tasks to replacement account.
3. Log change in audit note.

## 7) Daily Operating Rhythm
1. 9:00 AM - IVR Lead queue assignment.
2. 11:00 AM - Agency GP spend + campaign updates complete.
3. 2:00 PM - Field exec uploads and mapping complete.
4. 5:00 PM - Counselors close qualified pipeline updates.
5. 7:00 PM - CRM Ops publishes SLA/data-quality breach list.
6. 7:30 PM - Team leads close pending actions.

## 8) CEO View (Must stay simple)
CEO should review only:
1. Registrations by center
2. Spend, CPL, Cost per Registration
3. Campaign board (running/hold/fix/stop)
4. SLA breaches by team
5. Action queue with owner + deadline + status

## 9) Policy
If an activity is not updated in CRM, it is treated as not done.
