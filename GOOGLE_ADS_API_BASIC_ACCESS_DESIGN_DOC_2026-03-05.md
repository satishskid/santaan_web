# Santaan CRM - Google Ads API Design Documentation (Basic Access)

**Version:** 1.0  
**Date:** March 5, 2026  
**Owner:** Santaan Fertility Clinic  
**Primary Contact:** santaan.social@gmail.com  
**Website:** https://santaan.in

## 1. Purpose
Santaan operates a centralized Growth OS and CRM for fertility patient acquisition and conversion management across multiple centers (Bhubaneswar, Berhampur, Bangalore, Angul).

This Google Ads API integration is required to:
1. Pull daily campaign performance and spend from Santaan-owned Google Ads accounts.
2. Standardize campaign-level ROI reporting inside Santaan CRM.
3. Give CEO and operations teams one source of truth for channel performance and action decisions.

## 2. Business Use Case
Current execution uses multiple tools (Google Ads UI, Meta Ads, NeoDove telecalling CRM, field inputs). This causes fragmented decision-making.

Google Ads API data will be used in Santaan CRM to answer:
1. Which campaigns generate qualified leads and registrations?
2. What is CPL/CPA/Cost per Registration per campaign, center, and day?
3. Which campaigns should be scaled, paused, or fixed weekly?

## 3. Scope of API Usage
### 3.1 In Scope
1. Read campaign/ad-group/ad level performance data.
2. Read cost/spend and engagement metrics by date.
3. Read account-level metadata for mapping to Santaan center and campaign taxonomy.

### 3.2 Out of Scope (Current Phase)
1. No third-party resale or redistribution of Google Ads data.
2. No customer list uploads.
3. No external-client account management.
4. No app conversion tracking or remarketing API workflows in this phase.

## 4. Users and Access Model
### 4.1 Users
1. Internal Santaan leadership (CEO, CRM Ops Admin).
2. Internal marketing operations.
3. Internal telecalling/counseling leadership via dashboard outputs.
4. Authorized agency partner (restricted operational role, no secret ownership).

### 4.2 Access Principle
1. Santaan owns credentials and tokens.
2. Least-privilege access for all users.
3. Agency operates campaigns via granted account access; core API credentials remain with Santaan.

## 5. Technical Architecture
### 5.1 Components
1. **Frontend:** Next.js admin dashboard (`/admin/dashboard`) on Netlify.
2. **Backend APIs:** Next.js server routes (Node runtime).
3. **Database:** Turso (LibSQL).
4. **CRM Modules:** Contacts, Spend, Ops Inputs, CEO Command, Channel/Campaign ROI.

### 5.2 Data Pipeline
1. Scheduled/triggered backend job calls Google Ads API.
2. Response normalized into Santaan campaign schema (`utm_campaign`, center, date).
3. Stored in CRM spend/performance tables.
4. KPI engine computes CPL/CPA/Cost per Registration.
5. CEO dashboard surfaces actionable alerts and owner assignments.

## 6. Data Fields Consumed
Typical fields consumed per campaign/day:
1. `customer.id`
2. `campaign.id`, `campaign.name`, `campaign.status`
3. `segments.date`
4. `metrics.impressions`
5. `metrics.clicks`
6. `metrics.cost_micros`
7. `metrics.conversions` (where configured)
8. Optional: `metrics.conversions_value`, `metrics.ctr`

## 7. Frequency and Volume
1. Daily pull for prior-day finalized reporting.
2. Optional intra-day refresh for monitoring.
3. Expected scale: low to moderate volume (single organization use, not bulk multi-tenant SaaS).

## 8. Security and Compliance
1. Credentials stored as encrypted environment variables in Netlify.
2. No secrets hardcoded in source code.
3. Internal role-based access control (RBAC) on CRM admin APIs.
4. API usage restricted to Santaan-owned accounts and authorized operations.
5. Auditability through CRM logs and campaign-level traceability.

## 9. Privacy and Data Handling
1. Only campaign performance and operational attribution data are consumed.
2. Data is used exclusively for Santaan’s internal decision-making.
3. No unauthorized sharing of Google Ads data with external parties.
4. Retention and access follow internal operational governance.

## 10. Operational Controls
1. UTM enforcement in all paid links for clean attribution.
2. Daily spend and campaign checks by marketing operations.
3. Weekly executive review of ROI and leak points.
4. SLA-driven action tracking per owner (marketing, IVR, counseling, field).

## 11. Why Basic Access Is Needed
Explorer access is insufficient for production-grade automated reporting required by Santaan Growth OS.

Basic access is required to:
1. Reliably pull campaign metrics at operational scale.
2. Reduce manual reporting errors and delays.
3. Enable consistent daily CEO-level ROI monitoring and weekly action plans.

## 12. Deployment and Rollout Plan
### Phase 1 (Completed)
1. CRM architecture and ROI modules deployed.
2. Meta sync + GA4 API integration completed.
3. Input pipelines for field/TV/agency established.

### Phase 2 (Current)
1. Enable Google Ads API production integration with Basic access.
2. Automate Google spend and campaign import.
3. Validate KPI parity with Google Ads UI reports.

### Phase 3
1. Full cross-channel ROI automation (Meta + Google + offline).
2. Weekly predictive alerting and executive action queues.

## 13. Responsible Use Statement
Santaan confirms this API usage is for first-party internal operations and reporting for its own advertising accounts. Santaan will comply with Google Ads API Terms and applicable data protection requirements.

---

## Appendix A - Suggested Form Responses (Copy/Paste)

### "What are you trying to build?"
We are building an internal Growth OS and CRM dashboard for Santaan Fertility Clinic to automate Google Ads campaign performance reporting, spend attribution, and ROI analytics (CPL/CPA/Cost per Registration) across our own centers.

### "How will the API be used?"
The API will be used in read/reporting mode to pull campaign metrics (impressions, clicks, spend, conversions) by date and campaign, then map this to internal CRM lead and registration data for executive decision-making.

### "Who will access this tool?"
Internal Santaan users (CEO, CRM Ops, marketing team) and a restricted authorized agency operator. Santaan owns credentials and controls access.

### "Will you use this token for App Conversion Tracking and Remarketing API?"
No, not in the current phase.

### "Will you use your token with a tool developed by someone else?"
No. The tool is internally developed and operated by Santaan.
