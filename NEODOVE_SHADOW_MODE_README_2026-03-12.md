# NeoDove Shadow Mode

Date: March 12, 2026  
Branch: `codex/crm2-cloudflare-content-engine`

## Purpose

NeoDove Shadow Mode captures NeoDove webhook traffic in parallel without changing the current CRM attribution model.

This gives Santaan a safe transition path:

- keep the current CRM working
- capture raw NeoDove events
- map NeoDove campaigns to source buckets and UTM campaigns
- measure mapping coverage before promoting NeoDove to primary lead-attribution truth

## What was added

### Database

- `neodove_campaign_mappings`
- `neodove_event_logs`

Migration script:

```bash
npm run migrate:neodove-shadow
```

### API

- `GET /api/admin/neodove-shadow`
  - returns:
    - summary
    - campaign coverage
    - active mappings
    - recent event log

- `POST /api/admin/neodove-shadow`
  - upserts a NeoDove campaign mapping

### CRM UI

New admin tab:

- `NeoDove Shadow`

Accessible to:

- admin
- ceo
- crm_ops_admin
- agency_ops
- marketing_manager
- performance_marketer
- ivr_manager
- telecaller_manager

### Webhook behavior

Existing endpoint:

- `/api/neodove/webhook`

Now does two things:

1. continues current contact update behavior
2. additionally logs raw events into shadow-mode tables

This means the live CRM remains stable while NeoDove mapping quality improves.

## How to use

1. Let NeoDove webhook traffic accumulate.
2. Open `NeoDove Shadow` in the CRM.
3. Review:
   - unmapped campaigns
   - mapped vs unmapped event counts
   - recent event health
4. Add campaign mappings:
   - NeoDove campaign ID
   - NeoDove campaign name
   - source bucket
   - center
   - UTM campaign
5. Repeat until recent NeoDove traffic is fully mapped.

## Current intent

Shadow mode is for:

- observability
- mapping validation
- attribution readiness
- telecalling queue hygiene

It is **not yet** the primary lead-attribution engine.

## Next phase

Once mapping coverage is stable:

1. derive leads/qualified leads from NeoDove events
2. feed those into campaign analytics
3. reduce manual agency lead entry for mapped call campaigns
4. promote NeoDove to trusted campaign-attribution input

## Files

- `src/db/schema.ts`
- `src/scripts/migrate-neodove-shadow.mjs`
- `src/lib/neodove-shadow.ts`
- `src/app/api/admin/neodove-shadow/route.ts`
- `src/app/api/neodove/webhook/route.ts`
- `src/components/admin/NeoDoveShadowManagement.tsx`
- `src/components/admin/CRM.tsx`
