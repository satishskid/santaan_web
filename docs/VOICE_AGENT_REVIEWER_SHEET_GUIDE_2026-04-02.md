# Voice Agent Reviewer Sheet Guide

Date: April 2, 2026 (IST)
File: `VOICE_AGENT_REVIEWER_SHEET_TEMPLATE_2026-04-02.csv`

## Purpose

This CSV is designed to be:
- imported into Google Sheets
- copied into an internal QA workbook
- adapted into a CRM review form later

## Columns

- `call_id`
- `date`
- `reviewer`
- `route`
- `agent_route`
- `entry_point_detected`
- `transparency_score`
- `empathy_score`
- `plain_language_score`
- `local_naturalness_score`
- `medical_safety_score`
- `non_judgment_score`
- `flow_control_score`
- `intake_quality_score`
- `conversion_readiness_score`
- `brand_fit_score`
- `total_score`
- `hard_fail`
- `hard_fail_reason`
- `best_line`
- `worst_line`
- `what_should_change`
- `top_failure_label`

## Recommended Sheet Setup

1. Import the CSV into Google Sheets.
2. Freeze the header row.
3. Add dropdown validation for:
   - `route`: `main`, `tv`
   - `agent_route`: `main`, `tv`, `unknown`
   - `entry_point_detected`: `main`, `tv`, `unknown`
   - `hard_fail`: `yes`, `no`
4. Add dropdown validation for `top_failure_label`:
   - `none`
   - `no_ai_disclosure`
   - `too_robotic`
   - `too_salesy`
   - `price_violation`
   - `success_rate_violation`
   - `medical_overreach`
   - `poor_empathy`
   - `female_blame_bias`
   - `bad_local_tone`
   - `weak_close`
   - `poor_extraction`
   - `missed_urgency`

## Suggested Formula

For `total_score`, use:

```text
=SUM(G2:P2)
```

Adjust row number as needed.

## Suggested Conditional Formatting

- `hard_fail = yes` -> red row
- `total_score < 30` -> dark red
- `30 to 37` -> orange
- `38 to 44` -> yellow
- `45+` -> green

## Suggested Weekly Summary Metrics

Track weekly:
- reviewed calls count
- average total score
- average empathy score
- average medical safety score
- average conversion readiness score
- hard fail rate
- most common failure label

