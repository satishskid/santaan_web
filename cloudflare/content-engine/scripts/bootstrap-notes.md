# Bootstrap Notes

Resources to create next:
- Worker: `santaan-content-engine`
- Vectorize index: `santaan-content-index`
- R2 buckets:
  - `santaan-content-drafts`
  - `santaan-content-assets`
  - `santaan-content-media`
- AI Gateway: `santaan-content-gateway`

Secrets to set:
- `CF_CONTENT_ENGINE_TOKEN`
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `GEMINI_API_KEY`

Next implementation tasks:
1. create resource bindings in `wrangler.jsonc`
2. wire Vectorize upsert flow
3. add Turso persistence contract
4. connect Vercel CRM `Content Intelligence` via feature flag
