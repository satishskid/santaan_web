# Handover: Swara / Edesy / CRM

Date: 2026-04-03  
Owner context: Santaan voice AI rollout  
Primary repo: `santaan_web`  
Working branch: `codex/voice-ops-baseline`

## Repo

- Main repo: [https://github.com/satishskid/santaan_web](https://github.com/satishskid/santaan_web)
- Branch to use: [https://github.com/satishskid/santaan_web/tree/codex/voice-ops-baseline](https://github.com/satishskid/santaan_web/tree/codex/voice-ops-baseline)

## Why This Exists

We have set up an Odia voice agent called `Swara - Santaan Odia` in Edesy.
The persona, prompt, and team QA process are already prepared.
The webhook endpoint on Santaan staging is live and healthy.

The remaining goal is to complete the technical integration:

1. verify Edesy to Santaan webhook ingestion
2. verify DB writes
3. verify CRM / contact updates
4. verify NeoDove and WhatsApp follow-on behavior
5. diagnose missing transcript / `Turns: 0`
6. prepare for direct inbound calling once Edesy gives the real VoBiz answer URL

## Current Live Status

### Staging webhook

- `https://santaan-voice-staging2.vercel.app/api/webhooks/edesy/execution`
- current behavior: returns `200 OK`

### Edesy agent

- Agent name: `Swara - Santaan Odia`
- Agent ID: `5614`
- Workspace ID: `cmnimmbcg00q1md1u3kuie6ir`
- Voice: `Leda`
- Provider: `Gemini Live 2.5 HD`
- Response timing: `Conservative`

### Edesy number state

- Trial number visible in Edesy: `+91 22 7126 4263`
- Team members have been invited to Edesy workspace and can use `Test Hub`

### Important blocker

Edesy Phone Numbers UI is showing a fake inbound URL:

`https://voice-api.example.com/api/webhooks/telephony/vobiz/answer?...`

This is a placeholder and must **not** be used in VoBiz.
Until Edesy gives a real answer URL, team testing should stay in Edesy Test Hub and not use direct inbound calling.

## System Picture

This repo already contains the core CRM-side path for voice leads.

Think of the system like this:

`Edesy / Bolna -> Santaan webhook -> voice_call_logs + contacts -> NeoDove / WhatsApp / admin CRM`

This is not only a thin webhook edge. The repo contains:

- lead/contact storage
- voice call log storage
- NeoDove push logic
- WhatsApp follow-up logic
- admin CRM APIs
- admin voice ops view
- webhook ingestion

If there is a second private CRM repo, share it for extra context only if needed. Start from this repo first.

## Key Files

### Edesy webhook ingestion

- [src/app/api/voice/edesy/webhook/route.ts](https://github.com/satishskid/santaan_web/tree/codex/voice-ops-baseline/src/app/api/voice/edesy/webhook/route.ts)
- [src/app/api/webhooks/edesy/execution/route.ts](https://github.com/satishskid/santaan_web/tree/codex/voice-ops-baseline/src/app/api/webhooks/edesy/execution/route.ts)

### Voice payload normalization

- [src/lib/voice-ai.ts](https://github.com/satishskid/santaan_web/tree/codex/voice-ops-baseline/src/lib/voice-ai.ts)

### Outbound Edesy helper

- [src/scripts/trigger-edesy-outbound.mjs](https://github.com/satishskid/santaan_web/tree/codex/voice-ops-baseline/src/scripts/trigger-edesy-outbound.mjs)

### Contact / log schema

- [src/db/schema.ts](https://github.com/satishskid/santaan_web/tree/codex/voice-ops-baseline/src/db/schema.ts)

Important tables:

- `contacts`
- `voice_call_logs`
- `neodove_events`
- `settings`

### NeoDove integration

- [src/lib/neodove.ts](https://github.com/satishskid/santaan_web/tree/codex/voice-ops-baseline/src/lib/neodove.ts)

### WhatsApp integration

- [src/services/whatsapp.ts](https://github.com/satishskid/santaan_web/tree/codex/voice-ops-baseline/src/services/whatsapp.ts)

### Admin CRM and ops

- [src/app/api/admin/contacts/route.ts](https://github.com/satishskid/santaan_web/tree/codex/voice-ops-baseline/src/app/api/admin/contacts/route.ts)
- [src/app/api/admin/contacts/[id]/route.ts](https://github.com/satishskid/santaan_web/tree/codex/voice-ops-baseline/src/app/api/admin/contacts/%5Bid%5D/route.ts)
- [src/app/api/admin/neodove/reconciliation/route.ts](https://github.com/satishskid/santaan_web/tree/codex/voice-ops-baseline/src/app/api/admin/neodove/reconciliation/route.ts)
- [src/components/admin/VoiceOpsManagement.tsx](https://github.com/satishskid/santaan_web/tree/codex/voice-ops-baseline/src/components/admin/VoiceOpsManagement.tsx)
- [src/app/api/admin/voice-ops/route.ts](https://github.com/satishskid/santaan_web/tree/codex/voice-ops-baseline/src/app/api/admin/voice-ops/route.ts)

### Prompt and QA docs

- [docs/EDESY_ODIA_AGENT_PROMPT_BLOCK_2026-04-03.md](https://github.com/satishskid/santaan_web/tree/codex/voice-ops-baseline/docs/EDESY_ODIA_AGENT_PROMPT_BLOCK_2026-04-03.md)
- [docs/SWARA_QA_TEAM_TEST_PACK_2026-04-03.md](https://github.com/satishskid/santaan_web/tree/codex/voice-ops-baseline/docs/SWARA_QA_TEAM_TEST_PACK_2026-04-03.md)
- [docs/SWARA_QA_EVAL_FORM_TABLE_2026-04-03.md](https://github.com/satishskid/santaan_web/tree/codex/voice-ops-baseline/docs/SWARA_QA_EVAL_FORM_TABLE_2026-04-03.md)

## What Is Already Implemented

### Edesy routing in code

The repo now supports Edesy as a first-class voice provider:

- provider type widened to include `edesy`
- payload normalization supports Edesy event shapes
- webhook handler writes to `voice_call_logs`
- contact matching / creation path mirrors Bolna flow
- NeoDove push and optional WhatsApp follow-up are triggered from the Edesy webhook path

### Voice Ops docs

The Edesy Odia prompt block is now included in the Voice Ops docs feed so the approved prompt is visible alongside Bolna assets.

### QA artifacts

Team-facing QA pack and evaluation form have already been created and shared.

## What Needs To Be Done Next

### 1. Verify real Edesy payloads end to end

Use Edesy Test Hub and place a real call.

After call completion, verify:

1. Santaan webhook received the event
2. `voice_call_logs` row was created
3. `contacts` row was created or updated
4. NeoDove push fired, or was skipped for a correct reason
5. WhatsApp follow-up fired, or was skipped for a correct reason

### 2. Confirm mapping quality

Check whether the Edesy payload is being normalized correctly:

- caller name
- phone numbers
- city
- callback window
- transcript
- summary
- entry point
- intent score and bucket

Core function to inspect:

- [normalizeEdesyPayload in `src/lib/voice-ai.ts`](https://github.com/satishskid/santaan_web/tree/codex/voice-ops-baseline/src/lib/voice-ai.ts)

### 3. Diagnose missing transcript / `Turns: 0`

Current behavior in Edesy tests:

- voice quality is good
- identity is fixed
- but Edesy test result still shows `Turns: 0`

Need to determine whether:

1. Edesy is not sending transcript / turns
2. Edesy Test Hub does not expose them even though webhook sends them
3. Santaan normalizer is dropping the fields

### 4. Prepare direct inbound path later

Do not touch VoBiz routing using the placeholder host.

Once Edesy gives the real VoBiz answer URL:

1. configure VoBiz Application `Answer URL`
2. ensure URL includes:
   - `workspace_id=cmnimmbcg00q1md1u3kuie6ir`
   - `agent_id=5614`
3. attach `+91 22 7126 4263`
4. run a real inbound test call

## Suggested Work Order

### Phase 1: Understand the flow

Read in this order:

1. `src/db/schema.ts`
2. `src/lib/neodove.ts`
3. `src/lib/voice-ai.ts`
4. `src/app/api/voice/edesy/webhook/route.ts`
5. `src/services/whatsapp.ts`

### Phase 2: Test the current branch as-is

Run one real Edesy Test Hub call and trace the result through:

- webhook
- DB
- contact update
- NeoDove
- WhatsApp

### Phase 3: Fix only confirmed gaps

If a field mapping or CRM sync step is broken, patch deliberately.
Do not refactor broadly before confirming root cause.

### Phase 4: Document actual vendor payload

Capture the real Edesy webhook JSON if possible and keep a sample for future regression tests.

## Success Criteria

### Technical success

- terminal Edesy webhook reaches Santaan staging
- payload normalizes correctly
- `voice_call_logs` created with useful fields
- `contacts` updated
- NeoDove push behaves correctly
- WhatsApp push behaves correctly
- no duplicate log rows for same event

### Product success

- Swara sounds human
- safe medical boundaries hold
- callback flow works naturally
- interruption and pause handling feels natural
- transcript visibility is fixed, or a clear explanation is documented

## Known Open Issues

1. Edesy inbound answer URL is a placeholder in UI
2. Direct VoBiz inbound routing is blocked until real URL is provided
3. `Turns: 0` / transcript visibility unresolved
4. Build logs still show an existing `BETTER_AUTH_SECRET` warning, though deploy works when envs are set

## Environment Notes

Relevant env keys:

- `EDESY_API_KEY`
- `EDESY_API_BASE`
- `EDESY_AGENT_ID`
- `EDESY_MAIN_NUMBER`
- `EDESY_EXECUTION_WEBHOOK_URL`
- `EDESY_WEBHOOK_SECRET`

Current staging webhook target:

- `https://santaan-voice-staging2.vercel.app/api/webhooks/edesy/execution`

## Important Working Notes

- This branch exists in a dirty worktree with unrelated changes.
- Do not revert unrelated files.
- Start by testing behavior, not merging anything blindly.
- If there is a second private CRM repo, use it only for extra downstream context after you understand this main repo.

## Bottom Line

Treat `santaan_web` as the primary system of record for this task.
The immediate mission is to make Edesy voice events land cleanly in Santaan CRM and validate downstream behavior.
The VoBiz direct inbound path is a second step after Edesy provides a real inbound answer URL.
