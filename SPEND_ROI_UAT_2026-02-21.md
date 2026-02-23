# Spend + ROI UAT Script (Production)
Date: 2026-02-21
Site: https://santaan.in
Admin: https://santaan.in/admin/dashboard

## 1) Objective
Validate that campaign spend logging is live and that CEO/Analytics ROI metrics are computed from real data.

## 2) Team Roles for UAT
1. Marketing Ops (owner): logs spend rows.
2. CRM Lead (owner): updates contact statuses for conversion.
3. CEO/Admin (reviewer): validates KPI and actionability.

## 3) Preconditions
1. Admin user can sign in.
2. Existing leads are visible in Admin CRM.
3. UTM campaigns used in leads are known.

## 4) Test Dataset (use exactly)
Use one campaign name that already appears in contact attribution, or create test leads first.

Recommended campaign IDs:
1. `uat_meta_bbsr_ivf_20260221`
2. `uat_google_brh_iui_20260221`
3. `uat_meta_blr_pcos_20260221`

## 5) Step-by-step UAT

### A. Verify deploy + auth guard
1. Open `https://santaan.in/admin/dashboard` in incognito.
Expected: redirected to `/login`.

### B. Spend entry create
1. Login as admin.
2. Go to `Admin Dashboard -> Spend` tab.
3. Add row:
- Date: today
- Channel: `meta`
- UTM Campaign: `uat_meta_bbsr_ivf_20260221`
- Center: `bhubaneswar`
- Asset: `reel_v1`
- Amount: `5000`
4. Save.
Expected:
- success message shown.
- row appears in spend table.
- total spend increases by INR 5,000.

### C. Spend entry edit
1. Edit same row amount from `5000` to `6500`.
Expected:
- row updates.
- total spend updates accordingly.

### D. Spend entry delete
1. Delete the row.
Expected:
- row removed.
- total spend reduces.

### E. ROI linkage validation (critical)
1. Ensure at least 3 leads exist with `utm_campaign=uat_meta_bbsr_ivf_20260221`.
2. Mark at least 1 of those leads as `converted` in CRM table (edit contact).
3. Re-add spend row for same campaign with amount `6000`.
4. Open `Analytics` tab.
Expected:
- Campaign Performance table shows this campaign.
- Spend column shows ~INR 6,000.
- CPL = spend / leads.
- CPP shown if conversions > 0.

### F. CEO dashboard validation
1. Open `CEO Command` tab.
Expected:
- KPI cards show `Logged Spend`, `Cost Per Lead`, `Cost Per Patient`.
- Channel ROI table includes spend and CPP.
- Asset ROI table includes spend and CPP.

### G. Negative test: campaign mismatch
1. Add spend with typo campaign name, e.g. `uat_meta_bbsr_ivf_20260221_typo`.
2. Keep leads on correct campaign name.
Expected:
- spend does not map to original campaign metrics.
- this confirms strict mapping by exact `utm_campaign` string.

## 6) Pass Criteria
1. Spend CRUD works in production.
2. Analytics shows financial metrics from spend rows.
3. CEO Command shows spend-aware KPIs.
4. Campaign mapping is deterministic and exact.
5. No 500 errors during save/edit/delete.

## 7) Known Rules (must follow in operations)
1. Marketing Ops enters spend daily.
2. CEO does not do spend data entry.
3. `utm_campaign` values must be identical across ad links and spend logs.
4. If no conversion exists, CPP will be blank/`-` by design.

## 8) Quick rollback plan
If issue found:
1. Stop using Spend tab.
2. Keep lead operations running as usual.
3. Report failing step + timestamp + screenshot + campaign id.

