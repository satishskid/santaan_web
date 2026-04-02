# Santaan Voice Agent System README

Date: April 2, 2026 (IST)
Purpose: Technical and operational README for future teams building, maintaining, and evolving Santaan's voice-agent stack
Status: Working system guide

## 1) What This System Is

This repo contains Santaan's governed voice-agent operating system.

It is made of four connected layers:

1. voice behavior design
2. webhook and CRM integration
3. operational governance
4. admin controls for live maintenance

The system is designed so that future teams can:
- understand how calls are processed
- see how routing decisions are made
- know where prompts and scripts live
- review and change voice behavior safely
- keep operations inside the CRM instead of scattered across vendor tools

## 2) System Goals

Primary goals:
- capture and normalize inbound voice conversations from Bolna
- route voice leads into Santaan CRM and NeoDove cleanly
- distinguish `main` vs `tv` traffic safely
- keep prompt behavior reviewable in the repo
- allow ops teams to see live rollout state from the admin panel

Secondary goals:
- support WhatsApp follow-up after calls
- support controlled prompt iteration
- support role-based operational access

## 3) System Non-Goals

This stack does not try to:
- diagnose fertility issues
- replace doctors or counselors
- let the vendor UI become the source of truth
- let any prompt edit go live without a paper trail

## 4) High-Level Architecture

### Runtime flow

1. Caller reaches a public phone number
2. Telephony routes the call into Bolna
3. Bolna runs the appropriate inbound agent
4. Bolna sends terminal execution payload to Santaan webhook
5. Santaan normalizes the payload
6. Santaan logs the call in `voice_call_logs`
7. If the call is a real completed human conversation:
   - Santaan creates or updates a CRM contact
   - Santaan pushes the lead to NeoDove
   - Santaan can trigger WhatsApp follow-up
8. Santaan stores the operational metadata for later QA and review

### Control flow

1. Approved prompts and scripts live in repo docs
2. Voice Ops panel reads those docs into the CRM
3. Live rollout metadata is stored in `settings`
4. Future teams can compare:
   - approved docs
   - live deployment metadata
   - observed QA performance

## 5) Key Code Files

### Voice normalization and routing

- `src/lib/voice-ai.ts`

What it does:
- normalizes raw Bolna payloads into a stable internal shape
- extracts `telephony_data`, `conversation_time`, `transcript`, `answered_by_voice_mail`
- infers route as `main` or `tv`
- supports fallback routing by:
  - called number
  - `agent_id`
  - `agent_name`
  - heuristic naming
- scores intent and converts it into `hot`, `warm`, or `cool`

Why it matters:
- this file is the canonical translation layer between Bolna payloads and Santaan logic

### Main webhook

- `src/app/api/voice/bolna/webhook/route.ts`

What it does:
- verifies optional webhook secret
- parses the incoming request
- ignores payloads it cannot normalize
- skips non-terminal Bolna statuses
- logs every terminal event into `voice_call_logs`
- only creates CRM/NeoDove work for:
  - `completed`
  - non-voicemail
  - human conversation calls
- skips CRM sync for:
  - `busy`
  - `failed`
  - `no-answer`
  - `canceled`
  - voicemail-completed calls

Why it matters:
- this file is the main ingestion point for voice leads

### Bolna-facing alias route

- `src/app/api/webhooks/bolna/execution/route.ts`

What it does:
- exposes the webhook path Bolna should call
- re-exports the main voice webhook handler

Why it matters:
- this keeps vendor-facing path naming stable without duplicating logic

### Voice Ops admin API

- `src/app/api/admin/voice-ops/route.ts`

What it does:
- loads approved voice docs from `docs/`
- loads live voice settings from the `settings` table
- exposes them to the CRM
- allows only approved editor roles to update operational voice settings
- stamps every save with:
  - `VOICE_AGENT_LAST_UPDATED_BY`
  - `VOICE_AGENT_LAST_UPDATED_AT`

Why it matters:
- this is the governance bridge between repo truth and live ops metadata

### Voice Ops admin UI

- `src/components/admin/VoiceOpsManagement.tsx`
- `src/components/admin/CRM.tsx`

What it does:
- adds a `Voice Ops` tab inside CRM
- shows live rollout metadata
- shows QA and risk notes
- exposes selected settings for editing
- loads repo-backed docs directly into the CRM

Why it matters:
- this makes voice operations maintainable by future teams without asking them to reconstruct context from old messages

### Role-based access helpers

- `src/lib/auth-helper.ts`
- `src/lib/access-control.ts`

What it does:
- separates:
  - admin access
  - leadership access
  - ops access
  - voice-ops editor access

Why it matters:
- governance depends on the right people being able to read and edit the right surfaces

## 6) Data Surfaces

### `voice_call_logs`

Purpose:
- audit trail for normalized voice call events
- source for debugging, duplicate protection, and downstream QA

Typical fields include:
- event key
- provider
- agent name
- from/to numbers
- route
- source campaign
- call status
- caller context
- duration
- summary
- intent score
- processing status

### `contacts`

Purpose:
- unified CRM lead record

Voice calls update or create contacts with:
- phone and WhatsApp details
- lead source
- tags
- lead score
- conversation note
- last contact timestamps
- UTM attribution based on voice route

### `settings`

Purpose:
- hold live operational metadata

Voice-related settings currently include:
- prompt version labels
- Bolna agent IDs
- Bolna agent names
- main and TV numbers
- rollout status
- QA review details
- ops owner
- clinical owner
- risk notes
- change notes
- audit metadata

## 7) Routing Logic

The routing decision for `main` vs `tv` is intentionally layered.

Current order:

1. `telephony_data.to_number`
2. configured agent ID
3. configured agent name
4. fallback naming heuristic

This is important because provider setups can change and number formatting may not remain stable.

### Related env or live config inputs

Number-based:
- `BOLNA_MAIN_NUMBER`
- `BOLNA_TV_NUMBER`
- `VOICE_AI_MAIN_NUMBER`
- `VOICE_AI_TV_NUMBER`

Agent fallback:
- `BOLNA_MAIN_AGENT_ID`
- `BOLNA_TV_AGENT_ID`
- `VOICE_AI_MAIN_AGENT_ID`
- `VOICE_AI_TV_AGENT_ID`
- `BOLNA_MAIN_AGENT_NAME`
- `BOLNA_TV_AGENT_NAME`
- `VOICE_AI_MAIN_AGENT_NAME`
- `VOICE_AI_TV_AGENT_NAME`

### Initial DID assignment selected on April 2, 2026

- `main`: `+918065481598`
- `tv`: `+918065481542`
- `backup/test`: `+918065481541`

This assignment should remain visible in Voice Ops settings so future teams can see the original rollout choice without searching old chats or screenshots.

## 8) Call Processing Rules

### Calls that should create CRM work

- completed
- not voicemail
- normalized successfully

### Calls that should not create CRM work

- queued
- ringing
- in-progress
- initiated
- busy
- failed
- no-answer
- canceled
- balance-low
- completed voicemail calls

These should still be logged when they are terminal, but not treated as real leads.

## 9) Docs In This System

The voice program is intentionally doc-driven.

Important files:
- `VOICE_AGENT_PRODUCT_PHILOSOPHY_2026-04-02.md`
- `VOICE_AGENT_PERSONA_PROTOCOL_2026-04-02.md`
- `VOICE_AGENT_GOVERNANCE_2026-04-02.md`
- `VOICE_AGENT_MASTER_INDEX_2026-04-02.md`
- `BOLNA_MAIN_AGENT_FINAL_PROMPT_BLOCK_2026-04-02.md`
- `BOLNA_TV_AGENT_FINAL_PROMPT_BLOCK_2026-04-02.md`
- `BOLNA_VOICE_AGENT_EXTRACTION_SCHEMA_2026-04-02.md`
- `BOLNA_CONFIGURATION_MAP_2026-04-02.md`
- `VOICE_AGENT_TEST_SCENARIOS_2026-04-02.md`
- `VOICE_AGENT_QA_SCORECARD_2026-04-02.md`
- `VOICE_AGENT_CHANGE_LOG_TEMPLATE_2026-04-02.md`

Recommended reading order for new team members:

1. product philosophy
2. persona protocol
3. governance
4. master index
5. main and TV prompt blocks
6. extraction schema
7. configuration map
8. scenario pack
9. QA scorecard

## 10) How To Operate The System

### Daily / weekly ops

Use the Voice Ops panel to:
- confirm which prompt versions are live
- verify which numbers and agent IDs are mapped
- track rollout stage
- track latest QA review
- record open risks
- keep change notes visible

### Prompt updates

Safe process:

1. update the canonical doc in repo
2. update version label
3. test against scenario pack
4. review for safety, ops, and tone
5. deploy in Bolna
6. update Voice Ops metadata
7. review early calls

### QA rhythm

Recommended operating rhythm:
- review first 10 to 20 calls after each meaningful change
- review random calls monthly
- review all hard-fail calls immediately

## 11) How To Extend The System

### To add a new supported voice doc into the CRM

Update:
- `src/app/api/admin/voice-ops/route.ts`

Add:
- a new entry in `VOICE_OPS_DOC_SPECS`

This allows the CRM to discover and display the latest matching doc file from `docs/`.

### To add a new live metadata field

Update:
- `VOICE_OPS_SETTING_KEYS` in `src/app/api/admin/voice-ops/route.ts`
- `FIELD_SECTIONS` in `src/components/admin/VoiceOpsManagement.tsx`

If it should be editable:
- keep it in the mutable allowlist

If it should be audit-only:
- mark it read-only in the UI

### To add a new route beyond `main` and `tv`

You will need to update:
- `src/lib/voice-ai.ts`
- route inference logic
- prompt docs
- configuration map
- CRM campaign naming
- test scenarios

Do not add a new route only in Bolna UI.

### To support a new telephony provider

Preserve the same system pattern:

1. normalize the provider payload into a stable internal shape
2. keep CRM processing independent of vendor payload quirks
3. keep repo docs as source of truth

This is why `normalizeBolnaPayload` exists.

## 12) How To Debug Problems

### If route attribution is wrong

Check:
- `telephony_data.to_number`
- configured number envs
- configured agent IDs
- configured agent names
- Voice Ops live metadata

### If calls are not creating leads

Check:
- whether the status is terminal
- whether the call was voicemail
- whether payload normalization succeeded
- whether duplicate event key suppression triggered

### If docs do not show in Voice Ops

Check:
- file naming in `docs/`
- prefix list in `VOICE_OPS_DOC_SPECS`
- whether the latest filename matches the expected prefix

### If settings save fails

Check:
- role permissions
- key exists in allowlist
- API response from `/api/admin/voice-ops`

## 13) Required Roles For Sustainable Ownership

At minimum, this system should always have:

- one clinical reviewer
- one ops owner
- one growth or brand reviewer
- one engineering owner

If any one of these disappears, the system becomes harder to maintain responsibly.

## 14) Suggested Team Onboarding For This Stack

When a new engineer or ops manager inherits this system:

1. read philosophy and governance docs first
2. inspect `voice-ai.ts`
3. inspect main webhook route
4. inspect Voice Ops admin route and UI
5. compare live metadata to approved prompt docs
6. review 5 to 10 recent voice logs
7. run scenario-based QA before making any change

## 15) Sustainability Rules

To keep this maintainable over the next year:

- do not store critical logic only in vendor UI
- do not let prompt versions drift from repo docs
- do not merge behavioral changes without QA evidence
- do not optimize conversion at the cost of safety or trust
- do not add hidden routing logic future teams cannot see

## 16) Definition Of A Healthy System

This system is healthy when:

- prompt source of truth is obvious
- live deployment metadata is visible
- teams know who owns what
- call failures are diagnosable
- new contributors can onboard from docs and code
- changing the system feels disciplined rather than fragile
