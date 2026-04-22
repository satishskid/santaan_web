# Santaan Website Improvement Note

Date: 2026-04-18
Owner: Website / Growth / Content alignment
Audience: Content team, marketing team, Raghab, clinic leadership

## What stays as-is

These claims are confirmed as real and should remain on the site:

- `Odisha's only IVF chain`
- `15K+ families`
- `15+ awards`

Action for marketing:

- Keep an internal proof sheet ready for each claim.
- Store source links / screenshots / award references in one shared folder.
- Do not change the wording casually across ads, landing pages, or social posts.

## What content team should do

### 1. Hero rewrite options

Prepare 3 homepage hero options in plain English.

Each option must:

- Speak to first-time fertility visitors, not doctors.
- Be emotionally calm, private, and non-pushy.
- Keep Santaan positioned as evidence-based and compassionate.
- Make WhatsApp the easiest first step.

Do not publish directly.
Submit for review first.

### 2. Plain-language cleanup

Priority sections to simplify:

- Homepage hero
- `Wonder of Life` section
- Treatment pages
- Service landing pages

Editing rule:

- Keep medical accuracy.
- Remove words that a first-time visitor would not understand quickly.
- When a technical term is necessary, add a plain-language line immediately after it.

Examples to simplify:

- `atraumatic transfer`
- `luteal support`
- `ovarian reserve`
- `blastocyst culture`
- `protocol`
- `endometrial`

### 3. Replace synthetic-feeling proof with stronger real proof

Review these existing areas:

- Homepage success-story cards
- Review/testimonial blocks
- Video section

Content team should prepare:

- verified patient quotes cleared for use
- doctor explainer clips that answer one real patient question at a time
- short proof snippets tied to a real center

Preferred proof order:

1. verified review
2. real patient quote
3. doctor explanation
4. generic brand story

### 4. Pricing content tightening

The pricing page already exists.
Do not create a duplicate page.

Content work needed:

- make inclusions/exclusions easier to scan
- reduce jargon in the "what changes cost" section
- create one shorter homepage pricing summary block that links to `/pricing`
- make "written estimate before start" explicit if operationally true

### 5. Odia content workflow

Do not push a live Odia toggle yet.
First complete Odia copy review.

Deliverables from content team:

- approved Odia homepage hero
- approved Odia CTA labels
- approved Odia trust strip
- approved Odia short FAQ set

Only after approval should dev implement public bilingual UI.

## What marketing team should do

### 1. Fix Google Ads conversion setup

Current imported conversion setup is too broad.

After the new site events are live, use these as the main conversion events:

- `phone_call_click`
- `whatsapp_click`
- `book_consultation_click`
- `generate_lead`
- `ads_conversion_other` if you want one combined umbrella lead signal

Mark these as secondary or remove from conversion optimization:

- `page_view`
- `first_visit`
- `user_engagement`

Reason:

- those are traffic/engagement signals, not business outcomes
- using them as conversions will pollute Google Ads bidding and reporting

### 2. GTM / tag governance

Primary container in use:

- `GTM-P45XTFCS`

Marketing should maintain all non-code tracking rules in GTM where possible.

Track inside GTM:

- Google Ads remarketing
- GA4 event mapping
- additional marketing pixels
- Clarity / heatmap tools if required

### 3. Conversion taxonomy

Use this simple interpretation:

- `phone_call_click` = high-intent lead
- `whatsapp_click` = high-intent private lead
- `book_consultation_click` = strongest website booking intent
- `generate_lead` = all lead-intent umbrella event
- `calculate` = diagnostic/engagement event, not primary revenue conversion

### 4. Verification after deployment

Marketing QA checklist:

1. Open homepage
2. Check GTM container loads
3. Click phone CTA
4. Click WhatsApp CTA
5. Click booking CTA
6. Confirm events appear in GTM Preview / GA4 DebugView
7. Confirm imported conversions appear correctly in Google Ads

## Approval order

1. Odia copy review
2. Hero / CTA content approval
3. Google Ads conversion cleanup
4. Real-proof content replacement
5. Public copy rollout
