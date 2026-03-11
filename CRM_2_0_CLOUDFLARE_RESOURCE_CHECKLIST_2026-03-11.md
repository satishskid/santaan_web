# Santaan CRM 2.0 Cloudflare Resource Checklist
Date: March 11, 2026
Purpose: Exact resources and credentials needed to build the Cloudflare content intelligence plane

## 1. Cloudflare account resources
Need from Santaan:
- Cloudflare account/project access, or one authorized technical admin
- approval to create Worker resources in the target account

Resources to create:
- Worker: `santaan-content-engine`
- Vectorize index: `santaan-content-index`
- R2 bucket: `santaan-content-drafts`
- R2 bucket: `santaan-content-assets`
- R2 bucket: `santaan-content-media`
- AI Gateway endpoint/config for Gemini traffic

## 2. Environment variables and secrets
### On Vercel CRM side
- `CF_CONTENT_ENGINE_URL`
- `CF_CONTENT_ENGINE_TOKEN`
- `ENABLE_CF_CONTENT_ENGINE=true|false`

### On Cloudflare Worker side
- `CF_CONTENT_ENGINE_TOKEN`
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `GEMINI_API_KEY`
- optional later:
  - `SEARCH_CONSOLE_CLIENT_ID`
  - `SEARCH_CONSOLE_CLIENT_SECRET`
  - `SEARCH_CONSOLE_REFRESH_TOKEN`

## 3. Content scope decision
Santaan must confirm phase-1 content corpus:
- patient blogs: yes/no
- clinical insights: yes/no
- FAQs: yes/no
- doctor-facing briefs: yes/no
- social captions/reels: yes/no
- website service pages: yes/no

Recommended phase-1 scope:
- patient blogs
- clinical insights
- FAQs
- service pages

## 4. Metadata conventions to freeze
Need approval on:
- center codes:
  - `bbsr`
  - `bam`
  - `blr`
  - `ang`
  - `network`
- audience values:
  - `patient`
  - `doctor`
  - `mixed`
- funnel stages:
  - `awareness`
  - `consideration`
  - `decision`
  - `retention`
- asset types:
  - `blog`
  - `clinical_brief`
  - `faq`
  - `landing_page`
  - `reel`
  - `social_post`
  - `emailer`
  - `ad_copy`

## 5. Data source access needed later
### Required for adaptive feedback loop
- GA4 access (already partly configured)
- Search Console property access
- Google Business Profile access if review sync remains in scope
- NeoDove structured objection/reason exports or webhook payloads
- agency social reporting discipline or API access later

### Not required to start phase 1
- Meta publishing APIs
- YouTube publishing APIs
- LinkedIn publishing APIs
- Medium publishing APIs

Those are later, not blockers.

## 6. Operational owners needed
Santaan should nominate:
- 1 technical Cloudflare owner
- 1 CRM owner
- 1 content owner
- 1 agency SPOC
- 1 NeoDove SPOC

## 7. Build dependencies from current CRM
The Cloudflare plane will depend on existing CRM modules being stable:
- content asset registry
- content feedback intake
- review themes
- GA4 content block

Current CRM already has enough to start.

## 8. Decisions required before coding starts
### Must decide now
- keep CRM on Vercel during rollout: `yes`
- build Cloudflare plane in parallel: `yes`
- retrieval engine preference:
  - `Vectorize first` (recommended)
  - or `AI Search first`
- blog chat in phase 1 or phase 2

Recommended:
- Vectorize first
- blog chat in phase 2 after retrieval quality is verified

## 9. Recommended first implementation payloads
### Article ingest payload
- `assetId`
- `title`
- `url`
- `type`
- `center`
- `audience`
- `funnelStage`
- `primaryKeyword`
- `secondaryKeywords`
- `contentMarkdown`
- `publishedAt`

### Feedback ingest payload
- `source`
- `priority`
- `center`
- `summary`
- `theme`
- `rawContext`
- `linkedAssetId`

## 10. Non-blockers
These are useful later, but do not block phase 1:
- video generation APIs
- social auto-publishing
- full omnichannel distribution
- full migration from Vercel to Cloudflare

## 11. Immediate next action from Santaan
Prepare and share:
1. Cloudflare account access or technical admin contact
2. approval to create Worker/R2/Vectorize/AI Gateway resources
3. confirmation of content corpus for phase 1
4. confirmation of metadata conventions if any changes are needed

Once these are available, implementation can begin without touching current CRM production workflows.
