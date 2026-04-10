# Azure Speech Fallback Spike

Date: April 5, 2026 (IST)
Owner: Santaan voice ops / engineering
Status: Spike ready to execute

## Purpose

This spike evaluates Azure Speech as the fallback Odia speech layer for Santaan while Edesy clarifies:

- dedicated inbound number allocation
- turns and transcript visibility
- direct inbound routing behavior

This is a speech-layer spike first, not a full telephony migration.

## Why Azure

Azure Speech has official Odia support today:

- Locale: `or-IN`
- Odia TTS voices:
  - `or-IN-SubhasiniNeural` (Female)
  - `or-IN-SukantNeural` (Male)
- Odia STT support is listed in Azure Speech language support
- Azure also lists custom speech support for Odia using audio + human-labeled transcript

Official sources:

- Language and voice support:
  - https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=speaker-recognition
- Speech service overview:
  - https://learn.microsoft.com/en-us/azure/ai-services/speech-service/
- GPT realtime audio in Azure OpenAI:
  - https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/realtime-audio
- Call Automation overview:
  - https://learn.microsoft.com/en-us/azure/communication-services/concepts/call-automation/call-automation
- Recognize action:
  - https://learn.microsoft.com/en-us/azure/communication-services/concepts/call-automation/recognize-ai-action

## Important Azure limitations for Odia

Azure is good enough to test seriously, but not perfect.

- Odia TTS voices exist, but they do not expose the richest pronunciation-control surface.
- In the Azure support table, `or-IN` is marked with limited advanced voice features compared with top-tier English voices.
- This means we should expect workable Odia speech, not maximum style richness.

For Santaan, that is acceptable for a fallback because warmth, clarity, and turn-taking matter more than expressive theatrical style.

## Santaan recommendation

Do not start with a full Azure telephony migration.

Start with this fallback architecture:

1. Existing telephony provider or existing call ingress
2. Santaan middleware
3. Azure Speech STT
4. Santaan dialogue logic / LLM
5. Azure Speech TTS
6. Existing Santaan CRM pipeline:
   - `voice_call_logs`
   - `contacts`
   - NeoDove push
   - WhatsApp follow-up

Why:

- Santaan already has provider normalization and CRM ingestion in place
- this isolates the spike to speech quality and transcript quality
- it avoids mixing speech validation with carrier migration risk

## Repo touchpoints

Current voice-provider integration points:

- `src/lib/voice-ai.ts`
- `src/app/api/voice/bolna/webhook/route.ts`
- `src/app/api/voice/edesy/webhook/route.ts`
- `src/db/schema.ts`
- `src/lib/neodove.ts`
- `src/services/whatsapp.ts`

The current provider enum is still `bolna | edesy`. Do not widen provider support yet. First prove Azure Speech quality outside the production ingestion path.

## Spike questions

The spike must answer these questions:

1. Does Azure TTS sound natural enough in Odia for Swara?
2. Does Azure STT transcribe real phone-quality Odia accurately enough?
3. Can we tune pause and interruption behavior better than the current vendor path?
4. Can we preserve the existing Santaan CRM flow with minimal downstream change?

## Spike scope

### Track A: Odia TTS quality

Test both Azure Odia voices:

- `or-IN-SubhasiniNeural`
- `or-IN-SukantNeural`

Use these text sets:

1. Greeting
2. Empathy line
3. Callback line
4. IVF boundary line
5. Cost boundary line

Target:

- clear pronunciation
- clinic-appropriate tone
- no obvious robotic cadence
- female voice preferred if `SubhasiniNeural` lands well

### Track B: Odia STT quality

Test with:

- natural Odia
- Odia-English mixed medical speech
- phone-quality recordings
- different speakers if possible

Target:

- stable transcription of fertility-related talk
- useful enough transcript for CRM notes and QA

### Track C: Pause and interruption control

Use scripted test cases:

- long pause
- hesitation like `hmm`
- caller interrupting the bot
- bot speaking too early after a thought pause

Target:

- prove Azure-based stack can be tuned more conservatively than current vendor behavior

### Track D: CRM compatibility

Do not fully wire Azure into production yet.

Instead, capture trial outputs in a compatible internal format and confirm we can map them to:

- `callerName`
- `fromNumber`
- `summary`
- `transcript`
- `callbackWindow`
- `knownCondition`
- `tryingDuration`
- `priorTreatment`

## Success criteria

The spike passes if:

1. One Azure Odia voice is clearly usable for patient-facing calls
2. Azure STT produces transcripts that are operationally useful
3. pause handling can be tuned to outperform current eager-response behavior
4. engineering effort looks moderate, not a full rebuild

The spike fails if:

1. Odia TTS sounds clearly robotic or unnatural
2. STT quality on phone-like audio is too weak
3. tuning still does not solve pause/interruption pain
4. telephony integration complexity dominates the value

## Recommended command-line probe

Use the helper script:

- `npm run voice:azure:speech -- voices`
- `npm run voice:azure:speech -- tts --voice or-IN-SubhasiniNeural`
- `npm run voice:azure:speech -- tts --voice or-IN-SukantNeural`

The script:

- lists Azure voices
- filters Odia voices
- synthesizes a local audio sample for comparison

## Proposed evaluation text

Use these exact samples for TTS comparison:

### Greeting

`ନମସ୍କାର, ମୁଁ ସନ୍ତାନ Fertility Centre ରୁ ସ୍ୱର କହୁଛି. କହନ୍ତୁ, ଆପଣଙ୍କୁ କେମିତି help କରିପାରିବି?`

### Empathy

`ମୁଁ ବୁଝିପାରୁଛି, ଏହା ଆପଣଙ୍କ ପାଇଁ stressful ହୋଇପାରେ. ଚିନ୍ତା କରିବେ ନାହିଁ, ଆମ team ଆପଣଙ୍କୁ properly guide କରିଦେବେ.`

### Callback

`ଆପଣ ଚାହିଁଲେ ଆମ Santaan team ଆପଣଙ୍କୁ callback କରିପାରିବେ. କେଉଁ ସମୟରେ callback ହେଲେ ଆପଣଙ୍କ ପାଇଁ convenient ହେବ?`

### IVF boundary

`IVF ଲାଗିବ କି ନାହିଁ, ସେଥି proper evaluation ପରେ clear ହେବ. ସବୁ case ରେ ଏକେ treatment ଲାଗେ ନାହିଁ.`

### Cost boundary

`Exact cost case-to-case ଭିନ୍ନ ହୁଏ. ଆମ Santaan team ଆପଣଙ୍କୁ proper details share କରିଦେବେ.`

## Engineering notes

- keep the existing provider enum unchanged until the spike proves value
- do not patch production webhook routes for Azure yet
- do not couple the spike to ACS telephony immediately
- keep outputs comparable with `NormalizedVoicePayload`

## Suggested execution order

1. obtain Azure Speech key and region
2. run voice list probe
3. synthesize both Odia voices
4. have 2 to 3 internal listeners compare outputs
5. run STT samples on real Odia audio
6. document findings
7. decide whether to expand into middleware integration

## Initial recommendation

If Azure passes TTS and STT quality:

- continue with Edesy as near-term primary until they resolve inbound and transcripts
- prepare Azure Speech as a controlled fallback path
- only later evaluate Azure telephony or ACS audio streaming if vendor risk remains high
