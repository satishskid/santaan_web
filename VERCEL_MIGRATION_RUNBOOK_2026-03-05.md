# Santaan Vercel Migration Runbook (No-Code Baseline)

Date: 2026-03-05  
Branch: `codex/vercel-migration-plan`  
Goal: move website + CRM to Vercel with minimum risk and clean rollback.

## 1) Migration Strategy

Use one deployment target for both:
- patient-facing site
- admin CRM + APIs

Keep Netlify stable deploy as rollback until Vercel UAT is signed off.

## 2) Project Scope

- Repository: `satishskid/santaan_web`
- Framework: Next.js App Router
- Runtime: Node.js (Vercel default for Next.js server routes)
- Database/Auth: Turso + NextAuth (unchanged)

## 3) Vercel Setup Steps

## 3.1 Create Vercel project (once)

```bash
cd "/Users/spr/santaan hope/santaan-web"
vercel link
```

Choose:
- Scope: your team/account
- Existing project: `santaan-web` (or create new)
- Root directory: current project

## 3.2 Pull Vercel env locally (optional but recommended)

```bash
vercel env pull .env.vercel.local
```

## 3.3 Add production env vars in Vercel UI

Add only required values first (core runtime), then optional connectors.

## Core runtime (must)
- `AUTH_SECRET`
- `NEXTAUTH_SECRET`
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `NEODOVE_WEBHOOK_SECRET`
- `BLOG_SYNC_SECRET`

## CRM communications (as needed)
- `BHASH_USER`
- `BHASH_PASS`
- `BHASH_SENDER`
- `WHATSAPP_VERIFY_TOKEN`
- `CALL_WEBHOOK_SECRET`

## Analytics/connectors (phase 2 if needed)
- `GA4_PROPERTY_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `META_ACCESS_TOKEN`
- `META_AD_ACCOUNT_IDS`
- `META_APP_SECRET`
- `META_GRAPH_API_VERSION`
- `META_REPORTING_TIMEZONE`
- `META_SPEND_SYNC_SECRET`

## 3.4 Deploy preview from migration branch

```bash
git checkout codex/vercel-migration-plan
vercel deploy
```

## 3.5 Promote to production (only after UAT)

```bash
vercel deploy --prod
```

## 4) UAT Checklist (must pass)

## Public site
- `/` loads with hero + nav + CTA links
- `/fertility-insights` loads
- `/clinical-insights` loads
- `/contact-centres` loads center cards/maps

## Admin/CRM
- `/admin/dashboard` login works
- `Daily Command` tab visible and updates status
- `CEO Command` shows daily compliance widget
- `Spend` CRUD works
- `Ops Inputs` CRUD works

## Integrations
- NeoDove webhook returns 200 and creates/updates contact
- Meta spend sync endpoint returns success (if token configured)
- GA4 endpoint works (if GA4 vars configured)

## 5) DNS Cutover Plan

After UAT pass:
1. Add `santaan.in` and `www.santaan.in` in Vercel domains.
2. Update DNS records at current DNS provider as instructed by Vercel.
3. Keep Netlify stable deploy untouched for rollback window (7 days).

## 6) Rollback Protocol

If production issue after cutover:
1. Repoint DNS back to Netlify target.
2. Validate:
   - homepage 200
   - admin login redirect 307
3. Freeze Vercel prod deploys until fix verified.

## 7) Governance Rules

- No secret values in repo.
- Keep one credential source of truth (Vercel env for prod).
- Use strict UTM + `brand` tagging for Santaan vs SKIDS.
- All new integrations go via staging/preview first.

---

This runbook intentionally avoids code changes and focuses on safe platform transition.
