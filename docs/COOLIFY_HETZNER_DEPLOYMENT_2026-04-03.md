# Santaan Coolify + Hetzner Deployment Track

Date: April 3, 2026 (IST)
Purpose: Prepare Santaan for Git-driven deployment on a Hetzner VPS using Coolify

## Recommended Strategy

Use two tracks:

### Track A: Short-Term Voice Go-Live

- Keep current live app on Vercel for now
- Do not merge unvalidated voice changes directly into the production branch
- Create a separate staging deployment first
- Validate Bolna webhook flow, CRM writes, NeoDove, and optional WhatsApp
- Merge only after real-call validation

### Track B: Long-Term Hosting

- Provision one Hetzner VPS
- Install Coolify
- Connect Git provider
- Deploy Santaan from a dedicated branch first
- Migrate production only after staging passes

## Why Separate Project First

For the Bolna + VoBiz path, a separate project is safer because:

- webhook traffic can be tested against a staging domain without disturbing the live CRM
- env variables can be isolated
- branch-based deploys reduce risk to the running CRM
- Bhash and NeoDove behavior can be checked before mainline rollout

Recommended short-term pattern:

1. Keep current production project untouched
2. Create a staging project from branch `codex/voice-ops-baseline`
3. Use staging envs and staging webhook URL
4. Validate with real or controlled test calls
5. Merge to `main`
6. Deploy production only after acceptance

## Recommended Hetzner Shape

For Santaan’s current size:

- Hetzner CPX31 or CPX41 is a comfortable starting point
- Ubuntu 24.04 LTS
- single server first
- Docker-based deployment through Coolify

Why:

- enough headroom for Next.js app build + runtime
- room for future background jobs or side services
- simpler operations than multi-node too early

## Coolify Setup Pattern

1. Provision VPS in closest practical region
2. Point an admin subdomain such as `coolify.yourdomain.com`
3. Install Coolify on the VPS
4. Add GitHub App or repository access
5. Create Santaan as a Dockerfile-based application
6. Set app port to `3000`
7. Set health check to `/api/healthz`
8. Add all production env vars in Coolify
9. Add scheduled jobs for cron endpoints

Official references:

- [Coolify Docker applications](https://docs.coollabs.io/coolify/v3/applications/docker)
- [Coolify GitHub Actions / CI-CD](https://coolify.io/docs/applications/ci-cd/github/actions)
- [Coolify health checks](https://coolify.io/docs/knowledge-base/health-checks)

## Repo Readiness Added

This repository now includes:

- [Dockerfile](/Users/spr/santaan%20hope/santaan-web/Dockerfile)
- [.dockerignore](/Users/spr/santaan%20hope/santaan-web/.dockerignore)
- [route.ts](/Users/spr/santaan%20hope/santaan-web/src/app/api/healthz/route.ts)
- standalone Next.js output in [next.config.ts](/Users/spr/santaan%20hope/santaan-web/next.config.ts)

Important runtime note:

- the Voice Ops admin API reads markdown from `docs/`
- the Docker image must include `docs/`
- the added Dockerfile already copies `docs/` into the runtime image

## Cron Migration Note

Current Vercel-managed crons are:

- `/api/cron/meta-audiences`
- `/api/cron/zoho-cliq-morning`
- `/api/cron/zoho-cliq-evening`

On Coolify or VPS, recreate them as scheduled HTTP jobs with:

- `x-cron-secret: <CRON_SECRET>`

or:

- `Authorization: Bearer <CRON_SECRET>`

These routes already support a secret-based fallback and are not locked to Vercel-only headers.

## Santaan App Settings For Coolify

Recommended app settings:

- Build Pack: Dockerfile
- Port: `3000`
- Health Check Path: `/api/healthz`
- Auto Deploy: enabled on push to chosen branch
- Branch for staging: `codex/voice-ops-baseline`
- Branch for production later: `main`

## Environment Guidance

Minimum critical env groups:

- auth
- Turso database
- Google OAuth
- Bhash
- NeoDove
- Bolna
- Zoho Cliq
- cron secret

Before production cutover, run:

- `npm run integrations:check`
- `npm run voice:bolna:verify`
- two real inbound call tests

## Recommended Rollout Order

1. Create separate staging project now
2. Test the voice stack end to end
3. In parallel, provision Hetzner + Coolify
4. Deploy staging branch to Coolify
5. Compare Vercel staging vs Coolify staging
6. Choose final production cutover window

