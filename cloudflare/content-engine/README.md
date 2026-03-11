# Santaan Content Engine

Parallel Cloudflare Worker service for Santaan CRM 2.0.

Purpose:
- content ingestion
- chunking + embedding pipeline foundation
- recommendation APIs
- future grounded blog chat

This service is intentionally separate from the live Vercel CRM.

## Phase 1 endpoints
- `GET /health`
- `POST /ingest/article`
- `POST /ingest/feedback`
- `POST /recommend/internal-links`
- `POST /recommend/topics`
- `POST /chat/blog`

## Auth
All POST routes require:
- `Authorization: Bearer <CF_CONTENT_ENGINE_TOKEN>`
or
- `x-content-engine-token: <CF_CONTENT_ENGINE_TOKEN>`

`GET /health` is public for infrastructure checks.

## Notes
- R2 and Vectorize bindings are scaffolded, not fully activated.
- Recommendation endpoints are currently safe stubs until indexing is wired.
- This foundation is additive and does not modify the live CRM runtime.
