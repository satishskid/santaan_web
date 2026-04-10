# Swara Operator Manual

Date: 2026-04-10
Audience: Non-technical ops, QA, business, centre coordination teams

## Purpose

This manual explains how to use the Santaan CRM for Swara pilot operations, how to review test calls, and when to update public numbers.

## Current Numbers

- Primary pilot inbound line: `+91 80654 81541`
- Bolna main line: `+91 80654 81598`
- TV line: `+91 80654 81542`
- Internal fallback / capture line:
  `+91 22 7126 4263`

Important:

- Use `+91 80654 81541` for the current Swara inbound pilot.
- Do not publish the internal fallback line on the website unless leadership approves it as a permanent operating number.

## Where To Operate

Use the Santaan CRM:

- Admin -> Voice Ops

Inside that page, use the `Voice QA cockpit`.

## What The Voice QA Cockpit Shows

- current live routing
- latest call time
- recent voice calls
- transcript status
- CRM linkage
- NeoDove status
- WhatsApp status

## How To Run A Pilot Test

1. Call `+91 80654 81541` from a real mobile.
2. Speak naturally like a patient.
3. Let Swara respond.
4. Test one short pause.
5. Test one interruption if possible.
6. End the call.
7. Open Santaan CRM -> Voice Ops.
8. Review the latest call row.

## What To Check After Each Call

### Caller experience

- Did Swara answer?
- Did she mention Swara and Santaan clearly?
- Did she sound warm and respectful?
- Did she avoid long unnecessary conversation?
- Did she ask useful questions?
- Did she guide the caller toward callback / next step?

### CRM experience

- Did the call appear in the latest calls table?
- Was the caller linked or created properly?
- Is transcript artifact available?
- Is summary available?
- Did NeoDove status move correctly?
- Did WhatsApp status move correctly?

## When To Use Fallback

Use the fallback capture path when:

- Swara is not answering
- Swara is speaking incorrectly
- transcript / routing is breaking repeatedly
- a live pilot hour should not lose leads

Fallback means:

- caller should still complete a normal inquiry call
- caller should still be registered in Santaan CRM
- the lead should still be reachable for human callback

Fallback does **not** mean Azure.
Azure is still only a research track.

## Rule For Website Number Update

Do not update the website after only one successful call.

Update public numbers only after:

1. at least `10-20` pilot calls are reviewed
2. greeting quality is acceptable
3. CRM capture is stable
4. the business team is comfortable with lead quality

## Public Places To Update After Pilot Approval

- website header / footer phone number
- contact page
- treatment pages with call CTA
- landing pages
- Google Business listing
- Meta / Google ad extensions
- WhatsApp profile or campaign material
- printed or internal scripts used by centre staff

## Daily Operating Rhythm

### Morning

- confirm number routing is unchanged
- confirm latest call logs are visible
- confirm no major CRM sync issue is open

### During pilot

- review the latest few calls
- note any recurring failure pattern
- escalate quickly if Swara is over-talking or misrouting

### Evening

- log what worked
- log what failed
- note whether prompt tuning is needed

## Escalation

Escalate to voice ops / dev if:

- wrong greeting or wrong persona
- repeated missing transcripts
- no CRM row appears
- lead details are not usable for callback
- Swara keeps going into long conversations instead of qualification
