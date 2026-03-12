# Santaan Content Engine

Parallel Cloudflare Worker service for Santaan CRM 2.0.

Purpose:
- content ingestion
- chunking + embedding pipeline
- recommendation APIs
- future grounded blog chat

This service is intentionally separate from the live Vercel CRM.

## Endpoints
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
- Article ingest stores payloads in R2 and writes chunk embeddings into Vectorize.
- Internal-link recommendations now query the indexed Santaan corpus.
- Topic recommendations now rank feedback themes against current corpus coverage.
- Blog chat remains a grounded preview endpoint, not final reader chat.
- This foundation is additive and does not modify the live CRM runtime.
