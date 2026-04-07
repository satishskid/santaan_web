# Handover: Edesy + BhashSMS Waiting State

Date: 2026-04-07
Branch: `codex/voice-ops-baseline`
Latest Edesy workflow commit: `8049cdd feat: extend Edesy voice ops workflow`

## Current Status

The Santaan side is prepared for the Edesy voice workflow up to the current vendor blockers.

What is already completed in code:

- Edesy webhook ingestion is live in the repo
- Multi-event Edesy support is implemented
- Event-specific dedupe is implemented with event-key separation
- Enrichment flow is implemented for `call.analyzed` and `call.recording_ready`
- `call.voicemail_detected` handling is implemented
- Contact and CRM write path is implemented
- NeoDove push path is implemented
- WhatsApp post-call path is implemented
- Edesy fields are exposed in Voice Ops admin
- Edesy environment visibility is added to integration health checks
- Swara QA and handover docs are exposed in the Voice Ops docs feed

## Current External Blockers

### 1. Edesy blocker

We are waiting for Edesy to provide:

- the real VoBiz inbound Answer URL
- confirmation of final query params required for inbound routing
- confirmation of event sequencing for `call.ended`, `call.analyzed`, and `call.recording_ready`
- confirmation or sample payloads for transcript / turns / recording fields

Important:

- Do not treat the placeholder `voice-api.example.com` URL as valid
- Direct inbound VoBiz validation is not complete until a real inbound test succeeds end to end

### 2. BhashSMS blocker

We are waiting for BhashSMS / support confirmation of the exact WhatsApp template identifier and final template readiness for the voice post-call flow.

Relevant env/config already used by the code:

- `BHASH_VOICE_POST_CALL_TEMPLATE`
- `BHASH_VOICE_POST_CALL_PARAM_ORDER`
- `BHASH_VOICE_POST_CALL_ATTACHMENT_TYPE`
- `BHASH_VOICE_POST_CALL_ATTACHMENT_URL`
- `BHASH_VOICE_POST_CALL_ATTACHMENT_NAME`

## Relevant Files

### Edesy webhook flow
- `src/lib/voice-ai.ts`
- `src/app/api/voice/edesy/webhook/route.ts`
- `src/app/api/webhooks/edesy/execution/route.ts`

### Downstream integrations
- `src/lib/neodove.ts`
- `src/services/whatsapp.ts`

### Admin / ops visibility
- `src/app/api/admin/voice-ops/route.ts`
- `src/components/admin/VoiceOpsManagement.tsx`
- `src/scripts/check-integrations.mjs`
- `src/scripts/seed-voice-ops-settings.mjs`

## What To Do When Edesy Replies

### If Edesy sends the real VoBiz Answer URL

1. Verify the URL is not the placeholder host
2. Verify whether it must include:
   - `workspace_id=cmnimmbcg00q1md1u3kuie6ir`
   - `agent_id=5614`
3. Configure that exact URL in VoBiz
4. Ensure the intended phone number is attached to the correct VoBiz application
5. Place one real inbound test call
6. Confirm the call is answered by Swara and is interactive
7. Confirm webhook delivery to:
   - `https://santaan-voice-staging2.vercel.app/api/webhooks/edesy/execution`
8. Confirm DB results:
   - `voice_call_logs` row created
   - `contacts` row created or updated
9. Confirm downstream results:
   - NeoDove push is correct or explicitly skipped for correct reason
   - WhatsApp status is correct or explicitly skipped for correct reason
10. If enrichment events arrive, confirm:
   - existing call log is enriched
   - no duplicate CRM push is triggered

### If Edesy sends sample payloads

Check these fields against the actual JSON:

- `event`
- `call_id`
- `from` / `to`
- `agent_id`
- `agent_name`
- `transcript`
- `turns`
- `summary`
- `recording_url`
- `transcript_url`
- `status` / `disposition`
- voicemail markers
- transfer markers

Then compare against:
- `normalizeEdesyPayload()` in `src/lib/voice-ai.ts`

Only patch the normalizer if the real payload proves a mapping mismatch.

## What To Do When BhashSMS Replies

1. Get the exact approved template identifier
2. Set `BHASH_VOICE_POST_CALL_TEMPLATE`
3. Confirm actual parameter order required by BhashSMS
4. If attachment is part of the approved template, set:
   - `BHASH_VOICE_POST_CALL_ATTACHMENT_TYPE`
   - `BHASH_VOICE_POST_CALL_ATTACHMENT_URL`
   - `BHASH_VOICE_POST_CALL_ATTACHMENT_NAME`
5. Trigger one successful post-call path from a real or controlled test call
6. Confirm WhatsApp status in `voice_call_logs`
7. Confirm the message content/template variables render correctly

## Acceptance Checklist Before Go-Live

All items below should be true:

- real VoBiz Answer URL received from Edesy
- inbound VoBiz test call successfully reaches Swara
- terminal webhook received
- `call.analyzed` / `call.recording_ready` behavior verified if vendor sends them
- `voice_call_logs` written correctly
- `contacts` updated correctly
- NeoDove push verified
- BhashSMS template configured and verified
- WhatsApp post-call behavior verified
- transcript / turns behavior understood from real payloads
- no duplicate downstream actions on enrichment events

## Known Open Issues

- Edesy inbound URL still blocked by vendor until real URL is received
- Transcript visibility / `Turns: 0` is still vendor-payload dependent until a real call is inspected
- Repo has a pre-existing unrelated lint issue in `src/components/sections/PractoBookingSection.tsx:49`
- Build still shows the existing `BETTER_AUTH_SECRET` warning when default secret is used locally

## Recommended Next Action Order

1. Wait for Edesy inbound URL and payload clarification
2. Wait for BhashSMS template confirmation
3. Run one real inbound test call
4. Inspect webhook payload + DB records
5. Validate NeoDove
6. Validate WhatsApp
7. Patch only confirmed mapping gaps
8. Re-run build/lint checks on touched files

## Bottom Line

Santaan engineering is ready up to the current vendor dependencies.

The remaining work is mostly operational validation after:
- Edesy provides the real VoBiz inbound Answer URL and payload clarity
- BhashSMS confirms the WhatsApp template details

Once those two inputs arrive, the system should be in a good position to complete final validation quickly.