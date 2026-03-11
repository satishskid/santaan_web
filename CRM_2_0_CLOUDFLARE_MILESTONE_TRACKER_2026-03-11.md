# Santaan CRM 2.0 Cloudflare Milestone Tracker
Date: March 11, 2026
Owner: Santaan Growth OS / CRM 2.0

## Milestone 0: Planning Freeze
Status: Approved

Deliverables:
- architecture approved
- Vercel CRM remains live command layer
- Cloudflare content plane approved
- Turso remains shared metadata store

Exit criteria:
- technical architecture document signed off
- ownership model accepted

## Milestone 1: Cloudflare Foundation
Status: Pending
Target: Week 1

Build:
- Worker project created
- R2 buckets created
- Vectorize index created
- AI Gateway configured
- environment/secrets model defined

Deliverables:
- `santaan-content-engine` worker scaffold
- `GET /health`
- environment matrix
- infra naming conventions

Exit criteria:
- Cloudflare resources exist
- worker deploys successfully
- health endpoint reachable

## Milestone 2: Content Ingestion Pipeline
Status: Pending
Target: Week 1-2

Build:
- article ingest endpoint
- markdown normalization
- chunking logic
- embedding flow
- vector insert flow

Deliverables:
- `POST /ingest/article`
- chunk schema
- vector metadata schema
- reindex script for existing blogs

Exit criteria:
- all existing synced blogs can be ingested
- vector entries created without duplication

## Milestone 3: Retrieval APIs
Status: Pending
Target: Week 2

Build:
- related content retrieval
- internal-link recommendation API
- topic recommendation API scaffold

Deliverables:
- `POST /recommend/internal-links`
- `POST /recommend/topics`
- retrieval logs

Exit criteria:
- API returns top related content for a given article
- recommendations are structurally valid

## Milestone 4: CRM 2.0 Integration
Status: Pending
Target: Week 2-3

Build:
- Vercel CRM env hooks to Cloudflare service
- content intelligence module consumes Cloudflare recommendations
- feature flag for controlled rollout

Deliverables:
- recommendation cards in `Content Intelligence`
- fallback mode if Cloudflare service is unavailable

Exit criteria:
- CRM can call Cloudflare and render recommendation output
- no breakage in existing CRM flows

## Milestone 5: Feedback Loop Inputs
Status: Pending
Target: Week 3

Build:
- GA4 content signal normalization
- review-theme signal normalization
- Search Console integration plan
- NeoDove objection signal schema

Deliverables:
- `POST /ingest/feedback`
- normalized feedback pipeline
- topic opportunity ranking inputs

Exit criteria:
- feedback items can influence recommendation results
- top content gaps visible in CRM

## Milestone 6: Adaptive Topic Ranking
Status: Pending
Target: Week 3-4

Build:
- rank topics from multiple demand sources
- surface refresh candidates
- surface FAQ/reel/blog recommendations

Deliverables:
- opportunity scoring logic
- ranked recommendation JSON
- CRM presentation layer

Exit criteria:
- content team can act from CRM without manual topic guessing

## Milestone 7: Grounded Blog Chat
Status: Pending
Target: Week 4

Build:
- `POST /chat/blog`
- grounded answer generation
- citation support
- safe fallback behavior

Deliverables:
- blog-level chat endpoint
- citation contract
- refusal/redirect policy for unsupported questions

Exit criteria:
- blog chat answers from indexed corpus only
- unsafe topics redirect safely

## Milestone 8: Stabilization
Status: Pending
Target: Week 4-5

Build:
- error logging
- request auditability
- caching/rate limits in AI Gateway
- fallback messaging in CRM

Deliverables:
- operational runbook
- error scenarios documented
- production-readiness checklist

Exit criteria:
- no impact on current CRM reliability
- recommendation quality good enough for team use

## Milestone 9: HITL Drafting (Optional Later)
Status: Deferred

Build:
- AI-generated structured drafts
- editor review workflow
- approval trail in CRM

Reason deferred:
- retrieval quality is more important than auto-generation quality in first release

## Dependency tracker
### Required before Milestone 1
- Cloudflare account/project access
- approval to create Worker, R2, Vectorize, AI Gateway

### Required before Milestone 5
- Search Console access
- decision on whether NeoDove objections will be logged in structured format

### Required before Milestone 7
- final guardrails for public blog chat
- decision on whether Santaan Companion will later reuse same knowledge base

## Release principle
Every milestone must be additive.
No milestone may break:
- current Vercel CRM login
- current admin dashboard
- current spend sync
- current reviews and content intelligence modules
- current NeoDove webhook path
