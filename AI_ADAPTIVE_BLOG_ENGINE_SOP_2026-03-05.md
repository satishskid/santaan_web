# Santaan Adaptive Blog Engine SOP (v1)

Date: 2026-03-05  
Objective: Make blogs adapt to real audience signals from CRM, not just editorial intuition.

## 1) What "Adaptive Blog" Means

Every week, content topics, hooks, CTAs, and FAQs must change based on:
- patient questions
- counselor objections
- telecaller lost reasons
- center-wise lead trends
- campaign CTR/CVR signals

If audience behavior changes, blog strategy changes in the same week.

## 2) Input Signals (Mandatory)

Pull weekly from CRM:
- Top 20 repeated patient questions (chat + WhatsApp + call notes)
- Top lost reason codes (cost/fear/delay/family/trust/other)
- Top objection after consult
- Page-level blog performance (views, CTA clicks, leads)
- Center trend (Bhubaneswar/Berhampur/Bangalore/Angul)

Do not plan content without these inputs.

## 3) Weekly Adaptive Loop (Mon-Sat)

Monday:
- CRM Ops exports signal pack (questions, objections, trends)
- Marketing lead prioritizes 3 patient topics + 1 doctor topic

Tuesday:
- Writers create briefs with center + stage + CTA intent
- Medical reviewer checks clinical safety

Wednesday:
- Publish 1 patient blog + 1 social derivative

Thursday:
- Publish 1 patient blog + 1 doctor/clinical insight

Friday:
- Analyze performance: CTR to CTA, scroll depth proxy, lead form rate

Saturday:
- Keep / Kill / Rewrite decision:
  - Keep if CTA CTR >= baseline
  - Rewrite if high views but low CTA
  - Kill angle if no traction for 2 cycles

## 4) Content Decision Rules

Use this matrix:
- High question frequency + high lost reason = highest priority
- High traffic + low lead rate = rewrite CTA and structure
- Low traffic + high conversion = amplify with paid + reels
- Center-specific demand spike = center-specific article next week

## 5) Blog Types and Purpose

1. Patient Facing (`type=blog`)
- Purpose: trust + education + consultation intent
- Tone: empathetic, simple, hopeful
- CTA: call / WhatsApp / book assessment

2. Doctor Facing (`type=clinical`)
- Purpose: medical credibility + referral confidence
- Tone: evidence-led, citation-backed
- CTA: clinical relations / advanced consult routing

## 6) Mandatory Blog Metadata (for automation)

In Medium tags, include:
- `audience-patient` or `audience-doctor`
- one center tag: `center-bhubaneswar|center-berhampur|center-bangalore|center-angul|center-multi`
- one funnel tag: `stage-awareness|stage-consideration|stage-decision`
- one service tag: `service-ivf|service-pcos|service-male-factor|service-egg-freezing|service-thyroid|service-unexplained`
- one intent tag: `intent-call|intent-whatsapp|intent-book|intent-read-more`

Minimum required tags per post: 5

## 7) Adaptive Writing Structure (Patient Blog)

Use this order:
1. Real patient problem statement (city/context)
2. Why this happens (simple science)
3. Common myth
4. What Santaan evaluates
5. What patient should do now
6. FAQ (3-5)
7. CTA with center routing

## 8) Adaptive Writing Structure (Doctor Blog)

Use this order:
1. Clinical question
2. Evidence summary
3. Practice relevance
4. Limitations / bias
5. Santaan workflow relevance
6. References
7. Referral/contact CTA

## 9) Campaign-to-Content Coupling

For every paid campaign, enforce 1 mapped blog landing page:
- each adset must map to one blog slug
- each blog must carry matching `utm_campaign` and `asset`
- track `blog -> CTA -> lead` chain in CRM

If campaign CPA worsens >20% week-on-week:
- refresh blog hook
- replace hero image
- rewrite first 120 words
- test stronger FAQ and CTA

## 10) Writer Prompt (Use as-is)

```text
You are writing for Santaan Fertility. Create a {patient/doctor} blog.

Audience signal pack:
- Top questions: {paste}
- Top objections/lost reasons: {paste}
- Target center: {center}
- Funnel stage: {awareness/consideration/decision}
- Service line: {service}

Output requirements:
- Title with search intent + empathy
- H2/H3 structure with short paragraphs
- 3-5 FAQ entries
- CTA tailored to center and stage
- No hard promises on success rates/cost
- Mention that treatment and outcomes depend on individual clinical profile
- Add tag set exactly:
  audience-{patient/doctor}, center-{x}, stage-{x}, service-{x}, intent-{x}
```

## 11) Guardrails

Never publish:
- guaranteed success claims
- fixed treatment cost claims without qualification
- advice replacing doctor judgment

Always include:
- personalized clinical dependency line
- center-specific contact path
- medical disclaimer where needed

## 12) Weekly KPI Targets (Content Engine)

- 2 patient blogs/week
- 1 doctor blog/week
- >= 90% posts correctly tagged
- >= 8% average CTA click-through from blog
- >= 15% MoM growth in blog-attributed leads (after 6 weeks baseline)

## 13) Ownership

- Content strategist: topic priority from CRM signals
- Writers: draft + metadata compliance
- Medical reviewer: safety and accuracy
- CRM ops: attribution and performance reporting
- CEO: weekly keep/kill/scale decisions

---

This SOP is designed so content behaves like a listening system, not a static publishing calendar.
