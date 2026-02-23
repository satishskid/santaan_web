# Santaan CRM Team Training Manual (Beginner-Friendly)

Version: 1.0  
Date: February 23, 2026 (IST)  
Audience: Clinical, counseling, telecalling, field, agency, and leadership teams (non-technical users)

---

## 1) Why this manual exists

Santaan now uses one Growth CRM dashboard so every team works in one place.

This manual helps each team member answer 4 questions:
1. What is my job in CRM?
2. What exactly should I update daily?
3. What is my SLA (service level expectation)?
4. How will my work be reviewed by leadership?

Golden rule: **If work is not updated in CRM, it is treated as not done.**

---

## 2) Simple glossary (no jargon)

- **Lead**: A person who showed interest (call, WhatsApp, form, camp, referral, ad).
- **Qualified Lead**: A lead ready for counseling/consultation follow-up.
- **Converted**: Lead becomes registered patient/confirmed consult as per process.
- **Campaign**: A promotion effort (Meta ad, Google ad, TV run, field camp, hoarding).
- **Source**: Where lead came from (Meta, Google, IVR, field, referral, etc.).
- **Center**: Bhubaneswar, Berhampur, Bangalore.
- **UTM**: Link tags used by marketing to identify exact campaign and ad source.
- **SLA**: Time and quality standards your role must meet.
- **Workboard**: Daily task panel where each user marks task status + notes.
- **Ops Inputs**: Structured forms for campaign spend, field activity, TV logs.
- **CEO Command View**: Executive screen for leaks, ROI, and owner actions.

---

## 3) Team model (simple structure)

### 3.1 Leadership
1. CEO + CRM Ops Admin

### 3.2 Growth team (agency/outsource)
1. Agency Growth & Performance role

### 3.3 Ground execution team (internal)
1. Field Exec - Bhubaneswar
2. Field Exec - Berhampur
3. Field Exec - Bangalore
4. IVR Lead
5. Telecaller Exec(s)
6. Counselor - Bhubaneswar
7. Counselor - Berhampur
8. Counselor - Bangalore

Each role has a login and fixed responsibilities.

---

## 4) Login and access basics

1. Open login page: `/login`
2. Enter assigned username/email and password.
3. After login, go to: `/admin/dashboard`
4. Use only your role tabs. Do not edit data outside your scope.

If login fails:
1. Check spelling.
2. Retry in private/incognito browser.
3. Contact CRM Ops Admin for reset.

Password policy:
1. Do not share passwords.
2. If someone leaves team, admin resets immediately.
3. Admin can create/disable/reset users.

---

## 5) What each role must do daily

## 5.1 Telecaller / IVR Executive

### Job purpose
Fast first contact and clean follow-up progression.

### Must update for every lead touched
1. Lead status (`new`, `contacted`, `qualified`, `lost`, etc.)
2. Last contact time
3. Call outcome
4. Next follow-up time
5. If lost: reason code
6. If qualified: handoff note for counselor

### Daily SLA
1. Hot leads: first contact within 10 minutes
2. New leads: first contact within 2 hours
3. No lead should be left without next action by shift close

### Where to work
1. `Hot Leads`
2. `All Contacts`
3. `Workboard` (cycle update notes)

---

## 5.2 IVR Lead

### Job purpose
Queue discipline and telecalling velocity control.

### Must do daily
1. Check lead aging and uncontacted queue (morning, afternoon, evening)
2. Reassign overloaded queues
3. Flag SLA breaches in Workboard
4. Ensure disposition completeness from telecallers

### Daily SLA
1. 100% hot-lead queue monitored
2. Breach list escalated same day
3. End-of-day cycle note posted

---

## 5.3 Counselor (Center-wise)

### Job purpose
Convert qualified leads to consultation and registration outcomes.

### Must update daily
1. Counseling action taken
2. Consultation booked or pending reason
3. Converted/lost status updates
4. Lost reason (mandatory)
5. Next follow-up with date/time (if pending)

### Daily SLA
1. All qualified leads actioned same day
2. No closure without reason
3. No pending qualified lead without next follow-up schedule

---

## 5.4 Field Executive (Center-wise)

### Job purpose
Capture offline demand into CRM with trackable source.

### Must update daily (Ops Inputs -> Field)
1. Date
2. Center
3. Activity type (doctor visit, camp, hoarding, event)
4. Location/map info
5. Asset code or activity code
6. Owner name
7. UTM campaign or tracking tag
8. At least one trackable handle (QR/call/WhatsApp)

### Daily SLA
1. 100% same-day field activity logging
2. Every activity should have center + location + owner
3. No untagged offline asset

---

## 5.5 Agency Growth & Performance (Outsourced)

### Job purpose
Campaign execution quality and spend discipline.

### Must update daily (Ops Inputs -> Agency + Spend)
1. Platform (Meta/Google/YouTube)
2. Campaign name/id
3. Center mapping
4. UTM source/medium/campaign
5. Spend amount
6. Lead/conversion notes
7. Underperforming campaign flag + corrective action

### Daily SLA
1. 100% active campaigns with valid UTM
2. Daily spend entry by 11:00 AM
3. Underperformers flagged and action note in 24h

---

## 5.6 CRM Ops Admin

### Job purpose
Data hygiene, user access, and dashboard trust.

### Must do daily
1. Check missing owner/status/source fields
2. Check invalid center/source values
3. Manage user access and resets
4. Ensure role tabs and forms working
5. Publish compliance summary for leadership

### Daily SLA
1. 0 records with missing owner/status at day close
2. User reset turnaround same day
3. Daily data-quality closure note posted

---

## 5.7 CEO

### Job purpose
Take weekly growth decisions from action data, not assumptions.

### Weekly decision questions
1. Are enough qualified leads coming center-wise?
2. Are leads contacted quickly enough?
3. Which channels are creating registrations at acceptable cost?
4. Where are leaks happening (delay, attribution, counseling, trust)?
5. Which owner must execute which fix this week?

### CEO review rhythm
1. Monday: assign weekly priorities by center/channel
2. Mid-week: check SLA breaches and corrective action status
3. Friday: review results and decide scale/pause/fix

---

## 6) How to fill forms correctly (standardization protocol)

## 6.1 Lead status progression
Use this journey only:
`new -> contacted -> qualified -> converted` or `lost`

## 6.2 Mandatory reason codes
If lead is marked `lost`, reason is mandatory:
1. price
2. delay
3. not_ready
4. family_decision
5. competitor
6. no_response
7. medical_deferral
8. invalid_lead

## 6.3 Standard source values
Use fixed values only (no free typing variants):
1. neodove
2. meta
3. google
4. organic
5. referral
6. ivr
7. whatsapp
8. offline_event
9. hoarding_qr

## 6.4 Workboard note format
Every note should contain:
1. What was done
2. What is blocked (if blocked)
3. Who owns next step and by when

Example good note:
`34 hot leads called, 26 contacted, 8 no-answer. 5 qualified handed to Counselor BBSR. 3 leads pending callback at 7:30 PM.`

---

## 7) 7-day beginner training plan (trainer-ready)

## Day 0 (Preparation by CRM Ops Admin)
1. Create/reset role logins
2. Verify role access tabs
3. Prepare sample data for practice
4. Share this manual + quick start sheet

## Day 1 (All-hands orientation, 90 min)
1. Why single dashboard matters
2. Basic CRM walkthrough
3. Role accountability overview
4. Live demo: update one lead + one task

## Day 2 (Role-based workshops, 60-90 min each)
1. Telecalling + IVR module
2. Counselor module
3. Field module
4. Agency module
5. Admin + CEO module

## Day 3 (Guided practice)
1. Real shift with supervisor
2. Each user updates at least 10 records
3. Trainer checks errors and fixes

## Day 4 (SLA drill day)
1. Speed-to-lead timing drill
2. Lost-reason mandatory drill
3. Workboard note quality drill

## Day 5 (First compliance review)
1. Team-wise SLA scorecard
2. Common mistakes and corrections
3. Escalation protocol rehearsal

## Day 6 (Center-wise execution simulation)
1. Bhubaneswar scenario
2. Berhampur scenario
3. Bangalore scenario

## Day 7 (Sign-off)
1. Role readiness check
2. User certification (basic checklist)
3. Go-live operations handoff

---

## 8) Trainer checklists

## 8.1 Daily trainer checklist
1. Attendance captured
2. Each user completed role flow
3. Errors documented and corrected
4. SLA understanding tested
5. End-of-day competency logged

## 8.2 User readiness checklist
A user is ready only if all are true:
1. Can login without help
2. Can update contact status correctly
3. Can enter follow-up details correctly
4. Can update Workboard note with owner + next step
5. Can explain own SLA in simple words

---

## 9) Monitoring and scorecard model

## 9.1 Team scorecard (daily)
1. SLA compliance %
2. Data completeness %
3. Pending >24h count
4. Blocked tasks count
5. Closure quality (notes and reasons)

## 9.2 Escalation ladder
1. First miss: Team lead correction same day
2. Second miss (same week): CRM Ops escalation
3. Third miss: CEO review with action assignment

---

## 10) Beginner FAQ

### Q1. I called lead but forgot to update CRM. What now?
Update immediately with actual call time and note. Do not leave blank.

### Q2. Lead did not answer. Which status?
Set call outcome as no-answer and set next follow-up time.

### Q3. I am not sure which center to select.
Select based on service center responsibility. If unclear, ask team lead before saving.

### Q4. Why UTM is mandatory for marketing links?
Without UTM, CEO cannot see true campaign performance.

### Q5. Can I close lead as lost without reason?
No. Lost reason is mandatory.

---

## 11) Non-negotiable rules

1. No backdated bulk updates at day close.
2. No free-text random source names.
3. No lost closure without reason.
4. No blocked task without owner and timeline.
5. No campaign run without UTM tags.

---

## 12) First-week operating targets (starter targets)

Use these as initial training targets, then revise with real data after 2 weeks.

1. Telecalling SLA compliance: >= 85%
2. Qualified lead same-day counselor action: >= 90%
3. Campaign UTM compliance: 100%
4. Daily spend logging by agency: 100%
5. Field activity same-day logging: 100%
6. Missing mandatory fields at day close: <= 2%

---

## 13) Ownership matrix (quick view)

1. CEO: Weekly growth decisions and escalations
2. CRM Ops Admin: User control + data quality
3. Agency: Campaign + spend + optimization updates
4. Field Exec: Offline activity capture and mapping
5. IVR Lead: Queue discipline and response speed
6. Telecaller: Lead progression and follow-up control
7. Counselor: Qualified-to-registration outcomes

---

## 14) Final note for team

This system is not for reporting only. It is for daily execution and accountability.
If each role updates honestly and on time, Santaan leadership can scale what works, fix leaks quickly, and improve patient experience center-wise.

