# Santaan Growth OS & CRM User Manual (Updated March 28, 2026)

This manual is the current operating guide for Santaan's live CRM, Content Publishing flow, WhatsApp AI routing, and NeoDove sync.

## 1. What The System Is

Santaan CRM is now a working Growth OS, not just a contacts sheet.

It combines:

- lead and patient tracking
- role-based dashboards
- daily command and work management
- direct website publishing
- NeoDove reconciliation
- WhatsApp AI enrichment

The goal is simple: every important action should be visible in one system so leadership can see what is working, what is leaking, and what needs follow-up.

## 2. Login

1. Open `santaan.in/login`.
2. Select your role from the dropdown if it is available.
3. Enter your assigned username or email.
4. Enter your 6-digit PIN.
5. Click `Sign In`.

If the PIN fails:

- use `Send Magic Link` if your email is whitelisted
- or ask an admin to reset your PIN in `User Access`

## 3. Role-Based Portals

The CRM changes based on your role. Each role sees different tabs and a different daily workflow.

| Role | Main Purpose | Main Tabs |
| :--- | :--- | :--- |
| **CEO / Admin / CRM Ops Admin** | Daily control, leak detection, growth review | Today, Command Center, Daily Command, Action Board, Workboard, Analytics, Spend, Meta Launch, NeoDove Ops, User Access |
| **Content Manager** | Publish website content and prepare creative inputs | Today, Publish Content, Draft Content, Content Insights, Workboard |
| **Marketing / Agency Ops / Performance** | Spend control, campaign planning, execution handoffs | Today, Meta Launch, Spend Management, Performance Analytics, Ops Inputs, Workboard |
| **Telecaller Manager / IVR Manager** | Calling discipline, lead follow-up, NeoDove exception handling | Today, Action Queue, Daily Command, NeoDove Ops, Hot Leads, Follow-ups, All Contacts |
| **Counselor / Telecaller** | Qualification, counseling, conversion tracking | Today, Hot Leads, Follow-ups, All Contacts |

## 4. Daily Operating Rhythm

Every user should begin from the `Today` tab.

1. Morning standup: review what moved and what is blocked.
2. Execution: work inside your role tabs, not outside the system.
3. Evening closure: update status, follow-ups, and task completion before ending the day.

Golden rules:

- every active lead must have a status
- every active lead should have a next follow-up time
- every call outcome should be reflected in CRM or NeoDove
- every team member should close the loop on the same day

## 5. Screen Guide By Function

### Today

Use this as the home screen every morning.

It gives:

- a rider or daily checklist
- quick links to the correct tabs
- a snapshot of leads, follow-ups, and execution health

### Command Center

For CEO and leadership only.

Use it to review:

- demand and conversion signals
- follow-ups due
- integration health
- compliance and team execution

### Daily Command

Use this to track whether day-level execution is happening properly across the team.

### Workboard

Use this as the operating board for carry-overs, planned work, and evening closure.

### All Contacts / Hot Leads / Follow-ups

Use these for lead management.

Every lead should be updated with:

- status
- notes
- owner
- next follow-up time

### NeoDove Ops

Use this to catch leaks in the calling loop.

It is built for:

- missing owners
- missing follow-ups
- stale sync
- duplicate or error webhooks
- status drift between NeoDove and CRM

### User Access

Admins can:

- create username + PIN based users
- reset staff PINs
- disable or delete access
- bulk-create users for onboarding

### Publish Content

Content team can publish directly to the website from CRM.

Use this for:

- announcements
- clinical insight posts
- doctor updates

## 6. Direct Website Publishing

This feature is live and ready for use.

Steps:

1. Open `Publish Content`.
2. Enter the title.
3. Choose category:
   - `News & Announcement`
   - `Clinical Insight (Blog)`
   - `Doctor Update`
4. Paste or write the content in simple paragraphs.
5. Click `Publish Live`.

What happens:

- content is formatted into website-ready HTML
- a unique slug is generated
- the post goes live directly on `santaan.in`

Publishing destinations:

- news and announcements: announcements/news sections
- blog posts: `/fertility-insights`
- doctor updates: `/clinical-insights`

## 7. Lead Management Rules

Use these five lead statuses consistently:

- `New`
- `Contacted`
- `Qualified`
- `Converted`
- `Lost`

When updating a lead:

1. open the lead
2. update status
3. add notes
4. set next follow-up if the lead is still active
5. save before leaving

Important:

- `Qualified` means the lead is real and worth active counseling
- `Converted` means the patient has moved into treatment/registration
- `Lost` should be used only when the lead is clearly closed out

## 8. WhatsApp AI Agent

The WhatsApp system is no longer a simple autoresponder. It is an AI-assisted lead context layer.

What it does:

- reads the incoming message
- checks recent conversation history
- extracts sentiment and intent
- stores the conversation in CRM memory
- sends an enriched note to NeoDove

Telecallers should expect NeoDove notes in this format:

`[WA AI AGENT] Sentiment: ... | Intent: ...`

This helps the calling team understand the lead before they call.

## 9. NeoDove -> CRM Sync

This wiring is now live and acceptance-tested.

Confirmed live behavior:

- NeoDove webhook authentication is working
- incoming leads can create/update CRM contacts
- production webhook is returning `200`
- test leads have landed successfully in CRM

### What NeoDove Sends Reliably

The live parser now accepts common NeoDove payload shapes including:

- `lead_id`
- `name`
- `mobile`
- `email`
- `campaign_id`
- `campaign_name`
- `lead_stage_name`
- `lead_status`
- `lead_status_name`
- `dispose_remark`
- `branch` or `branch_name`
- follow-up fields
- call duration aliases
- epoch timestamps and date strings

### What The CRM Uses NeoDove For

- create/update lead records
- update owner and status context
- store call/disposition context when present
- append NeoDove webhook history to the contact trail
- surface exceptions in `NeoDove Ops`

## 10. NeoDove Workflow Reality

This section replaces older assumptions.

Based on live NeoDove testing on March 28, 2026:

- workflow auth should use the live `NEODOVE_WEBHOOK_SECRET`
- current workflow event options available in NeoDove are:
  - `Lead Created`
  - `Call Connected`
  - `Call Not Connected`
- NeoDove campaign selection is single-select, not all-campaign global
- if you want all campaigns covered, workflows must be duplicated per campaign

This means:

- create workflows for each important campaign
- use `Send All Data`
- use the Santaan webhook URL with the correct token
- verify NeoDove notification history returns `200`

Do not rely on older instructions that mention separate NeoDove workflow events such as:

- `Lead Dispose`
- `Lead Reassign`
- `Follow-up Update`

Those were not available in the tested NeoDove workflow interface.

## 11. NeoDove Setup Checklist

In NeoDove, each active webhook should be configured as:

- method: `POST`
- body type: `JSON`
- payload mode: `Send All Data`
- URL: `https://santaan.in/api/neodove/webhook?token=YOUR_NEODOVE_WEBHOOK_SECRET`

Recommended operating check:

1. create a test lead in NeoDove
2. confirm NeoDove notification history returns `200`
3. confirm the contact appears in Santaan CRM
4. confirm owner, status, and follow-up data move when available
5. review `NeoDove Ops` for exceptions

## 12. User Access And PIN Management

Admins should use `User Access` for all onboarding.

Capabilities:

- create individual users
- assign role
- set or reset PIN
- bulk create user batches
- disable former staff

Best practice:

- use username-based logins for staff
- keep email-based magic link only as backup
- remove access the same day a role changes

## 13. What Leadership Should Review Daily

CEO / Admin should check:

- `Today`
- `Command Center`
- `Analytics`
- `Spend`
- `NeoDove Ops`
- `Workboard`

Leadership should focus on:

- are leads coming in?
- are follow-ups happening on time?
- are hot leads leaking?
- is spend producing real progress?
- is NeoDove sync healthy?

## 14. Troubleshooting

### I cannot log in

- confirm username/email
- confirm 6-digit PIN
- try magic link
- ask admin to reset PIN in `User Access`

### I cannot see my tab

- your assigned role is likely wrong
- ask admin to review your role in `User Access`

### My lead is missing

- search by name, phone, or email
- check status filters
- check whether it came via NeoDove and review `NeoDove Ops`

### NeoDove says success but the lead is not visible

- check if the contact already exists under the same mobile/email
- check NeoDove payload quality
- check CRM note trail and Ops view

### A lead has no next action

- assign owner
- update status
- set next follow-up immediately

## 15. Final Operating Principle

The CRM only helps the business if the team uses it as the source of truth.

That means:

- marketing logs spend and inputs
- content publishes and records output
- telecalling updates lead outcomes
- leadership reviews the same dashboard every day

If the team records work inside the system, Santaan can spot growth, leakage, and conversion bottlenecks quickly.
