# Medium Tagging SOP (for Santaan Auto-Sync)
Date: 2026-02-19

## 1) Why this matters
The website routes Medium posts automatically based on tags.
If tags are wrong, the post can appear in the wrong section.

## 2) Mandatory audience tag (exact)
Choose exactly one:
1. `audience-patient` -> goes to patient section (`/fertility-insights`)
2. `audience-doctor` -> goes to doctor section (`/clinical-insights`)

If neither is present, system defaults to patient blog.

## 3) News tag rule
Use `santaan-news` only for:
1. awards
2. announcements
3. events
4. official updates

If `santaan-news` is present, post is treated as news (not doctor/patient education).

## 4) Recommended tag bundles
## Patient blog tags
1. `audience-patient` (required)
2. one topic tag: `pcos` / `male-factor` / `thyroid` / `ivf` / `tubal-factor`
3. one city or context tag when relevant
4. one CTA-intent tag such as `book-assessment`

## Doctor blog tags
1. `audience-doctor` (required)
2. `doctor-insights` (recommended)
3. one clinical domain tag: `embryology` / `reproductive-endocrinology` / `andrology`
4. one AI tag: `ai-fertility` / `clinical-update` / `predictive-modeling`
5. optional: `clinical-image-approved` only if the featured image is truly doctor-facing (charts, workflows, lab visuals, no patient portraits)

## 5) Content formatting requirements for sync quality
1. Publish from `@santaanIVF` only.
2. Add featured image in Medium.
3. Include first image near top of article body.
4. Use one H1 and clean H2 structure.
5. Keep first paragraph as short abstract (excerpt source).
6. Keep post public (not member-only).

## 6) Doctor blog acceptance gate (live on website)
Doctor posts are now published to `/clinical-insights` only if they pass quality checks:
1. Minimum substantive depth (about 260+ words after cleanup).
2. Structured sections (`H2/H3` or lists).
3. Citation signals present:
   - DOI or PMID in text, or
   - links to trusted sources (PubMed, DOI, Nature, NEJM, Lancet, Human Reproduction, Fertility & Sterility, etc.), or
   - clear "References/Citations/Sources" section.

If these are missing, post is hidden from clinical listing until updated.

## 7) Copy template for writers (use before publish)
Checklist:
1. Audience tag set? (`audience-patient` or `audience-doctor`)
2. `santaan-news` used only if announcement?
3. Featured image added?
4. First in-body image present?
5. 4-6 total tags added?
6. Internal Santaan links included?
7. CTA block included?
8. For doctor posts: at least 3 citations with DOI/PMID or trusted journal links?
9. For doctor posts: references section included?

If all are yes, publish.

## 8) After publishing
1. Wait for scheduled sync or trigger manual sync.
2. Verify route:
   - patient: `https://santaan.in/fertility-insights`
   - doctor: `https://santaan.in/clinical-insights`
