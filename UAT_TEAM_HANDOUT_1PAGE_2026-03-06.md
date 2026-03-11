# Santaan CRM UAT Team Handout (1-Page)
Date: March 6, 2026  
UAT Window: Day-1 + Day-2  
UAT CRM URL: `https://santaan-web.vercel.app/login`

## 1) Login Credentials (Temporary)
Password for all: `sant_growth26`

1. CEO/Admin: `ceo.crmops@santaan.in`
2. Agency Ops: `santaandigital.ops@santaan.in`
3. Field BBSR: `field.bhubaneswar@santaan.in`
4. Field BER: `field.berhampur@santaan.in`
5. Field BLR: `field.bangalore@santaan.in`
6. IVR Lead: `ivr.lead@santaan.in`
7. Telecaller 1: `telecaller.1@santaan.in`
8. Telecaller 2: `telecaller.2@santaan.in`
9. Telecaller 3: `telecaller.3@santaan.in`
10. Counselor BBSR: `counselor.bhubaneswar@santaan.in`
11. Counselor BER: `counselor.berhampur@santaan.in`
12. Counselor BLR: `counselor.bangalore@santaan.in`

## 2) Day-1 Checklist (Functional UAT)
Time: 9:00 AM to 7:00 PM

1. All roles: login and verify role tabs.
2. Agency Ops: add 2 rows in `Ops Inputs -> Agency`, add 2 rows in `Spend`.
3. Field team: each center adds 1 row in `Ops Inputs -> Field Activities`.
4. IVR/Telecaller: update minimum 5 leads (`status`, `outcome`, `next follow-up`).
5. Counselor: update minimum 2 qualified leads per center.
6. CEO/Admin: check `CEO Command` and assign actions for missing updates.

Pass = all updates saved and visible after refresh.

## 3) Day-2 Checklist (Operational UAT)
Time: 9:00 AM to 7:00 PM

1. SLA simulation: create one delay case and close it with action note.
2. Agency Ops: update spend by 11:00 AM and run campaign correction note.
3. IVR + Counselor: close all qualified leads or schedule next follow-up.
4. CEO/Admin: review `Total Spend`, `Cost/Patient`, pending follow-ups, action queue.
5. Final sign-off: mark issues as P0/P1/P2 and decide Go/Conditional Go/Hold.

Go condition = no open P0/P1 by Day-2 close.

## 4) What Each Role Must Update (Mandatory)
1. Telecaller: status, last contact, call outcome, next follow-up, lost reason.
2. IVR Lead: queue review notes and SLA breaches.
3. Counselor: qualified to consult/converted/lost with reason.
4. Field Exec: activity log with center + location + tracking handle.
5. Agency Ops: campaign + spend + UTM discipline note.
6. CEO/Admin: owner assignment for every red flag.

## 5) Defect Priority
1. P0: login/save/security issue
2. P1: wrong role access or wrong KPI display
3. P2: validation/copy/UI friction

## 6) Reporting Format (Use shared sheet)
Columns:
1. Date
2. Role
3. Module
4. Action
5. Expected
6. Actual
7. Pass/Fail
8. Screenshot link
9. Owner
10. ETA

## 7) Escalation
1. Functional blocker: CEO/Admin (`ceo.crmops@santaan.in`)
2. Data/input blocker: Agency Ops + CRM Ops Admin
3. Login blocker: CRM Ops Admin

Security note: reset all temporary passwords on Day-3 morning.

---

## WhatsApp Broadcast Version (Copy-Paste)
Team, Santaan CRM UAT starts today for 2 days.  
Login URL: https://santaan-web.vercel.app/login  
Temporary password (all users): sant_growth26  

Day-1: login check + role-wise data entry + CEO review.  
Day-2: SLA simulation + spend/ROI validation + final sign-off.  

Mandatory: if not updated in CRM, it is treated as not done.  
Please update your module and mark completion in shared UAT sheet with screenshot evidence.
