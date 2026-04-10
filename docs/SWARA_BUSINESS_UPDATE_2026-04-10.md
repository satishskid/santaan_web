# Swara Business Update

Date: 2026-04-10
Owner: Santaan Voice Ops
Status: Pilot live

## Executive Summary

Swara is now live inside the Santaan CRM and on the production site stack.
The CRM includes a non-technical `Voice QA cockpit` so operations users can review routing, recent calls, transcript availability, and downstream CRM health without depending on vendor dashboards.

The current pilot path is:

- Primary direct inbound pilot line: `+91 80654 81541`
- Agent: `Swara - Santaan Odia`
- Provider path: `VoBiz -> Edesy -> Santaan CRM`

The current operational fallback is **not Azure**.
If voice QA is failing, fallback should remain a normal call path that still captures the caller and registers the lead in Santaan CRM.

Azure Speech remains a research track only.

## What Is Working

- Swara is live in the CRM operating view.
- The production CRM now shows live routing, latest call rows, and downstream statuses.
- Direct inbound pilot routing has been configured for the Odia agent.
- Team QA can now be managed from the CRM side, not only from vendor tools.

## What Still Needs Close Monitoring

- turn-taking and pause handling
- transcript / turns reliability from vendor side
- keeping Swara focused on short, useful lead capture instead of long conversations

## Business Decision Right Now

For this stage, Swara should be treated as a **lead capture and trust-building front desk**, not a long-form counseling bot.

Success means:

- caller feels heard
- caller gives core qualification details
- caller can be called back by the right Santaan team
- CRM receives enough useful data to improve conversion

## Go-Live Recommendation

Do **not** update all public-facing numbers immediately.
Use a controlled release gate:

### Phase 1: Pilot validation

- Run the first `10-20` real pilot calls
- Confirm:
  - greeting is correct
  - tone is warm
  - Swara does not over-talk
  - transcript / summary are usable enough
  - caller records are landing in CRM

### Phase 2: Limited business rollout

If Phase 1 is stable, then update:

- website call CTA
- contact pages
- Google Business / listings
- ad landing pages
- WhatsApp and campaign collateral where relevant

### Phase 3: Standard operations

Once the team is confident that lead quality and CRM capture are stable:

- treat Swara as the first-contact inbound assistant
- keep human callback and appointment conversion as the primary downstream action

## Rollout Rule

The public number should only be changed after pilot validation is positive.
Internal fallback/testing numbers should not be published externally unless they are approved as real operating lines.
