# Santaan SEO + Conversion Recovery Plan (Review Draft)

Date: 2026-02-19
Stack: Next.js (App Router), Turso, Netlify

## 1) Executive Verdict
The feedback is directionally correct and high-priority.

Current architecture is heavily single-page and story-led, but weak for search capture and local-intent conversion.

### Confirmed issues in current codebase
- Only limited crawlable public routes exist (`/`, `/privacy`, `/terms`) with no service-location pages.
  - Evidence: `/Users/spr/santaan hope/santaan-web/src/app`
- Homepage metadata is generic and not keyword/city targeted.
  - Evidence: `/Users/spr/santaan hope/santaan-web/src/app/layout.tsx`
- Homepage blog/news content points to Medium and is fetched client-side from `rss2json`; no indexable article URLs on Santaan domain.
  - Evidence: `/Users/spr/santaan hope/santaan-web/src/components/sections/Insights.tsx`
  - Evidence: `/Users/spr/santaan hope/santaan-web/src/components/sections/NewsAnnouncements.tsx`
- No `robots.ts` / `sitemap.ts` found.
  - Evidence: `/Users/spr/santaan hope/santaan-web/src/app`
- Core visual assets are heavy (about 15MB total; largest single image about 7.1MB), likely hurting CWV.
  - Evidence: `/Users/spr/santaan hope/santaan-web/public/assets`
- Header call UX hides center numbers under hover/dropdown on desktop and deep menu on mobile, reducing conversion visibility.
  - Evidence: `/Users/spr/santaan hope/santaan-web/src/components/layout/HeaderClient.tsx`

## 2) Recovery Goals (90 days)
- Recover and grow non-brand organic traffic from service + city queries.
- Restore crawl depth and indexable page count with treatment/location clusters.
- Move blog authority from Medium-outbound model to Santaan-owned URLs.
- Improve visitor-to-lead conversion with always-visible CTA architecture.

## 3) Phased Execution Plan

## Phase 0 (48-72 hours): Prevent further SEO loss
1. URL loss control
- Export historical URLs from GSC + GA landing pages + Netlify logs.
- Implement 301 redirects for every removed legacy service page to closest relevant new page.
- Add `not-found.tsx` with clear next actions (Call/WhatsApp/Book).

2. Technical crawl essentials
- Add `/robots.txt` via `src/app/robots.ts`.
- Add `/sitemap.xml` via `src/app/sitemap.ts`.
- Set canonical consistently to `https://santaan.in/*`.

3. Homepage SEO correction
- Update homepage title/description to include fertility + IVF + core geos.
- Keep one stable, crawl-friendly `<h1>` (not a rotating headline string).
- Preserve storytelling as supporting `h2/h3` sections.

4. CWV quick wins
- Convert largest hero assets to WebP/AVIF.
- Serve responsive sizes and ensure non-critical imagery is lazy-loaded.

## Phase 1 (Week 1-2): Rebuild search architecture
Create indexable, intent-specific routes with unique metadata + schema + CTA.

### Required pages
- `/`
- `/ivf-clinic-bhubaneswar`
- `/ivf-clinic-berhampur`
- `/ivf-clinic-bangalore-aecs-layout`
- `/male-infertility-clinic`
- `/pcos-fertility-treatment`
- `/thyroid-and-fertility`
- `/unexplained-infertility`
- `/forgotten-fever-tubal-factor`
- `/at-home-fertility-testing`
- `/our-doctors`
- `/contact-centres`
- `/fertility-insights`

### Page template standards (every service/location page)
- 1 primary keyword + city intent.
- 800-1500 words, structured into problem > diagnosis > treatment > outcomes > FAQ.
- One clear primary CTA above fold + repeated section-end CTA.
- `FAQPage` schema from on-page FAQs.
- `MedicalClinic`/`LocalBusiness` schema for location pages.

## Phase 2 (Week 2-4): Own content authority (Medium -> Santaan)
1. Self-host blog on Santaan
- Build `fertility-insights` listing + detail route (`/fertility-insights/[slug]`).
- Persist posts in Turso (title, slug, excerpt, content, tags, publish date, source URL).
- Run Netlify Scheduled Function daily to sync Medium feed to Turso.

2. Canonical strategy
- Preferred: canonical to Santaan-hosted article pages.
- Keep "Originally published on Medium" attribution with outbound source link.

3. Internal linking engine
- Add contextual in-article links to treatment pages:
  - PCOS -> `/pcos-fertility-treatment`
  - male factor -> `/male-infertility-clinic`
  - thyroid -> `/thyroid-and-fertility`
  - tubal factor -> `/forgotten-fever-tubal-factor`

## Phase 3 (Month 2-3): Conversion and E-E-A-T compounding
1. Conversion UX upgrades
- Sticky CTA rail: Call, WhatsApp, Book Assessment (mobile + desktop).
- Header redesign: always-visible phone + WhatsApp (not hidden in hover).
- Section-end micro-CTAs across all long-scroll content.

2. Local SEO depth
- Dedicated NAP blocks for each center on `/contact-centres`.
- Embedded maps + parking/timing details.
- Align on-page NAP with GBP exactly.

3. E-E-A-T implementation
- Doctor profile pages with credentials, registration, experience, languages, publications.
- Awards/media section with verifiable links.
- Add medical review date and reviewer attribution on clinical articles.

## 4) Content Plan from Current Feedback + Analytics
Source reviewed: `/Users/spr/Downloads/Santaan Blog Analytics (16th feb) (1).docx`

### High-opportunity clusters to publish on Santaan domain
1. Blocked tubes / tubal factor
- Target page(s):
  - `/fertility-insights/blocked-fallopian-tubes-symptoms-causes-treatment`
  - Support conversion route: `/forgotten-fever-tubal-factor`

2. Male factor / sperm morphology
- Target page(s):
  - `/fertility-insights/sperm-morphology-what-it-means-for-fertility`
  - Support conversion route: `/male-infertility-clinic`

3. TVS scan education
- Target page(s):
  - `/fertility-insights/tvs-scan-for-fertility-what-to-expect`
- Conversion path: at-home testing or diagnostic consultation booking.

4. Hemoglobin in pregnancy (top funnel)
- Publish only with fertility relevance (preconception/anemia impact on conception).
- Route to consultation CTA without diluting core IVF topical authority.

## 5) Implementation Backlog (Engineering)
1. SEO foundation
- Add `src/app/sitemap.ts` and `src/app/robots.ts`.
- Add reusable metadata utility in `src/lib/seo.ts`.
- Add JSON-LD helpers in `src/lib/schema.ts`.

2. Route rollout
- Create page routes listed in Phase 1.
- Add reusable page template components for hero, proof, FAQ, CTA.

3. Blog infra
- Add Turso tables for posts, tags, FAQs.
- Build Medium feed sync function and slug dedupe logic.
- Add article pages with `BlogPosting` schema.

4. Redirect protection
- Add 301 rules in `netlify.toml` for known legacy URLs.
- Monitor 404s weekly and patch redirect gaps.

5. Performance
- Compress and replace heavy PNG/JPG assets.
- Validate LCP/CLS/INP on homepage and top landing pages.

## 6) KPI Dashboard (weekly)
- Indexed pages (total and by directory).
- Clicks/impressions for non-brand keywords by page cluster.
- Average rank for:
  - "ivf centre in bhubaneswar"
  - "ivf centre in berhampur"
  - "male infertility clinic"
  - "pcos fertility treatment"
- Organic conversion rate (bookings/calls/WhatsApp).
- 404 count and redirect hit volume.
- CWV pass rate for mobile.

## 7) Review Checklist Before Launch
- Every page has unique title, meta description, canonical, single H1.
- Structured data validates in Rich Results test.
- Old service URLs return 301 (not 404).
- Primary CTA visible within first viewport on mobile.
- Blog posts are indexable on Santaan domain and internally linked to service pages.

---

## Recommended immediate sequence (this sprint)
1. Ship Phase 0 SEO guardrails (`robots`, `sitemap`, homepage metadata/H1, 301 map).
2. Launch 3 city pages + at-home testing page.
3. Launch `/fertility-insights` with first 8 migrated Medium articles.
4. Add sticky Call/WhatsApp/Book CTA and track events.
