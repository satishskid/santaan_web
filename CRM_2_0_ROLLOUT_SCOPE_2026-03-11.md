# Santaan CRM 2.0 Rollout Scope
Date: March 11, 2026

## What is live in code now
1. Content Intelligence module inside CRM
- manual content asset registry for reels, social posts, landing pages, FAQs, emailers, ad copy
- automatic website blog inventory from existing `blog_posts`
- feedback intake for telecaller, counselor, review, agency, search, social, WhatsApp, field, and manual sources
- opportunity board that ranks gaps vs refresh targets
- GA4 content page demand block
- review-theme signals feeding content planning

2. Reviews module
- manual review logging
- CSV import/export
- Google review sync groundwork
- featured review tracking and response ownership

3. Existing stable modules remain unchanged
- Spend
- Ops Inputs
- Analytics
- CEO Command
- Workboard
- Daily Command

## What this gives Santaan immediately
- writers and agency can stop choosing topics blindly
- telecaller and counselor objections can be converted into content backlog
- review themes can feed SEO, landing pages, ad copy, and reel hooks
- CEO can see whether the content team is publishing against real demand

## What still needs external activation
### NeoDove layer
Santaan must finalize:
- source bucket naming
- campaign list and campaign IDs
- telecaller ownership sheet
- universal stage list
- lost reason list
- number-to-campaign mapping
- webhook approval and secret

### WhatsApp layer
Santaan must finalize:
- BhashSMS / Meta-certified WhatsApp sender mapping
- template names for welcome, missed-call rescue, and follow-up
- ownership of inbound WhatsApp routing

### Review / search layer
For full Google review and search keyword automation:
- Google Business Profile OAuth credentials
- GBP location map by center
- Search Console access if search query sync is desired later

## Recommended rollout order
1. Keep current CRM operational as-is
2. UAT Content Intelligence with agency + writers + counselor lead
3. Finalize NeoDove operating structure
4. Turn on NeoDove webhook shadow mode
5. Validate campaign/center/source mapping in CRM
6. Reduce manual reporting only after attribution is proven stable

## Operating rule
CRM 2.0 is additive. Nothing should replace current production reporting until:
- mapping is deterministic
- webhook payloads are stable
- team follows the agreed SLA for at least 7 days
