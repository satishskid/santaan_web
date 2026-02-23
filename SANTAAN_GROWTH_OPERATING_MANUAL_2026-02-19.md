# Santaan Growth Operating Manual
Date: 2026-02-19  
Website: https://santaan.in  
Stack: Next.js + Turso + Netlify

## 1) Executive summary: what we have done
This is the current growth system now live on Santaan:

1. SEO foundation built
- Keyworded metadata framework added.
- `robots.txt` and `sitemap.xml` generation added.
- Structured schema blocks added (Organization, Local clinics, FAQ, BlogPosting support).

2. Multi-page SEO architecture restored (without breaking aesthetics)
- Service/location pages are now indexable using dynamic route content.
- Key SEO routes are live: home, contact centres, doctors, at-home testing, fertility insights, and service-intent pages.
- Legacy route redirects added for core paths (`/blog`, `/contact`, `/doctors`, etc.).

3. Medium to Santaan blog authority pipeline implemented
- Medium feed fetch + parse + normalize pipeline added.
- Posts are synced and stored in Turso (`blog_posts`).
- Blog APIs and pages now serve content on Santaan domain (`/fertility-insights`, `/fertility-insights/[slug]`).
- Scheduled Netlify function added for daily sync.

4. Conversion UX strengthened
- Sticky contact bar added for persistent Call / WhatsApp / Book.
- Header updated for direct conversion actions and cleaner navigation.
- UTM capture and campaign attribution tracking integrated into lead flow.

5. Admin CRM upgraded to growth command center
- Existing analytics view retained.
- New `CEO Command` tab added in admin dashboard with:
  - north-star conversion view
  - funnel health
  - channel ROI
  - center performance
  - asset-level ROI
  - prioritized weekly action queue with owners

## 2) Why this should work for Santaan growth
This system works because it fixes the full growth chain, not one part.

1. Discovery
- Multi-page SEO lets Google rank Santaan for many service + city intents, not only brand name.

2. Capture
- Every campaign and content asset now has a trackable route into Santaan with UTMs.

3. Conversion
- Persistent CTA surfaces reduce drop-off from mobile and fast decision users.

4. Attribution
- Lead source, campaign, and landing page are visible in CRM, so marketing can stop guessing.

5. Actionability
- CEO dashboard turns raw data into weekly actions (who should do what next).

6. Compounding loop
- Better content -> better ranking -> better lead quality -> better conversion -> better ROI data -> better decisions.

This is the core reason growth should improve: you now have a measurable closed loop.

## 3) CEO user manual (fast, decision-first)
Goal: spend 15 minutes/week, take high-impact decisions, avoid dashboard micromanagement.

### Weekly CEO routine (15 minutes)
1. Open `Admin Dashboard -> CEO Command`.
2. Read only these 6 numbers first:
- Conversion rate
- Total leads
- Converted patients
- Pending >24h
- Attribution coverage
- Lost rate vs conversion rate
3. Read the "Weekly Action Queue".
4. Approve top 3 actions only.
5. Assign single owner per action with deadline.

### CEO decision rules
1. If `Pending >24h` is high:
- Immediate instruction: same-day call-back drive by CRM team.
2. If `Attribution coverage < 85%`:
- Immediate instruction: no campaign goes live without UTM template.
3. If `Lost rate > Conversion rate`:
- Immediate instruction: start 30-day winback flow.
4. If one channel is winning:
- Immediate instruction: scale spend 10-15% and clone best asset pattern.
5. If qualified leads are high but conversions are low:
- Immediate instruction: counseling script review + faster specialist slot allocation.

### CEO should not do
1. Do not review individual leads in routine meetings.
2. Do not approve creatives without ROI context from channel/asset tables.
3. Do not accept "good reach" as success without conversion movement.

## 4) Admin/operations manual
Goal: keep lead pipeline clean and fast.

### Daily checklist (admin team)
1. Clear all stale leads (>24h).
2. Update lead status correctly (`new`, `contacted`, `qualified`, `converted`, `lost`).
3. Ensure every new lead has:
- source
- campaign (if available)
- landing path
4. Review high-intent leads (`lead score >= 70`) for same-day outreach.
5. Mark outcomes in CRM after each contact attempt.

### SLA targets
1. First response: < 30 minutes during working hours.
2. High-intent callback: same day.
3. Qualified lead specialist slot proposal: within 24 hours.
4. Zero unresolved stale leads at end of day.

## 5) Marketing manager manual
Goal: move from "campaign activity" to "channel ROI and patient conversion".

### Campaign launch SOP
1. Select exact landing page by intent:
- IVF city intent -> city IVF page
- PCOS -> PCOS page
- Male factor -> male fertility page
- Doctor trust campaign -> doctors page
2. Generate UTM links for each asset variant:
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
3. Use one creative promise per landing page (message match).
4. Add Call + WhatsApp + Book CTA in creative caption/script.

### Weekly optimization SOP
1. Open `CEO Command -> Channel ROI`.
2. Pause channels with high leads but poor conversion.
3. Scale top-converting source/campaign pairs.
4. Use `Asset ROI` table to:
- duplicate top patterns
- rewrite weak creatives
- fix landing mismatch
5. Submit weekly note to CEO:
- what scaled
- what paused
- what tested next

## 6) Brand guideline for staff (patient-facing behavior)
Goal: every interaction should feel medically trustworthy and emotionally safe.

### Voice principles
1. Calm, clear, respectful.
2. Evidence-led but compassionate.
3. No fear language, no pressure language.

### Message structure
1. Acknowledge concern.
2. Give medically correct next step.
3. Offer guided action (call/WhatsApp/assessment).

### Do and do not
1. Do use plain words for diagnosis and next steps.
2. Do explain both partners should be evaluated.
3. Do mention timelines honestly.
4. Do not promise guaranteed outcomes.
5. Do not dismiss prior failed attempts.
6. Do not use generic copy-paste replies for emotional queries.

## 7) Note for content writers (blogs)
Goal: make each article rank + convert + support counseling.

### Required article format
1. One primary keyword.
2. One clear H1 including the keyword.
3. H2 blocks:
- symptoms/problem
- causes
- diagnosis
- treatment options
- when to consult
4. Add 3-5 FAQs.
5. End with CTA block:
- Book assessment
- Call
- WhatsApp
6. Add 1-2 internal links to relevant service pages.

### Publish checklist
1. Publish from `@santaanIVF`.
2. Add 4-6 tags.
3. Use `santaan-news` tag only for announcements.
4. Add a featured image.
5. Ensure first paragraph has a usable excerpt.

## 8) Note for social media reel makers
Goal: reels should generate measurable consult intent, not only views.

### Reel script framework (30-45 sec)
1. Hook (0-3s): one real patient pain point.
2. Clarify (3-15s): one myth or hidden cause.
3. Expert anchor (15-30s): one medically valid insight.
4. Action CTA (last 5-10s):
- "Book assessment"
- "WhatsApp Santaan"
- "Call your nearest center"

### Caption and posting rules
1. Use one intent keyword in caption.
2. Include city mention when relevant.
3. Add tracked short link with UTM in bio/description.
4. Add pinned comment with CTA link text.
5. Post with platform-native thumbnail title.

### Reel quality gate
1. One reel = one topic = one CTA.
2. Never use panic-based messaging.
3. Add disclaimer where needed: "General education, not a personal diagnosis."
4. Send top-performing reel themes to content team for full blog expansion.

## 9) Operating rhythm (who does what)
### Monday
1. Marketing publishes weekly campaign plan.
2. Admin validates attribution hygiene.

### Wednesday
1. Mid-week lead quality and stale-lead correction.

### Friday
1. CEO review of command center.
2. Approve next week scale/pause/test decisions.

## 10) Success definition for next 90 days
1. Increase attribution coverage to >= 90%.
2. Reduce stale leads >24h by >= 50%.
3. Improve lead-to-conversion rate steadily month-on-month.
4. Increase traffic share to Santaan-hosted insights vs outbound Medium dependence.
5. Build repeatable weekly decision system with clear owners.

---
This manual is designed so leadership gets clarity, teams get execution discipline, and patients get a consistent premium care experience from first touch to treatment onboarding.
