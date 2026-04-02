# Santaan Repo Operating Checklist

## Default Operating Mode
- Code inspection and local code changes: allowed by default.
- Ask before live DB writes, production env edits, or production deploys.
- Prefer targeted fixes over broad cleanup in production-facing areas.

## Verified Access
- Git remote: connected to `satishskid/santaan_web`.
- Git push: working from this machine.
- GitHub CLI (`gh`): authenticated as `satishskid`.
- Vercel CLI: authenticated and linked to `santaan-web`.
- Turso production DB: readable and writable from this workspace.

## Production-Safe Workflow
- 1. Inspect the relevant code path and database impact first.
- 2. Make local code changes with `apply_patch`.
- 3. Run targeted validation:
  `npx eslint <changed-files>`
  `npx tsc --noEmit`
- 4. Run integration health when config/env changes are involved:
  `npm run integrations:check`
- Production env snapshot check:
  `npm run integrations:check:prod`
- CRM ops health snapshot for Codex triage:
  `npm run crm:health`
- Production CRM ops health snapshot:
  `npm run crm:health:prod`
- 5. For live data fixes, change only the minimum affected row(s).
- 6. Report exactly what changed and whether production state was touched.

## CRM Monitoring Surfaces
- Admin API snapshot: `GET /api/admin/crm-health`
- CEO UI panel: `CEO Command Center -> CRM Health Monitor`
- Purpose: one shared signal for pipeline leaks, integration failures, and missing ops submissions so incident triage can start from the same facts in UI and Codex.

## Canonical Access Rules
- Super-admin and leadership allowlists must come from `src/lib/access-control.ts`.
- Do not duplicate admin email lists in new files.
- If a new leadership user is added, update the shared access-control module and any seed/audit scripts that manage canonical admin access.

## Critical Integrations Confirmed
- Auth: `NEXTAUTH_*`, `BETTER_AUTH_*`
- Database: `TURSO_*`
- Google: OAuth, GA4, service-account based analytics
- Email: SMTP credentials present
- Meta: access token and account IDs present
- NeoDove: configured
- Zoho Cliq: configured
- Cloudflare content engine: configured
- Bhash / WhatsApp: configured

## Known Env Notes
- `next_public_admin_wa_phone` exists in production and is already supported as a fallback.
- Search Console code supports fallback service-account JSON envs via GA4 / Google service account config.
- `META_APP_SECRET` is not currently present in production; Meta integrations should assume token-only mode unless that secret is added.

## Deploy/Auth Notes
- `gh` is currently stored with plain-text token storage for reliability on this machine.
- Keep as-is unless there is an explicit request to migrate it back to secure keychain storage.

## Approval Triggers
- Ask before:
  - modifying production data
  - changing Vercel production env vars
  - running production deploys
  - bulk user resets
- No need to ask before:
  - local code cleanup
  - targeted lint/type checks
  - read-only GitHub/Vercel/DB diagnostics
