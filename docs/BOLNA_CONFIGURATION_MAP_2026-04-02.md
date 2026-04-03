# Bolna Configuration Map

Date: April 2, 2026 (IST)
Purpose: Line-by-line setup map for Santaan's Bolna inbound voice agents
Applies to:
- `Santaan Main Inbound`
- `Santaan TV Inbound`

## 0) Selected Initial DID Mapping

Chosen on April 2, 2026 (IST) for the first Santaan rollout:

- `Main inbound`: `+918065481598`
- `TV inbound`: `+918065481542`
- `Backup / sandbox`: `+918065481541`

Recommended use:
- link `+918065481598` to `Santaan Main Inbound`
- link `+918065481542` to `Santaan TV Inbound`
- keep `+918065481541` unassigned or reserved for:
  - sandbox tests
  - fallback routing
  - future campaign experiments

Current operational note:
- screenshot state on April 2, 2026 showed `Link Not linked`
- live Bolna API verification on April 3, 2026 confirmed both production mappings are now active
- verified live mapping:
  - `+918065481598` -> `Santaan Main Inbound` (`5a4ada1f-b861-481a-9b84-e8521e1a24bc`)
  - `+918065481542` -> `Santaan TV Inbound` (`0a5bad62-43dd-4cb0-9aae-24068c1cbea7`)
  - both agents are using webhook `https://api.santaan.ai/api/webhooks/bolna/execution`

## 1) Agent Structure

Create two separate inbound agents in Bolna:

1. `Santaan Main Inbound`
2. `Santaan TV Inbound`

Recommended reason:
- one public journey for active inbound help-seekers
- one softer journey for TV/offline awareness traffic
- easier reporting
- cleaner fallback routing using `agent_id` and `agent_name`

## 2) Public Identity

Use the same assistant identity for both agents:

- Assistant name: `Swara`
- Brand name: `Santaan`
- Spoken intro identity: `your AI assistant from Santaan`

Do not present the agent as:
- doctor
- counselor
- executive
- fertility specialist

## 3) Agent Names To Use In Bolna

Use these exact names if possible:

- `Santaan Main Inbound`
- `Santaan TV Inbound`

Verified Bolna agent IDs:

- `Santaan Main Inbound` -> `5a4ada1f-b861-481a-9b84-e8521e1a24bc`
- `Santaan TV Inbound` -> `0a5bad62-43dd-4cb0-9aae-24068c1cbea7`

Why:
- our webhook already supports agent-name-based fallback routing
- these names are simple and operationally readable

## 4) System Prompt Placement

### For `Santaan Main Inbound`

Use:
- [BOLNA_MAIN_AGENT_FINAL_PROMPT_BLOCK_2026-04-02.md](/Users/spr/santaan%20hope/santaan-web/docs/BOLNA_MAIN_AGENT_FINAL_PROMPT_BLOCK_2026-04-02.md)

### For `Santaan TV Inbound`

Use:
- [BOLNA_TV_AGENT_FINAL_PROMPT_BLOCK_2026-04-02.md](/Users/spr/santaan%20hope/santaan-web/docs/BOLNA_TV_AGENT_FINAL_PROMPT_BLOCK_2026-04-02.md)

If Bolna separates:
- system prompt
- greeting prompt
- behavior prompt

Then split as:

1. identity and safety rules -> system prompt
2. first greeting -> opening message
3. approved response patterns -> guidance/behavior block

## 5) Greeting Setup

### Main agent greeting

```text
Namaskar. Mu Santaan ru Swara kahuchi, your AI assistant. I can help with first-step fertility guidance and connect you to the right Santaan team member. May I understand how I can help today?
```

### TV agent greeting

```text
Namaskar. Mu Santaan ru Swara kahuchi, your AI assistant. Thank you for calling Santaan. I can help with first-step fertility guidance and connect you to our team. Please tell me how I can help you today.
```

## 6) Extraction Variables To Configure

Use these variable names exactly.

### Core extraction fields

```json
{
  "caller_name": "string",
  "caller_type": "self|husband|wife|family|other",
  "city": "string",
  "preferred_centre": "string",
  "trying_duration": "string",
  "known_condition": "string",
  "prior_treatment": "string",
  "callback_requested": "boolean",
  "callback_window": "string",
  "whatsapp_confirmed": "yes|no|unknown",
  "user_interested": "boolean",
  "human_handoff_needed": "boolean",
  "urgency_flag": "string",
  "concern_summary": "string"
}
```

### Recommended normalized values

`trying_duration`
- `less_than_6_months`
- `6_to_12_months`
- `1_to_2_years`
- `more_than_2_years`
- `unknown`

`known_condition`
- `pcos`
- `thyroid`
- `low_amh`
- `blocked_tubes`
- `male_factor`
- `unexplained`
- `none`
- `other`
- `unknown`

`prior_treatment`
- `yes`
- `no`
- `unknown`

`callback_window`
- `morning`
- `afternoon`
- `evening`
- `anytime`
- `unknown`

`urgency_flag`
- `none`
- `medical_urgent`
- `emotional_distress`
- `report_review_needed`
- `pricing_request`

## 7) Extraction Guidance To Put Into Bolna

If Bolna lets you write extraction instructions, use this:

```text
Extract only what the caller explicitly says or clearly implies. Do not guess medical conditions. If unsure, use unknown. If a field was not discussed, leave it blank. Normalize values to the allowed enum where possible. Never infer diagnosis from symptoms alone.
```

## 8) Post-Call Summary Instructions

If Bolna supports a post-call summary field, use this instruction:

```text
Write a short, professional summary in 1 to 3 sentences. Include the main fertility concern, trying duration if mentioned, any prior doctor-mentioned issue, city, and the requested next step. Do not include diagnosis claims, cost estimates, or success promises.
```

### Example good summary

```text
Caller from Berhampur has been trying to conceive for around 2 years. Prior doctor mentioned PCOS. Caller wants evening callback and is open to WhatsApp follow-up.
```

## 9) Callback Routing Tags

If Bolna supports tags, labels, or custom metadata, use:

### Common tags

- `voice_ai`
- `santaan`
- `fertility_intake`

### Main agent tags

- `voice_main`
- `main_inbound`

### TV agent tags

- `voice_tv`
- `tv_inbound`

### Intent or urgency tags

- `callback_requested`
- `human_handoff_needed`
- `pricing_request`
- `report_review_needed`
- `medical_urgent`
- `emotional_distress`

## 10) Agent-Level Metadata To Save

If Bolna supports context or metadata defaults, set:

### Main agent metadata

```json
{
  "agent_route": "main",
  "source_campaign_default": "NEW_LEADS_IVF_MAIN",
  "source_type": "voice_ai_main"
}
```

### TV agent metadata

```json
{
  "agent_route": "tv",
  "source_campaign_default": "NEW_LEADS_TV",
  "source_type": "voice_ai_tv"
}
```

## 11) Webhook URL To Configure

Recommended Bolna webhook URL:

```text
https://api.santaan.ai/api/webhooks/bolna/execution
```

This path is already wired in the repo via:
- [route.ts](/Users/spr/santaan%20hope/santaan-web/src/app/api/webhooks/bolna/execution/route.ts)

## 12) Mapping To Current Santaan Webhook

These Bolna fields are already expected by our backend:

- `id`
- `agent_id`
- `status`
- `answered_by_voice_mail`
- `transcript`
- `created_at`
- `updated_at`
- `conversation_time`
- `telephony_data.to_number`
- `telephony_data.from_number`
- `telephony_data.recording_url`
- `extracted_data.*`
- `context_details.agent_name`

## 13) Environment Variables To Set When Ready

### Number-based routing

- `BOLNA_MAIN_NUMBER`
- `BOLNA_TV_NUMBER`

### Agent-based fallback routing

- `BOLNA_MAIN_AGENT_ID`
- `BOLNA_TV_AGENT_ID`

Optional if IDs are not convenient:

- `BOLNA_MAIN_AGENT_NAME=Santaan Main Inbound`
- `BOLNA_TV_AGENT_NAME=Santaan TV Inbound`

### Campaign mapping

- `VOICE_AI_MAIN_CAMPAIGN=NEW_LEADS_IVF_MAIN`
- `VOICE_AI_TV_CAMPAIGN=NEW_LEADS_TV`

## 14) Recommended Setup Order

1. Create `Santaan Main Inbound`
2. Paste main prompt block
3. Configure greeting
4. Configure extraction variables
5. Configure post-call summary instruction
6. Create `Santaan TV Inbound`
7. Paste TV prompt block
8. Configure TV greeting
9. Configure same extraction variables
10. Set webhook URL for both agents
11. Test with the scenario pack

## 15) Pre-Go-Live Checklist

- AI identity disclosure is present
- cost questions do not return numbers
- success-rate questions do not return percentages
- male-factor questions are handled respectfully
- urgent symptom calls escalate
- callback fields extract properly
- city extraction works
- WhatsApp consent extraction works
- main and tv route separately

## 16) Best Matching Supporting Docs

Use with:
- [BOLNA_MAIN_AGENT_FINAL_PROMPT_BLOCK_2026-04-02.md](/Users/spr/santaan%20hope/santaan-web/docs/BOLNA_MAIN_AGENT_FINAL_PROMPT_BLOCK_2026-04-02.md)
- [BOLNA_TV_AGENT_FINAL_PROMPT_BLOCK_2026-04-02.md](/Users/spr/santaan%20hope/santaan-web/docs/BOLNA_TV_AGENT_FINAL_PROMPT_BLOCK_2026-04-02.md)
- [BOLNA_VOICE_AGENT_EXTRACTION_SCHEMA_2026-04-02.md](/Users/spr/santaan%20hope/santaan-web/docs/BOLNA_VOICE_AGENT_EXTRACTION_SCHEMA_2026-04-02.md)
- [VOICE_AGENT_TEST_SCENARIOS_2026-04-02.md](/Users/spr/santaan%20hope/santaan-web/docs/VOICE_AGENT_TEST_SCENARIOS_2026-04-02.md)
- [VOICE_AGENT_QA_SCORECARD_2026-04-02.md](/Users/spr/santaan%20hope/santaan-web/docs/VOICE_AGENT_QA_SCORECARD_2026-04-02.md)
