# NeoDove Shadow Team Quick Guide

Date: March 12, 2026

## Purpose

NeoDove Shadow is now live in Santaan CRM.

Its job is to help Santaan move from guessed call-campaign reporting to real mapped call attribution.

Core rule:

- Mapping first
- Shadow counts second
- Manual guessing never

---

## For Agency Team

### Daily flow

1. Open Santaan CRM
2. Go to `NeoDove Shadow`
3. Review `Immediate action queue`
4. Identify unmapped NeoDove campaigns
5. For each live NeoDove campaign, create a mapping with:
   - `NeoDove Campaign ID`
   - `NeoDove Campaign Name`
   - `Source Bucket`
   - `Center`
   - `UTM Campaign`
   - `Owner`
   - optional notes
6. Click `Save Mapping`
7. Confirm the campaign now appears as mapped in `Campaign coverage`
8. Then go to `Ops Inputs` -> `Agency Daily Performance Input`
9. Fill the campaign row as usual
10. If a `NeoDove shadow match for current row` appears, click `Use NeoDove Shadow Counts`
11. Save the agency row

### Important rule

If no shadow match exists:

- do not guess exact campaign-wise call leads
- first fix the mapping in `NeoDove Shadow`

### What a correct mapping does

It connects:

- NeoDove campaign
- source bucket
- center
- UTM campaign

This is what allows Santaan CRM to derive real call-lead signals from NeoDove events.

---

## For Telecalling Team

NeoDove updates are now more important than before because Santaan CRM is reading NeoDove events in shadow mode.

For every touched lead, update:

- stage/status
- disposition
- next follow-up
- qualified/lost outcome
- qualified handoff note if qualified
- lost reason if lost

### Telecaller discipline rule

If the NeoDove record is incomplete, the CRM attribution will also be incomplete.

That means:

- no skipping stage updates
- no lost lead without a reason
- no qualified lead without a handoff note
- no stale lead without next action

---

## For Telecalling Lead / IVR Lead

Check twice daily:

- Are new paid leads being routed to the right NeoDove campaign?
- Are there unmapped campaigns still appearing in `NeoDove Shadow`?
- Are telecallers updating dispositions properly?
- Are qualified leads being handed off cleanly?

Escalate the same day if:

- a live campaign is not mapped
- a shared number is breaking attribution
- telecallers are skipping lost reasons or handoff notes

---

## Operational Rule for Santaan

Campaign-wise call lead numbers should only be trusted when:

1. the NeoDove campaign is mapped
2. the UTM campaign is mapped
3. the center is mapped
4. the NeoDove event flow is active

Until then:

- spend, impressions, clicks can be reported
- exact campaign-wise call leads must not be guessed

---

## One-Line Reminder

If a call campaign is not mapped in `NeoDove Shadow`, it is not yet ready for exact campaign-level lead reporting.
