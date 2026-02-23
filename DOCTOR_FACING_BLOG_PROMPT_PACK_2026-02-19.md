# Doctor-Facing Blog Prompt Pack (Medium -> Santaan Sync)
Date: 2026-02-19

## 1) Should Santaan publish doctor-facing blogs?
Yes. It is a strong idea if executed as a separate track from patient education.

## Why it helps
1. Builds Santaan's scientific authority with clinicians and referral ecosystem.
2. Supports your USP: AI-enabled fertility diagnostics and precision workflows.
3. Improves trust with advanced patients who research deeply before consult.
4. Creates premium brand positioning beyond generic fertility content.

## Guardrail
Keep two parallel content tracks:
1. Patient track: simple language, decision support.
2. Doctor track: evidence-heavy, journal-aligned, methodology clarity.

Do not mix both in one article.

## 2) Recommended taxonomy for doctor-facing posts
Use one of these formats in title and tags:
1. `Clinical Update`
2. `Journal Brief`
3. `Protocol Insight`
4. `AI in Reproductive Medicine`
5. `Case Pattern Review`

## Suggested tag set
Always include:
1. `doctor-insights`
2. one topic tag (`pcos`, `male-factor`, `embryology`, `endocrinology`, `immunology`)
3. one AI tag (`ai-fertility`, `predictive-modeling`, `clinical-decision-support`)

For news-type medical updates only, also include `santaan-news`.

## 3) Master prompt for doctor-facing article generation
Copy this prompt for your writing team.

```
You are writing for fertility specialists, gynecologists, embryologists, and evidence-oriented clinicians.

Write a doctor-facing article for Santaan IVF with these constraints:
1) Topic: {{TOPIC}}
2) Clinical question: {{QUESTION}}
3) Primary keyword: {{KEYWORD}}
4) Target audience: fertility doctors and advanced clinicians in India.
5) Tone: scientific, balanced, practical; no hype.
6) Length: 1200-1800 words.

Structure:
- H1 with primary keyword
- 80-120 word executive summary
- H2: Why this matters clinically now
- H2: Mechanistic basis (pathophysiology / biomarker rationale)
- H2: Evidence snapshot (recent studies, strengths, limitations)
- H2: AI/analytics angle for decision support
- H2: Santaan clinical implementation pathway (workflow, safety checks)
- H2: Practice takeaways (what to do Monday morning)
- H2: Limitations, contraindications, and unanswered questions
- H2: References (5-10 recent and relevant)

Mandatory quality rules:
- Include absolute numbers where possible, not only qualitative statements.
- Separate proven evidence vs hypothesis clearly.
- Mention limitations and bias risks of studies.
- Do not claim guaranteed outcomes.
- Avoid promotional language.

End matter:
- "Clinical Disclaimer" section.
- "Discuss with Santaan Clinical Team" CTA (non-promotional, collaboration tone).
- Include 2 internal Santaan links naturally:
  - https://santaan.in/female-fertility
  - https://santaan.in/male-infertility-clinic
```

## 4) Prompt variant: Journal brief
Use for fast-turnaround evidence digests.

```
Create a "Journal Brief" for Santaan IVF.

Inputs:
- Paper title: {{PAPER_TITLE}}
- Journal/year: {{JOURNAL_YEAR}}
- DOI/link: {{DOI_OR_LINK}}

Output sections:
1) Clinical context (3-4 bullets)
2) Study design and population
3) Key outcomes with numbers
4) Applicability to Indian fertility practice
5) AI relevance (if any)
6) What Santaan clinicians can adopt now
7) Caveats and what not to over-interpret
8) Reference citation

Word count: 800-1200
Audience: clinicians
Tone: critical, practical, objective
```

## 5) Prompt variant: AI-in-fertility article
Use for your USP storytelling with credibility.

```
Write a doctor-facing article on: {{AI_USE_CASE_IN_FERTILITY}}

Focus:
1) Clinical problem AI is solving
2) Data inputs and feature families
3) Model outputs and decision pathways
4) Validation strategy (internal/external)
5) Error modes and safety boundaries
6) Human-in-the-loop governance
7) Regulatory and ethical considerations in India
8) Implementation framework in IVF workflow

Include:
- One table: "Traditional workflow vs AI-assisted workflow"
- One table: "Failure mode and mitigation"
- 5-8 references

Do not use buzzwords without operational definition.
```

## 6) Publishing checklist for Medium (important for sync + design)
1. Publish from `@santaanIVF`.
2. Set featured image clearly (high-resolution) and keep it clinician-facing: charts, workflows, lab context, no patient portrait style.
3. Keep first image near top of article (improves thumbnail extraction reliability).
4. Add 4-6 tags including `doctor-insights` for this track.
5. Keep one-sentence abstract in opening paragraph (used in excerpts).
6. Include internal Santaan links in body.
7. Include at least 3 citations and a `References` section.
8. Add DOI/PMID where possible.
9. If featured image is truly clinical and approved for doctor track, include tag: `clinical-image-approved`.

## 7) Recommended doctor-facing content calendar (monthly)
1. Week 1: AI in sperm morphology or DNA fragmentation interpretation.
2. Week 2: Protocol update on PCOS/metabolic subtyping and ovarian response.
3. Week 3: Journal brief on embryo selection, implantation markers, or endocrine nuance.
4. Week 4: Case-pattern review with caveats and treatment pathway logic.
