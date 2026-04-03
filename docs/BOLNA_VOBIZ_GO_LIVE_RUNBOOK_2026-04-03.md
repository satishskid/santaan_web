# Santaan Bolna + VoBiz Go-Live Runbook

Date: April 3, 2026 (IST)
Purpose: One operator-grade runbook for the last production steps across Santaan code, Bolna, and VoBiz

## Current Intended Mapping

- Main inbound line: `+918065481598`
- TV inbound line: `+918065481542`
- Backup or sandbox line: `+918065481541`
- Main agent name: `Santaan Main Inbound`
- TV agent name: `Santaan TV Inbound`
- Main agent ID: `5a4ada1f-b861-481a-9b84-e8521e1a24bc`
- TV agent ID: `0a5bad62-43dd-4cb0-9aae-24068c1cbea7`
- Execution webhook URL: `https://api.santaan.ai/api/webhooks/bolna/execution`

## Live Verification Status

Verified through the Bolna API on April 3, 2026:

- `+918065481598` is already mapped to `Santaan Main Inbound`
- `+918065481542` is already mapped to `Santaan TV Inbound`
- both mapped numbers are using telephony provider `vobiz`
- both agents already have webhook `https://api.santaan.ai/api/webhooks/bolna/execution`

So no additional Bolna mapping action is required right now unless someone changes the agent assignment later.

## What Is Already Done In Code

- Bolna execution webhook receiver exists at:
  - [route.ts](/Users/spr/santaan%20hope/santaan-web/src/app/api/webhooks/bolna/execution/route.ts)
  - [route.ts](/Users/spr/santaan%20hope/santaan-web/src/app/api/voice/bolna/webhook/route.ts)
- Number and agent-based routing exists in:
  - [voice-ai.ts](/Users/spr/santaan%20hope/santaan-web/src/lib/voice-ai.ts)
- NeoDove push exists in:
  - [neodove.ts](/Users/spr/santaan%20hope/santaan-web/src/lib/neodove.ts)
- Bhash transport exists in:
  - [whatsapp.ts](/Users/spr/santaan%20hope/santaan-web/src/services/whatsapp.ts)
- Voice Ops admin tracking exists in:
  - [VoiceOpsManagement.tsx](/Users/spr/santaan%20hope/santaan-web/src/components/admin/VoiceOpsManagement.tsx)

## What Can Be Automated Now

Bolna exposes public APIs for:

- listing all agents
- listing all phone numbers
- retrieving agent details
- setting inbound mapping with `POST /inbound/setup`

Because of that, Santaan now includes this operator script:

- [setup-bolna-inbound.mjs](/Users/spr/santaan%20hope/santaan-web/src/scripts/setup-bolna-inbound.mjs)

Available commands:

- `npm run voice:bolna:verify`
- `npm run voice:bolna:setup`

Required envs for API-driven Bolna setup:

- `BOLNA_API_KEY`
- `BOLNA_MAIN_NUMBER`
- `BOLNA_TV_NUMBER`
- `BOLNA_MAIN_AGENT_NAME` or `BOLNA_MAIN_AGENT_ID`
- `BOLNA_TV_AGENT_NAME` or `BOLNA_TV_AGENT_ID`
- `BOLNA_EXECUTION_WEBHOOK_URL`

## What Still Cannot Be Reliably Automated From This Repo

VoBiz public docs for the Bolna integration describe dashboard connection flow, but do not expose a documented write API here for:

- purchasing or releasing existing VoBiz DIDs from the Santaan VoBiz account
- linking VoBiz account credentials into Bolna on Santaan’s behalf
- changing wallet balance or subscription state

So the repo can automate Bolna-side validation and inbound assignment, but VoBiz account preparation is still an operator task.

## Junior Dev Checklist

1. Ensure production envs are present:
   - `BOLNA_MAIN_NUMBER=+918065481598`
   - `BOLNA_TV_NUMBER=+918065481542`
   - `BOLNA_MAIN_AGENT_NAME=Santaan Main Inbound`
   - `BOLNA_TV_AGENT_NAME=Santaan TV Inbound`
   - `BOLNA_EXECUTION_WEBHOOK_URL=https://api.santaan.ai/api/webhooks/bolna/execution`
   - preferred:
     - `BOLNA_MAIN_AGENT_ID=5a4ada1f-b861-481a-9b84-e8521e1a24bc`
     - `BOLNA_TV_AGENT_ID=0a5bad62-43dd-4cb0-9aae-24068c1cbea7`
   - if Bolna API is available:
     - `BOLNA_API_KEY=<bolna-api-key>`

2. In VoBiz, confirm:
   - all three numbers are active
   - wallet balance is healthy
   - no number is released
   - provider credentials are the same ones connected in Bolna

3. In Bolna, if API key is available, run:
   - `npm run voice:bolna:verify`
   - if drift exists: `npm run voice:bolna:setup`
   - current known good result should show both mappings as already correct

4. If no API key is available, confirm in the Bolna dashboard:
   - `+918065481598` is assigned to `Santaan Main Inbound`
   - `+918065481542` is assigned to `Santaan TV Inbound`
   - `+918065481541` remains unassigned

5. In Bolna, confirm the execution webhook on both agents is:
   - `https://api.santaan.ai/api/webhooks/bolna/execution`

6. Run two real calls:
   - one to `+918065481598`
   - one to `+918065481542`

7. After each test call, verify:
   - Santaan webhook received the execution payload
   - CRM contact was created or updated
   - `voice_call_logs` row exists
   - `entryPoint` resolved to `main` for `+918065481598`
   - `entryPoint` resolved to `tv` for `+918065481542`
   - NeoDove push succeeded
   - WhatsApp follow-up succeeded if Bhash template envs are configured

## Recommended Validation Commands

- `npm run integrations:check`
- `npm run voice:bolna:verify`
- `npx tsc --noEmit --pretty false`

## Live Risk Notes

- Exact Bhash post-call template identifier still depends on the final approved template name from Bhash support.
- If Bolna agent IDs are saved in env, routing fallback becomes more robust than name-only matching.
- If webhook URL differs between the two agents, call logging may appear inconsistent even when the DID mapping is correct.
