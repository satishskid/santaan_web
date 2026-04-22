# Homepage Note for Marketing Manager

Date: 2026-04-18
Scope: Homepage tracking and conversion setup
Status: Site-side tracking updated. Ad-platform cleanup still needed in GA4 / Google Ads.

## What changed on the website

The homepage and CTA tracking now favor lead-intent actions instead of broad engagement.

Primary tracked lead events now include:

- `whatsapp_click`
- `book_consultation_click`
- `phone_call_click`
- `generate_lead`
- `ads_conversion_other`

These events are emitted from homepage CTA interactions and routed through the current GTM setup.

Primary container:

- `GTM-P45XTFCS`

## What you should change in Google Ads / GA4

The current imported conversion setup is too noisy.

Do not use these as primary conversion goals for bidding:

- `page_view`
- `first_visit`
- `user_engagement`

These are engagement signals, not actual lead signals.

## Recommended primary conversion setup

Use these as primary where possible:

1. `generate_lead`
2. `whatsapp_click`
3. `book_consultation_click`
4. `phone_call_click`

Use `ads_conversion_other` only if you need one umbrella import for legacy reporting.

## Why this matters

If Google Ads optimizes around page views or engagement, it will learn to buy cheap traffic rather than fertility leads.

The homepage is now structured to push visitors toward:

- private WhatsApp conversation
- consultation booking
- direct call intent

Your conversion setup should match that.

## Immediate QA checklist

1. Open GTM Preview on the homepage.
2. Click the WhatsApp CTA in hero.
3. Click the consultation CTA in hero.
4. Click the sticky WhatsApp, book, and call CTAs on mobile width.
5. Confirm the new events appear in Preview and GA4 DebugView.
6. Re-import only the right GA4 events into Google Ads.
7. Mark broad engagement events as secondary or remove them from bidding.

## Reporting suggestion

Track these separately in weekly reporting:

- WhatsApp leads
- consultation clicks
- phone clicks
- total lead-intent events

This will give a much cleaner read on homepage performance than session metrics alone.

## Odia note

Odia is on hold for now.
Do not start a separate bilingual campaign or conversion split yet.
Wait until the content review is approved and the live UI is updated.
