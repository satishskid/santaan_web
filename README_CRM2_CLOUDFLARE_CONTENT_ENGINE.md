# Santaan CRM 2.0 – Cloudflare Content Engine

Last updated: 2026-03-11

## Summary
This branch adds a parallel Cloudflare content-intelligence plane to the existing Vercel CRM without disrupting the current workflows. The CRM remains the command layer, while Cloudflare handles content ingestion, chunking, vector retrieval, and adaptive topic intelligence. All integration points are feature-flagged and can be enabled/disabled via env vars.

## What is live
- Cloudflare Worker: `santaan-content-engine`
  - URL: `https://santaan-content-engine.satish-9f4.workers.dev`
  - Health: `/health`
- R2 buckets:
  - `santaan-content-drafts`
  - `santaan-content-assets`
  - `santaan-content-media`
- Vectorize index:
  - `santaan-content-index`
- Turso + Gemini secrets wired into the worker

## CRM integration
The CRM now pushes content assets and feedback into the Cloudflare engine whenever they are saved/updated, and the Content Intelligence UI shows engine health.

Key integration files:
- `src/lib/cf-content-engine.ts`
- `src/app/api/admin/content-intelligence/route.ts`
- `src/components/admin/ContentIntelligenceManagement.tsx`

## Feature flags / environment variables
These must be set in Vercel for the CRM to enable the bridge:
- `ENABLE_CF_CONTENT_ENGINE=true`
- `CF_CONTENT_ENGINE_URL=https://santaan-content-engine.satish-9f4.workers.dev`
- `CF_CONTENT_ENGINE_TOKEN=<secret>`

Cloudflare worker secrets:
- `CF_CONTENT_ENGINE_TOKEN`
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `GEMINI_API_KEY`

## Cloudflare content engine endpoints (current phase)
- `GET /health`
- `POST /ingest/article` (content asset ingest)
- `POST /ingest/feedback` (content feedback ingest)
- `POST /recommend/internal-links` (stub)
- `POST /recommend/topics` (stub)
- `POST /chat/blog` (stub)

## Backfill
One-time backfill script to ingest existing Santaan content:

```
npm run content:backfill:cloudflare
```

Script file:
- `src/scripts/backfill-cloudflare-content-engine.mjs`

## Migrations
- `npm run migrate:content-intelligence`

This adds:
- `content_assets`
- `content_feedback`

## Validation steps
1. Hit worker health:
   - `curl -sS https://santaan-content-engine.satish-9f4.workers.dev/health`
2. Open CRM -> Content Intelligence and confirm:
   - “Cloudflare content engine: Healthy”
3. Add one content asset and one feedback entry in CRM
4. Re-run backfill if needed

## What this does NOT do yet
- No automatic internal-link generation (endpoint is stub)
- No topic recommendations (endpoint is stub)
- No blog chat (endpoint is stub)
- No AI Gateway configuration in Cloudflare (Gemini key is used directly)

## Next steps (Phase 2)
1. Implement embeddings + vector upsert in the worker
2. Implement `/recommend/internal-links` using Vectorize
3. Implement `/recommend/topics` using feedback + vector signals
4. Add optional `Talk to this blog` chat endpoint with retrieval grounding
5. Add Turso persistence for ingestion metadata

## Deployment notes
- Worker deployed via `npm run cf:content:deploy`
- CRM deployed via `vercel deploy` and `vercel --prod`
- The branch `codex/crm2-cloudflare-content-engine` contains all changes

## Known caveats
- Next.js build warns about multiple lockfiles (workspace root inferred)
- “middleware” deprecation warning appears during builds (already known)
- Cloudflare recommendations are stubbed until vectorization is implemented
