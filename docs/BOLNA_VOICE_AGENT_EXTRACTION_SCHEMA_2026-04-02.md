# Bolna Voice Agent Extraction Schema

Date: April 2, 2026 (IST)
Applies to: Santaan voice AI intake for CRM + NeoDove + post-call follow-up
Version: v1

## Purpose

This schema defines exactly what the voice agent should try to capture from a first-contact fertility call.

Principles:
- collect only what is useful
- avoid intrusive questioning
- prefer short natural answers
- do not force collection if the caller is distressed
- callback-safe data is more important than perfect data

## Extraction Priority

Priority 1:
- caller_name
- city
- trying_duration
- callback_requested
- whatsapp_confirmed

Priority 2:
- known_condition
- prior_treatment
- callback_window
- preferred_centre
- caller_type

Priority 3:
- user_interested
- concern_summary
- human_handoff_needed
- urgency_flag

## Canonical Field Set

Use these field names exactly where possible.

```json
{
  "caller_name": "string | null",
  "caller_type": "self | husband | wife | family | other | null",
  "city": "string | null",
  "preferred_centre": "Bhubaneswar | Berhampur | Angul | Bangalore | Teleconsult | null",
  "trying_duration": "less_than_6_months | 6_to_12_months | 1_to_2_years | more_than_2_years | unknown | null",
  "known_condition": "pcos | thyroid | low_amh | blocked_tubes | male_factor | unexplained | none | other | unknown | null",
  "prior_treatment": "yes | no | unknown | null",
  "callback_requested": true,
  "callback_window": "morning | afternoon | evening | anytime | unknown | null",
  "whatsapp_confirmed": "yes | no | unknown | null",
  "user_interested": true,
  "human_handoff_needed": true,
  "urgency_flag": "none | medical_urgent | emotional_distress | report_review_needed | pricing_request | null",
  "concern_summary": "string | null"
}
```

## Field Definitions

### `caller_name`

What it means:
- the name of the person speaking or the patient name if clearly stated

Capture when:
- naturally offered
- asked during intake

Do not force:
- if the caller is guarded or wants callback first

Examples:
- `Sasmita`
- `Rakesh`
- `Mrs. Behera`

### `caller_type`

Allowed values:
- `self`
- `husband`
- `wife`
- `family`
- `other`

Use when:
- the speaker is calling on behalf of someone else

Examples:
- `I am calling for my wife` -> `husband`
- `We are trying` -> `self` if unclear but speaker is patient, else `other`
- `I am her mother` -> `family`

### `city`

What it means:
- caller location or nearest relevant city

Examples:
- `Bhubaneswar`
- `Berhampur`
- `Cuttack`
- `Puri`

If a smaller town is mentioned:
- capture raw city as spoken
- let downstream logic map center

### `preferred_centre`

Allowed values for current operations:
- `Bhubaneswar`
- `Berhampur`
- `Angul`
- `Bangalore`
- `Teleconsult`

Set only if:
- caller explicitly states center preference
- or center can be inferred confidently from city later

### `trying_duration`

Normalize to:
- `less_than_6_months`
- `6_to_12_months`
- `1_to_2_years`
- `more_than_2_years`
- `unknown`

Examples:
- `4 months` -> `less_than_6_months`
- `8 months` -> `6_to_12_months`
- `1 year` -> `1_to_2_years`
- `2 years` -> `more_than_2_years`
- `long time` -> `unknown`

Also keep raw transcript context for later score interpretation.

### `known_condition`

Normalize to the nearest safe bucket:
- `pcos`
- `thyroid`
- `low_amh`
- `blocked_tubes`
- `male_factor`
- `unexplained`
- `none`
- `other`
- `unknown`

Rules:
- only capture conditions already mentioned by caller or attributed to a prior doctor
- never let the AI invent a diagnosis

Examples:
- `Doctor said I have PCOS` -> `pcos`
- `Sperm issue was told before` -> `male_factor`
- `No issue found yet` -> `none`
- `Not sure` -> `unknown`

### `prior_treatment`

Allowed values:
- `yes`
- `no`
- `unknown`

`yes` includes:
- medicines for fertility
- prior IUI
- prior IVF
- evaluation or treatment at another clinic if clearly stated

### `callback_requested`

Allowed values:
- `true`

Set to true when:
- caller wants callback
- caller wants clinic contact
- caller asks to speak later
- caller requests booking help

If no callback intent is stated, this can remain absent in some platforms, but the preferred behavior is to infer `true` when the caller wants next-step contact.

### `callback_window`

Normalize to:
- `morning`
- `afternoon`
- `evening`
- `anytime`
- `unknown`

Examples:
- `Call after 6 pm` -> `evening`
- `Anytime is fine` -> `anytime`
- `Tomorrow morning` -> `morning`

### `whatsapp_confirmed`

Allowed values:
- `yes`
- `no`
- `unknown`

Set `yes` only when:
- caller agrees to WhatsApp follow-up
- caller confirms this number is fine for WhatsApp

### `user_interested`

Allowed values:
- `true`

Set true when caller:
- wants guidance
- asks about tests or treatment
- requests callback
- seeks consultation

Do not set if:
- obvious wrong number
- prank / spam / unrelated call

### `human_handoff_needed`

Allowed values:
- `true`

Set true when:
- caller wants cost details
- caller wants booking
- caller has prior reports
- caller asks plan-specific questions
- emotional reassurance alone is not enough
- urgency exists

In practice, most serious inbound fertility calls should resolve to `true`.

### `urgency_flag`

Allowed values:
- `none`
- `medical_urgent`
- `emotional_distress`
- `report_review_needed`
- `pricing_request`

Examples:
- severe pain / bleeding -> `medical_urgent`
- crying / breakdown / hopelessness -> `emotional_distress`
- wants someone to explain reports -> `report_review_needed`
- insists on package or price details -> `pricing_request`

### `concern_summary`

Short human-readable summary.

Examples:
- `Trying for 2 years, doctor mentioned PCOS, wants callback from Bhubaneswar team`
- `Caller from Berhampur asking whether IVF is needed, no prior treatment, WhatsApp follow-up okay`

Keep it under 160 characters if possible.

## Prompting Guidance For Extraction

Tell Bolna extraction logic:

- extract only what the caller explicitly says or clearly implies
- do not guess medical conditions
- normalize values to the allowed enum when possible
- if unsure, use `unknown`
- if the field was not discussed, leave it null

## Example Good Extraction

Caller says:
`We are from Berhampur. Trying since nearly 2 years. Doctor said PCOS earlier. Please ask your team to call in the evening on WhatsApp.`

Expected extraction:

```json
{
  "city": "Berhampur",
  "trying_duration": "more_than_2_years",
  "known_condition": "pcos",
  "callback_requested": true,
  "callback_window": "evening",
  "whatsapp_confirmed": "yes",
  "user_interested": true,
  "human_handoff_needed": true,
  "concern_summary": "Trying around 2 years, prior PCOS mention, wants evening callback on WhatsApp"
}
```

## Example Bad Extraction

Bad because the AI invents diagnosis:

```json
{
  "known_condition": "blocked_tubes",
  "prior_treatment": "yes"
}
```

If the caller never said this, it must not be extracted.

## Mapping To Current CRM Logic

Current webhook normalization already handles:
- `caller_name`
- `caller_type`
- `city`
- `preferred_centre`
- `trying_duration`
- `known_condition`
- `prior_treatment`
- `callback_window`
- `whatsapp_confirmed`
- `user_interested`
- `callback_requested`

So this schema is designed to fit the current Santaan implementation with minimal remapping.

