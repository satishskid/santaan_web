# AI Content & Campaign Tracker - Quick Guide

File: `AI_CONTENT_CAMPAIGN_BRIEF_TRACKER_V1_2026-02-23.csv`

## How to use
1. Open CSV in Google Sheets/Excel.
2. Duplicate weekly block for each new week.
3. Replace all `ENTER` values.
4. Keep `record_type` values unchanged for filtering.

## Record types
- `KPI`: weekly performance values
- `CAMPAIGN_DECISION`: scale/fix/pause decisions
- `INTENT_CLUSTER`: AI-derived demand themes by center
- `OBJECTION`: top patient concerns from notes
- `CONTENT_PLAN`: blogs/reels/social plan
- `ACTION_ITEM`: owner assignments from CEO review
- `COMPLIANCE`: input discipline and workboard completion

## Recommended filters
- Filter by `record_type = ACTION_ITEM` for weekly execution meeting.
- Filter by `record_type = CAMPAIGN_DECISION` for media review.
- Filter by `record_type = CONTENT_PLAN` for writer/social calendar.
- Filter by `center` for center-specific action calls.

## Required fields each week
- `week_start`, `week_end`
- `metric_value`
- `owner`, `due_date`, `status` for action rows
- `decision` for campaign rows

## Status values (standardize)
Use only:
- `planned`
- `open`
- `in_progress`
- `done`
- `blocked`

## Decision values (standardize)
Use only:
- `SCALE`
- `FIX`
- `PAUSE`

## Governance rule
If owner/due date/status is blank for an `ACTION_ITEM`, it is treated as not approved.

