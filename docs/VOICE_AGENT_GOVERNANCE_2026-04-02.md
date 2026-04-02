# Santaan Voice Agent Governance

Date: April 2, 2026 (IST)
Purpose: Make Santaan's voice agent reliable, reviewable, and safe over time
Status: Operating governance draft

## 1) Goal

The goal is not only to launch a working voice agent.

The goal is to operate a voice system that remains:
- medically safe
- brand-consistent
- conversion-useful
- locally natural
- easy to review and improve

This means prompts cannot be treated as one-time copy.

They must be treated as controlled operating assets.

## 2) Core Principle

`Every prompt change is a product change.`

If the prompt changes:
- tone may change
- risk may change
- extraction quality may change
- conversion quality may change
- compliance risk may change

So prompt changes must be versioned and reviewed.

## 3) Source Of Truth

The source of truth should remain in this repo, not only in Bolna UI.

Canonical files:
- main prompt block
- tv prompt block
- extraction schema
- QA scorecard
- scenario pack
- configuration map

Bolna UI should be treated as deployment surface, not authoring surface.

## 4) Change Management Rule

Any change to:
- system prompt
- opening lines
- objection handling
- extraction fields
- urgency handling
- handoff logic

must go through:

1. doc update in repo
2. version note
3. test against scenario pack
4. human review
5. controlled rollout

## 5) Required Reviewers

Every meaningful prompt change should be reviewed by:

1. `Clinical reviewer`
   Checks medical safety and overreach.

2. `Operations reviewer`
   Checks whether extracted fields help callback and counseling teams.

3. `Brand / growth reviewer`
   Checks tone, clarity, and positioning.

4. `Local language reviewer`
   Checks whether the English/Odia/Hindi mix sounds natural in Odisha.

## 6) Release Levels

### Level 1: Safe copy edit

Examples:
- wording cleanup
- shorter sentence
- more natural greeting

Requirement:
- scenario check
- ops review

### Level 2: Behavioral change

Examples:
- new objection handling
- new close
- new questioning order

Requirement:
- scenario check
- ops review
- growth review

### Level 3: Safety-sensitive change

Examples:
- medical guidance changes
- urgency handling changes
- cost or outcome handling changes
- extraction schema changes

Requirement:
- scenario check
- clinical review
- ops review
- growth review

## 7) Release Workflow

Recommended sustainable workflow:

1. edit the source doc in repo
2. record what changed and why
3. test against scenario pack
4. review first in sandbox / draft agent
5. deploy to one agent only
6. manually review first `10-20` calls
7. scale only if no hard fails

## 8) Non-Negotiable Launch Gates

Do not scale if any of these are unstable:

- AI disclosure
- cost handling
- success-rate handling
- report interpretation refusal
- urgency escalation
- gender-balanced non-blaming language
- extraction of callback and city

## 9) Sustainable Metrics

Track weekly:

- reviewed calls count
- hard fail count
- average total QA score
- empathy score average
- medical safety score average
- conversion readiness score average
- callback completion rate
- consultation conversion rate from voice leads
- extraction miss rate
- most common failure label

## 10) Prompt Drift Prevention

Prompt drift happens when:
- Bolna UI is edited directly without repo update
- different agents diverge silently
- reviewers forget what was previously approved

Prevent drift by:
- keeping prompt version name in the prompt header
- updating the repo first
- recording the deployed version in an ops sheet
- reviewing live Bolna config monthly against repo docs

## 11) Recommended Naming Convention

Use versioned naming:

- `main_v1`
- `tv_v1`
- `main_v1_1_copy_tune`
- `tv_v1_2_empathy_fix`

This makes postmortem review much easier.

## 12) Suggested Monthly Review Ritual

Once per month:

1. review 20 random calls
2. review all hard fails
3. review the top 3 objection types
4. review extraction misses
5. decide whether:
   - no change needed
   - copy tune needed
   - logic tune needed
   - escalation rules need strengthening

## 13) Incident Protocol

If the agent says something unsafe:

1. pause the affected agent if needed
2. save transcript and recording
3. classify issue:
   - medical overreach
   - compliance violation
   - emotional harm
   - extraction failure
   - brand/tone failure
4. patch source docs
5. retest with scenario pack
6. redeploy under a new version label

## 14) Long-Term Sustainability Rules

To keep this system sustainable:

- keep prompts short enough to reason about
- avoid hidden logic only stored in vendor UI
- prefer explicit rules over vague "be empathetic"
- review real calls regularly
- evolve from evidence, not random preference
- optimize for trust and safety before optimization for volume

## 15) Definition Of Sustainable Success

This system is sustainable when:

- new staff can understand how it works from repo docs
- prompt changes are reviewable
- failures are traceable
- tone stays consistent across months
- the agent improves through deliberate iteration, not guesswork

