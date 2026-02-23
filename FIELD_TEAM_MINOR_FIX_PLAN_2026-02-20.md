# Santaan Minor Fix Plan (Field Feedback)

Date: 2026-02-20
Input sources:
- /Users/spr/Downloads/Santaan Website Changes.docx
- Field screenshots shared in chat

## Saved for next phase
This plan is saved as a checkpoint until NeoDove integration credentials are shared. Once available, this UI/SEO polish sprint can run in parallel with NeoDove + Bhash operational integration.

## Feedback understood (minor scope)
1. Header logo visibility/coherence is weak in transparent mode.
2. Missing H1 on:
- /contact-centres
- /at-home-fertility-testing
- /our-doctors
3. Awards section icon repetition needs variation.
4. Spacing/readability needs optimization (reduce scroll fatigue).
5. Favicon missing.
6. Palette needs stronger alignment with brand/logo colors.
7. Wordmark text beside logo is unnecessary.
8. Recover/add 10 legacy blog topics.
9. Blog reading experience needs better typography spacing hierarchy.
10. YouTube link is incorrect.
11. Maps should be clickable direct links.

## Execution Plan

### P0 (same day)
1. Header/logo coherence
- Files:
  - src/components/layout/HeaderClient.tsx
  - src/components/sections/Hero.tsx
- Changes:
  - Increase logo contrast and left spacing in non-scrolled state.
  - Remove/reduce duplicated wordmark text next to logo on desktop and mobile.
  - Keep nav readability over hero image (subtle darker glass/bg or stronger text shadow).
- Acceptance:
  - Logo is readable at first paint and after scroll.
  - No overlap/crowding between logo and first nav item.

2. Missing H1 fixes
- Files:
  - src/app/contact-centres/page.tsx
  - src/app/at-home-fertility-testing/page.tsx
  - src/app/our-doctors/page.tsx
- Changes:
  - Add one semantic page-level <h1> per route.
  - Demote section titles to h2/h3 as needed.
- Acceptance:
  - Each page has exactly one visible H1 aligned to search intent.

3. Correct YouTube link
- File:
  - src/components/layout/Footer.tsx
- Changes:
  - Replace incorrect YouTube URL with official Santaan channel URL.
- Acceptance:
  - Footer YouTube opens correct brand channel.

4. Favicon
- Files:
  - src/app/layout.tsx (metadata icons)
  - public/ (favicon assets)
- Changes:
  - Add favicon and apple-touch icons.
- Acceptance:
  - Browser tab shows Santaan favicon across main routes.

### P1 (1-2 days)
1. Contact centres map click-through
- Files:
  - src/components/sections/Locations.tsx
  - src/data/centers.ts (if map links centralized)
- Changes:
  - Add "Open in Maps" CTA (Google Maps/GMB link) for each center card.
  - Track click event for map intent.
- Acceptance:
  - Every center card has one working maps link.

2. Awards/icons visual quality
- Files:
  - src/components/sections/NewsAnnouncements.tsx (and awards-related section if separate)
- Changes:
  - Use category-driven icon set without repetitive duplicates.
  - Add alternate visual tokens (badge color/shape) per type.
- Acceptance:
  - No visible repeated icon monotony in awards block.

3. Palette/brand alignment pass
- Files:
  - src/app/globals.css
  - relevant section components using off-brand muted tones
- Changes:
  - Align core tokens to logo palette (teal/amber family) with accessible contrast.
- Acceptance:
  - Consistent CTA/button/heading hues; no unrelated muted grays dominating brand areas.

### P2 (2-3 days)
1. Blog typography/readability
- Files:
  - src/app/fertility-insights/[slug]/page.tsx
  - src/app/clinical-insights/[slug]/page.tsx
- Changes:
  - Improve paragraph margin, list spacing, heading rhythm, line-height, max-width.
  - Add visual breaks for long-form sections.
- Acceptance:
  - Long-form posts feel scannable on mobile and desktop.

2. Recover legacy blogs (10 titles provided)
- Files/flows:
  - Medium sync + blog ingest flow
  - src/app/fertility-insights/*
- Changes:
  - Re-publish/migrate the listed topics with proper tags and type=blog.
  - Add internal links to service pages.
- Acceptance:
  - All 10 appear in Santaan blog listing and are indexable on santaan.in.

3. Section spacing optimization
- Files:
  - Home sections (hero, insights, announcements, locations, etc.)
- Changes:
  - Normalize vertical rhythm and CTA placement frequency.
- Acceptance:
  - Improved discoverability and reduced scroll fatigue without changing core aesthetics.

## QA checklist
1. Header readability at 1366px, 1024px, 768px, 390px.
2. One H1 per target page.
3. Footer social links all correct.
4. Map links open exact center location.
5. Blog article readability (paragraph/list/heading spacing).
6. Lighthouse quick pass for accessibility contrast on updated sections.

## Notes from field screenshots
- Header looks compressed with logo+wordmark crowding into nav on first paint.
- Contact-centres hero/content is strong but needs clearer action affordance for maps.
- Link visibility examples confirm priority on SEO page structure and navigability.
