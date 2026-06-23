# Santaan Website

Public marketing and education website for Santaan.

This repo is now intentionally website-only. It does not run the old CRM, BetterAuth/NextAuth, Turso/Drizzle database layer, voice AI, NeoDove, WhatsApp bot, or private admin dashboard.

## Stack

- Next.js App Router
- React
- Tailwind CSS
- Static/public pages plus a lightweight article feed

## Runtime Env

Only these variables are currently wired:

```bash
NEXT_PUBLIC_SITE_URL=https://www.santaan.in
GOOGLE_ANALYTICS_ID=
FACEBOOK_PIXEL_ID=
SANTAAN_CONTENT_HUB_URL=https://www.skids.clinic/api/content/articles
NEXT_PUBLIC_ADMIN_WA_PHONE=
```

`ASSETS_STRICT=1` is optional and only affects the local asset-check script.

## Content

Santaan article pages are read from the shared SKIDS content hub:

```bash
SANTAAN_CONTENT_HUB_URL=https://www.skids.clinic/api/content/articles
```

There is no Medium RSS sync and no local article database in this repo.

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run build
npm run lint
npm run assets:check
```

The public smoke tests live in `tests/e2e/basic.spec.ts`.

## Public API Routes

These routes are intentionally lightweight and database-free:

- `/api/blogs`
- `/api/track-call`
- `/api/newsletter/subscribe`
- `/api/at-home/register`
- `/api/seminar/register`

Form endpoints acknowledge submissions without owning CRM storage. Lead handling should stay in the external operational system unless a new CRM project is explicitly started.

## Deployment

Build command:

```bash
npm run build
```

The production site should use `NEXT_PUBLIC_SITE_URL=https://www.santaan.in`.

## Removed Legacy Surface

The following old project surfaces have been removed from runtime code:

- Auth providers and `/login` / `/profile`
- `/admin` and CRM APIs
- Turso/Drizzle migrations and DB scripts
- BetterAuth/NextAuth packages
- Groq chat service and chat widget
- NeoDove, WhatsApp, Telegram, Meta audience, Search Console, and Zoho operational APIs

If those systems are needed again, rebuild them as a separate operations app rather than re-bloating the public website.
