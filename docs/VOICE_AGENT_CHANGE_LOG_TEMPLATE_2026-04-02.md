# Voice Agent Change Log Template

Date created: April 2, 2026 (IST)
Purpose: Track every meaningful voice-agent change in a way that is auditable

## How to use

Create one entry per meaningful change.

Use this for:
- prompt edits
- greeting edits
- extraction field edits
- urgency rule edits
- objection handling edits
- routing behavior changes

## Entry Template

```text
Date:
Change ID:
Agent:
Version before:
Version after:
Owner:
Change type:

What changed:

Why it changed:

Expected benefit:

Safety risk:

Reviewed by:
- Clinical:
- Ops:
- Growth/Brand:
- Local language:

Scenario tests run:

Deployment scope:
- draft only
- one agent
- both agents

Post-deploy review requirement:

Outcome after review:
```

## Recommended Change Types

- `copy_tune`
- `opening_change`
- `objection_handling_change`
- `extraction_change`
- `urgency_change`
- `compliance_fix`
- `routing_change`
- `handoff_change`

## Example

```text
Date: 2026-04-10
Change ID: VA-007
Agent: Santaan TV Inbound
Version before: tv_v1
Version after: tv_v1_1
Owner: CRM Ops
Change type: opening_change

What changed:
Replaced the first greeting with a softer TV-line opener.

Why it changed:
Test reviewers said the first greeting sounded too formal and slightly call-center-like.

Expected benefit:
Improve caller comfort in first 15 seconds.

Safety risk:
Low

Reviewed by:
- Clinical: yes
- Ops: yes
- Growth/Brand: yes
- Local language: yes

Scenario tests run:
2, 8, 18

Deployment scope:
one agent

Post-deploy review requirement:
Review first 10 TV calls

Outcome after review:
Pending
```

